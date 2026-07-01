"""
TaskForge AI — Multi-Agent Memory & Context Service
Handles short-term conversation turns, long-term user profile/goal context,
and shared blackboard memory across collaborating sub-agents.
"""

import logging
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.agent_log import ChatSession, Message, MessageRole
from app.models.user import User
from app.models.goal import Goal
from app.models.task import Task
from app.models.study import StudyPlan

logger = logging.getLogger("taskforge.memory")


class AgentSharedMemory:
    """
    Shared blackboard memory for a single multi-agent conversation turn.
    Allows collaborating sub-agents (Planner, Study, TaskManager, Scheduler)
    to share intermediate outputs and context without loss of information.
    """
    def __init__(self, session_id: str, user_id: str):
        self.session_id = session_id
        self.user_id = user_id
        self.blackboard: Dict[str, Any] = {}
        self.execution_trail: List[Dict[str, Any]] = []

    def put_context(self, key: str, value: Any, source_agent: str):
        self.blackboard[key] = value
        self.execution_trail.append({
            "agent": source_agent,
            "action": f"put_context:{key}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"[{source_agent}] added '{key}' to shared memory.")

    def get_context(self, key: str, default: Any = None) -> Any:
        return self.blackboard.get(key, default)

    def get_full_blackboard_summary(self) -> str:
        if not self.blackboard:
            return "No intermediate agent results yet."
        summary_lines = []
        for k, v in self.blackboard.items():
            summary_lines.append(f"• **{k}**: {str(v)[:300]}...")
        return "\n".join(summary_lines)


class MemoryService:
    """
    Manages persistence of conversation turns and retrieval of long-term user context.
    """
    @staticmethod
    async def get_or_create_session(user_id: UUID, session_id: Optional[UUID], db: AsyncSession, title: str = "New Chat") -> ChatSession:
        if session_id:
            res = await db.execute(select(ChatSession).where(ChatSession.id == session_id, ChatSession.user_id == user_id))
            session = res.scalar_one_or_none()
            if session:
                return session

        new_session = ChatSession(user_id=user_id, title=title)
        db.add(new_session)
        await db.flush()
        await db.refresh(new_session)
        return new_session

    @staticmethod
    async def add_message(session_id: UUID, role: MessageRole, content: str, db: AsyncSession, metadata: Optional[Dict[str, Any]] = None) -> Message:
        msg = Message(
            session_id=session_id,
            role=role,
            content=content,
            agent_metadata=metadata or {}
        )
        db.add(msg)
        await db.flush()
        await db.refresh(msg)
        return msg

    @staticmethod
    async def get_short_term_history(session_id: UUID, db: AsyncSession, limit: int = 15) -> List[Dict[str, str]]:
        """Retrieve recent messages formatted for LLM context."""
        res = await db.execute(
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )
        messages = list(reversed(res.scalars().all()))
        return [
            {"role": msg.role.value, "content": msg.content}
            for msg in messages
        ]

    @staticmethod
    async def get_long_term_user_context(user_id: UUID, db: AsyncSession) -> Dict[str, Any]:
        """Fetch user profile, active goals, pending tasks, and study plans."""
        # User profile
        u_res = await db.execute(select(User).where(User.id == user_id))
        user = u_res.scalar_one_or_none()

        # Goals
        g_res = await db.execute(
            select(Goal)
            .where(Goal.user_id == user_id)
            .options(selectinload(Goal.milestones))
            .limit(5)
        )
        goals = g_res.scalars().all()

        # Tasks
        t_res = await db.execute(
            select(Task)
            .where(Task.user_id == user_id, Task.column != "done")
            .limit(8)
        )
        tasks = t_res.scalars().all()

        # Study plans
        s_res = await db.execute(select(StudyPlan).where(StudyPlan.user_id == user_id).limit(3))
        study_plans = s_res.scalars().all()

        return {
            "user": {
                "name": user.full_name if user else "User",
                "email": user.email if user else "",
                "preferences": user.preferences if user else {}
            },
            "active_goals_count": len(goals),
            "goals_summary": [
                {"title": g.title, "priority": g.priority, "milestones": len(g.milestones)}
                for g in goals
            ],
            "pending_tasks_count": len(tasks),
            "tasks_summary": [
                {"title": t.title, "priority": t.priority, "due": t.due_date.isoformat() if t.due_date else "none"}
                for t in tasks
            ],
            "study_plans_summary": [
                {"subject": sp.subject, "total_hours": sp.total_hours}
                for sp in study_plans
            ]
        }
