"""
TaskForge AI — Task Schemas
"""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime
from app.models.task import TaskStatus, TaskPriority, TaskColumn


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    priority: TaskPriority = TaskPriority.MEDIUM
    column: TaskColumn = TaskColumn.TODO
    due_date: date | None = None
    estimated_minutes: int | None = None
    goal_id: UUID | None = None
    tags: list[str] = []


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    priority: TaskPriority | None = None
    column: TaskColumn | None = None
    position: int | None = None
    due_date: date | None = None
    estimated_minutes: int | None = None
    tags: list[str] | None = None


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    status: TaskStatus
    priority: TaskPriority
    column: TaskColumn
    position: int
    due_date: date | None
    estimated_minutes: int | None
    goal_id: UUID | None
    tags: list | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskReorder(BaseModel):
    task_id: UUID
    column: TaskColumn
    position: int
