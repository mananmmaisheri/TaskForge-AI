"""
TaskForge AI — Auth API Routes
Registration, login, token refresh, current user.
"""

from fastapi import APIRouter, Depends, status
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.api.deps import CurrentUser, DbSession
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, TokenRefresh, UserResponse, UserUpdate
from app.services.auth_service import register_user, authenticate_user, refresh_tokens

router = APIRouter(prefix="/api/auth", tags=["Authentication"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister, db: DbSession):
    """Register a new user account."""
    user = await register_user(data, db)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: DbSession):
    """Authenticate and receive JWT tokens."""
    return await authenticate_user(data, db)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: TokenRefresh, db: DbSession):
    """Refresh access token using a valid refresh token."""
    return await refresh_tokens(data.refresh_token, db)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser):
    """Get current authenticated user profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(data: UserUpdate, current_user: CurrentUser, db: DbSession):
    """Update current user profile."""
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    if data.preferences is not None:
        current_user.preferences = data.preferences
    await db.flush()
    await db.refresh(current_user)
    return current_user
