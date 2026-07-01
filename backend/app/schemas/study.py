"""
TaskForge AI — Study Schemas
"""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import date, datetime


class StudyPlanCreate(BaseModel):
    subject: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    total_hours: int = 0


class StudyPlanUpdate(BaseModel):
    subject: str | None = None
    description: str | None = None
    progress_pct: float | None = None
    total_hours: int | None = None


class StudyPlanResponse(BaseModel):
    id: UUID
    subject: str
    description: str | None
    schedule: dict | None
    progress_pct: float
    total_hours: int
    created_at: datetime

    model_config = {"from_attributes": True}


class StudySessionCreate(BaseModel):
    topic: str = Field(..., min_length=1, max_length=500)
    duration_minutes: int = 30
    session_date: date
    notes_summary: str | None = None


class StudySessionResponse(BaseModel):
    id: UUID
    topic: str
    duration_minutes: int
    notes_summary: str | None
    completed: bool
    session_date: date

    model_config = {"from_attributes": True}


class QuizGenerate(BaseModel):
    topic: str = Field(..., min_length=1, max_length=500)
    num_questions: int = Field(5, ge=1, le=20)


class QuizResponse(BaseModel):
    id: UUID
    topic: str
    questions: list
    score: int | None
    total: int
    taken_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class QuizSubmit(BaseModel):
    answers: list[dict]
