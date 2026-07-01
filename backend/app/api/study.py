"""
TaskForge AI — Study API Routes
"""

from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, DbSession
from app.schemas.study import (
    StudyPlanCreate, StudyPlanUpdate, StudyPlanResponse,
    StudySessionCreate, StudySessionResponse,
    QuizGenerate, QuizResponse, QuizSubmit,
)
from app.models.study import StudyPlan, StudySession, Quiz

router = APIRouter(prefix="/api/study", tags=["Study"])


# ── Study Plans ──────────────────────────────────────────

@router.get("/plans", response_model=list[StudyPlanResponse])
async def list_plans(current_user: CurrentUser, db: DbSession):
    result = await db.execute(
        select(StudyPlan).where(StudyPlan.user_id == current_user.id).order_by(StudyPlan.created_at.desc())
    )
    return result.scalars().all()


@router.post("/plans", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(data: StudyPlanCreate, current_user: CurrentUser, db: DbSession):
    plan = StudyPlan(
        user_id=current_user.id,
        subject=data.subject,
        description=data.description,
        total_hours=data.total_hours,
    )
    db.add(plan)
    await db.flush()
    await db.refresh(plan)
    return plan


@router.put("/plans/{plan_id}", response_model=StudyPlanResponse)
async def update_plan(plan_id: UUID, data: StudyPlanUpdate, current_user: CurrentUser, db: DbSession):
    result = await db.execute(
        select(StudyPlan).where(StudyPlan.id == plan_id, StudyPlan.user_id == current_user.id)
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)

    await db.flush()
    await db.refresh(plan)
    return plan


@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(plan_id: UUID, current_user: CurrentUser, db: DbSession):
    result = await db.execute(
        select(StudyPlan).where(StudyPlan.id == plan_id, StudyPlan.user_id == current_user.id)
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")
    await db.delete(plan)


# ── Study Sessions ───────────────────────────────────────

@router.post("/plans/{plan_id}/sessions", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(plan_id: UUID, data: StudySessionCreate, current_user: CurrentUser, db: DbSession):
    # Verify ownership
    result = await db.execute(
        select(StudyPlan).where(StudyPlan.id == plan_id, StudyPlan.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Study plan not found")

    session = StudySession(
        plan_id=plan_id,
        topic=data.topic,
        duration_minutes=data.duration_minutes,
        session_date=data.session_date,
        notes_summary=data.notes_summary,
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return session


@router.get("/plans/{plan_id}/sessions", response_model=list[StudySessionResponse])
async def list_sessions(plan_id: UUID, current_user: CurrentUser, db: DbSession):
    result = await db.execute(
        select(StudyPlan).where(StudyPlan.id == plan_id, StudyPlan.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Study plan not found")

    result = await db.execute(
        select(StudySession).where(StudySession.plan_id == plan_id).order_by(StudySession.session_date)
    )
    return result.scalars().all()


# ── Quizzes ──────────────────────────────────────────────

@router.post("/plans/{plan_id}/quiz/generate", response_model=QuizResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(plan_id: UUID, data: QuizGenerate, current_user: CurrentUser, db: DbSession):
    """Generate an AI quiz (demo mode returns sample questions)."""
    result = await db.execute(
        select(StudyPlan).where(StudyPlan.id == plan_id, StudyPlan.user_id == current_user.id)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Study plan not found")

    # Demo quiz questions (in production, this would call the Study Agent)
    sample_questions = [
        {
            "id": i + 1,
            "question": f"Sample question {i + 1} about {data.topic}?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct": 0,
        }
        for i in range(data.num_questions)
    ]

    quiz = Quiz(
        plan_id=plan_id,
        topic=data.topic,
        questions=sample_questions,
        total=data.num_questions,
    )
    db.add(quiz)
    await db.flush()
    await db.refresh(quiz)
    return quiz


@router.post("/quiz/{quiz_id}/submit", response_model=QuizResponse)
async def submit_quiz(quiz_id: UUID, data: QuizSubmit, current_user: CurrentUser, db: DbSession):
    """Submit quiz answers and compute score."""
    result = await db.execute(
        select(Quiz).join(StudyPlan).where(Quiz.id == quiz_id, StudyPlan.user_id == current_user.id)
    )
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Score calculation
    score = 0
    for answer in data.answers:
        q_id = answer.get("question_id")
        selected = answer.get("selected")
        for q in quiz.questions:
            if q.get("id") == q_id and q.get("correct") == selected:
                score += 1

    quiz.score = score
    quiz.taken_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(quiz)
    return quiz
