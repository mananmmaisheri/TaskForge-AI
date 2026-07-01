"""
TaskForge AI — Calendar Schemas
"""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from app.models.calendar_event import EventType


class EventCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    start_time: datetime
    end_time: datetime
    event_type: EventType = EventType.OTHER
    color: str | None = None
    is_recurring: bool = False
    recurrence_rule: dict | None = None
    reminders: list[dict] = []


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    event_type: EventType | None = None
    color: str | None = None


class EventResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    start_time: datetime
    end_time: datetime
    event_type: EventType
    color: str | None
    is_recurring: bool
    created_at: datetime

    model_config = {"from_attributes": True}
