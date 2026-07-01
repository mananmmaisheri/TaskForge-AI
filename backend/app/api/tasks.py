"""
TaskForge AI — Tasks API Routes (Kanban)
"""

from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskReorder
from app.models.task import Task

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=list[TaskResponse])
async def list_tasks(current_user: CurrentUser, db: DbSession):
    """List all tasks for the current user, ordered by column and position."""
    result = await db.execute(
        select(Task)
        .where(Task.user_id == current_user.id)
        .order_by(Task.column, Task.position)
    )
    return result.scalars().all()


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(data: TaskCreate, current_user: CurrentUser, db: DbSession):
    """Create a new task."""
    # Get next position in the column
    result = await db.execute(
        select(Task)
        .where(Task.user_id == current_user.id, Task.column == data.column)
        .order_by(Task.position.desc())
    )
    last_task = result.scalars().first()
    next_position = (last_task.position + 1) if last_task else 0

    task = Task(
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        priority=data.priority,
        column=data.column,
        position=next_position,
        due_date=data.due_date,
        estimated_minutes=data.estimated_minutes,
        goal_id=data.goal_id,
        tags=data.tags,
    )
    db.add(task)
    await db.flush()
    await db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: UUID, current_user: CurrentUser, db: DbSession):
    """Get a specific task."""
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: UUID, data: TaskUpdate, current_user: CurrentUser, db: DbSession):
    """Update a task."""
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    await db.flush()
    await db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: UUID, current_user: CurrentUser, db: DbSession):
    """Delete a task."""
    result = await db.execute(
        select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await db.delete(task)


@router.put("/reorder/batch", response_model=list[TaskResponse])
async def reorder_tasks(updates: list[TaskReorder], current_user: CurrentUser, db: DbSession):
    """Batch reorder tasks (for drag-and-drop)."""
    updated_tasks = []
    for upd in updates:
        result = await db.execute(
            select(Task).where(Task.id == upd.task_id, Task.user_id == current_user.id)
        )
        task = result.scalar_one_or_none()
        if task:
            task.column = upd.column
            task.position = upd.position
            updated_tasks.append(task)

    await db.flush()
    for t in updated_tasks:
        await db.refresh(t)
    return updated_tasks
