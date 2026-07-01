"""
TaskForge AI — Goal & Milestone Schemas
"""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from typing import Optional
from app.models.goal import GoalStatus, Priority


class MilestoneCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    target_date: date | None = None
    order_index: int = 0


class MilestoneResponse(BaseModel):
    id: UUID
    title: str
    completed: bool
    target_date: date | None
    order_index: int

    model_config = {"from_attributes": True}


class MilestoneUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None
    target_date: date | None = None


class GoalCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    priority: Priority = Priority.MEDIUM
    deadline: date | None = None
    milestones: list[MilestoneCreate] = []


class GoalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: GoalStatus | None = None
    priority: Priority | None = None
    deadline: date | None = None


class GoalResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    status: GoalStatus
    priority: Priority
    deadline: date | None
    milestones: list[MilestoneResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
