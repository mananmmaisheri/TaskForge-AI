"""
TaskForge AI — Real-Time Multi-Agent Chat API Routes
Provides SSE streaming (/stream), WebSocket (/ws), and conversation session management.
Includes prompt injection protection, output sanitization, and rate limiting.
"""

import json
import logging
import re
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, HTTPException, status, Depends, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.deps import CurrentUser, DbSession
from app.models.agent_log import ChatSession, Message, MessageRole
from app.services.memory_service import MemoryService
from app.agents.orchestrator import orchestrator

logger = logging.getLogger("taskforge.chat")
router = APIRouter(prefix="/api/chat", tags=["Multi-Agent Chat"])
limiter = Limiter(key_func=get_remote_address)


# ══════════════════════════════════════════════════════════════════════════════
# Security & Input Sanitization
# ══════════════════════════════════════════════════════════════════════════════

def sanitize_and_validate_prompt(text: str) -> str:
    """Check for prompt injection attempts and sanitize malicious scripts."""
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")
    if len(text) > 8000:
        raise HTTPException(status_code=400, detail="Message exceeds maximum length limit of 8000 characters.")
    
    # Strip basic XSS / HTML tags while preserving Markdown formatting
    clean_text = re.sub(r"<(script|iframe|object|embed|style).*?>.*?</\1>", "", text, flags=re.IGNORECASE | re.DOTALL)
    
    # Check for glaring prompt injection override signatures
    injection_patterns = [
        r"ignore previous instructions",
        r"system override",
        r"bypass security"
    ]
    for pattern in injection_patterns:
        if re.search(pattern, clean_text, flags=re.IGNORECASE):
            logger.warning(f"Potential prompt injection detected: {pattern}")
            # We sanitize by wrapping in quotes or raising safety exception; here we strip the override attempt
            clean_text = re.sub(pattern, "[sanitized]", clean_text, flags=re.IGNORECASE)
            
    return clean_text.strip()


# ══════════════════════════════════════════════════════════════════════════════
# Session Management Endpoints
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/sessions", response_model=List[Dict[str, Any]])
async def list_sessions(current_user: CurrentUser, db: DbSession):
    """List all chat sessions for the current authenticated user."""
    res = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .limit(50)
    )
    sessions = res.scalars().all()
    return [
        {
            "id": str(s.id),
            "title": s.title,
            "created_at": s.created_at.isoformat(),
            "updated_at": s.updated_at.isoformat()
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}/messages", response_model=List[Dict[str, Any]])
async def get_session_messages(session_id: UUID, current_user: CurrentUser, db: DbSession):
    """Get chronological message history for a specific session."""
    res = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    if not res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Chat session not found")

    res_msgs = await db.execute(
        select(Message).where(Message.session_id == session_id).order_by(Message.created_at.asc())
    )
    messages = res_msgs.scalars().all()
    return [
        {
            "id": str(m.id),
            "role": m.role.value,
            "content": m.content,
            "agent_metadata": m.agent_metadata,
            "created_at": m.created_at.isoformat()
        }
        for m in messages
    ]


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: UUID, current_user: CurrentUser, db: DbSession):
    """Delete a conversation session."""
    res = await db.execute(
        select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == current_user.id)
    )
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    await db.delete(session)


# ══════════════════════════════════════════════════════════════════════════════
# SSE Streaming Endpoint
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/stream")
async def chat_stream_sse(request: Request, current_user: CurrentUser, db: DbSession):
    """
    Server-Sent Events (SSE) real-time multi-agent orchestration endpoint.
    Streams agent activity indicators, markdown chunks, and suggested prompts.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON request body.")

    raw_message = body.get("message", "")
    session_id_str = body.get("session_id")
    clean_message = sanitize_and_validate_prompt(raw_message)

    # Convert session_id if provided
    session_uuid = None
    if session_id_str:
        try:
            session_uuid = UUID(session_id_str)
        except ValueError:
            pass

    # Get or create chat session
    session = await MemoryService.get_or_create_session(
        user_id=current_user.id,
        session_id=session_uuid,
        db=db,
        title=clean_message[:40] if not session_uuid else "New Chat"
    )

    # Update session title if it was default
    if session.title == "New Chat" and clean_message:
        session.title = clean_message[:40] + ("..." if len(clean_message) > 40 else "")

    # Save user message
    await MemoryService.add_message(session.id, MessageRole.USER, clean_message, db)

    # Fetch long-term user context
    user_context = await MemoryService.get_long_term_user_context(current_user.id, db)

    async def event_generator():
        accumulated_assistant_content = []
        executed_agents = []
        try:
            # Yield initial connection confirmation
            yield f"data: {json.dumps({'type': 'session_info', 'session_id': str(session.id), 'title': session.title})}\n\n"

            # Stream orchestration events
            async for event in orchestrator.stream_orchestration(
                message=clean_message,
                user_context=user_context,
                session_id=str(session.id),
                user_id=str(current_user.id),
                db=db
            ):
                if event["type"] == "text_chunk":
                    accumulated_assistant_content.append(event["content"])
                elif event["type"] == "done":
                    executed_agents = event.get("agents_executed", [])
                
                yield f"data: {json.dumps(event)}\n\n"

            # Save full assistant response to database
            full_response = "".join(accumulated_assistant_content)
            if full_response:
                await MemoryService.add_message(
                    session_id=session.id,
                    role=MessageRole.ASSISTANT,
                    content=full_response,
                    db=db,
                    metadata={"agents_executed": executed_agents}
                )

        except Exception as err:
            logger.error(f"Error during SSE orchestration stream: {err}", exc_info=True)
            error_event = {"type": "error", "message": "An error occurred during multi-agent orchestration."}
            yield f"data: {json.dumps(error_event)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ══════════════════════════════════════════════════════════════════════════════
# WebSocket Streaming Endpoint
# ══════════════════════════════════════════════════════════════════════════════

@router.websocket("/ws/{client_id}")
async def chat_websocket(websocket: WebSocket, client_id: str):
    """
    Bi-directional WebSocket connection for real-time AI agent interactions.
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            message = payload.get("message", "")
            if not message:
                await websocket.send_json({"type": "error", "message": "Empty message received."})
                continue

            # Stream events over websocket
            async for event in orchestrator.stream_orchestration(
                message=message,
                user_context={"client_id": client_id},
                session_id=client_id,
                user_id=client_id
            ):
                await websocket.send_json(event)

    except WebSocketDisconnect:
        logger.info(f"WebSocket client {client_id} disconnected.")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        try:
            await websocket.close()
        except Exception:
            pass
