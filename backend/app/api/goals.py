"""
TaskForge AI — Goals API Routes
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUser, DbSession
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse, MilestoneCreate, MilestoneResponse, MilestoneUpdate
from app.models.goal import Goal, Milestone

router = APIRouter(prefix="/api/goals", tags=["Goals"])


@router.get("", response_model=list[GoalResponse])
async def list_goals(current_user: CurrentUser, db: DbSession):
    """List all goals for the current user."""
    result = await db.execute(
        select(Goal)
        .where(Goal.user_id == current_user.id)
        .options(selectinload(Goal.milestones))
        .order_by(Goal.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(data: GoalCreate, current_user: CurrentUser, db: DbSession):
    """Create a new goal with optional milestones."""
    goal = Goal(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        priority=data.priority,
        deadline=data.deadline,
    )
    db.add(goal)
    await db.flush()

    for i, m in enumerate(data.milestones):
        milestone = Milestone(
            goal_id=goal.id,
            title=m.title,
            target_date=m.target_date,
            order_index=m.order_index or i,
        )
        db.add(milestone)

    await db.flush()
    await db.refresh(goal, attribute_names=["milestones"])
    return goal


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(goal_id: UUID, current_user: CurrentUser, db: DbSession):
    """Get a specific goal."""
    result = await db.execute(
        select(Goal)
        .where(Goal.id == goal_id, Goal.user_id == current_user.id)
        .options(selectinload(Goal.milestones))
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(goal_id: UUID, data: GoalUpdate, current_user: CurrentUser, db: DbSession):
    """Update a goal."""
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
        .options(selectinload(Goal.milestones))
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)

    await db.flush()
    await db.refresh(goal)
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(goal_id: UUID, current_user: CurrentUser, db: DbSession):
    """Delete a goal and its milestones."""
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    await db.delete(goal)


@router.post("/{goal_id}/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
async def add_milestone(goal_id: UUID, data: MilestoneCreate, current_user: CurrentUser, db: DbSession):
    """Add a milestone to a goal."""
    result = await db.execute(
        select(Goal).where(Goal.id == goal_id, Goal.user_id == current_user.id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    milestone = Milestone(goal_id=goal.id, title=data.title, target_date=data.target_date, order_index=data.order_index)
    db.add(milestone)
    await db.flush()
    await db.refresh(milestone)
    return milestone


@router.put("/{goal_id}/milestones/{milestone_id}", response_model=MilestoneResponse)
async def update_milestone(goal_id: UUID, milestone_id: UUID, data: MilestoneUpdate, current_user: CurrentUser, db: DbSession):
    """Update a milestone."""
    result = await db.execute(
        select(Milestone).join(Goal).where(
            Milestone.id == milestone_id,
            Goal.id == goal_id,
            Goal.user_id == current_user.id,
        )
    )
    milestone = result.scalar_one_or_none()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(milestone, field, value)

    await db.flush()
    await db.refresh(milestone)
    return milestone
