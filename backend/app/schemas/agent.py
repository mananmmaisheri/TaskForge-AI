"""
TaskForge AI — Agent Schemas
"""

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.agent_log import AgentStatus


class AgentStatusResponse(BaseModel):
    name: str
    description: str
    status: str
    last_active: datetime | None = None
    total_executions: int = 0


class AgentLogResponse(BaseModel):
    id: UUID
    agent_name: str
    action: str
    input_data: dict | None
    output_data: dict | None
    latency_ms: float | None
    status: AgentStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class AgentInvoke(BaseModel):
    agent_name: str
    message: str


class ChatMessage(BaseModel):
    content: str
    session_id: UUID | None = None
