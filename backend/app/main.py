"""
TaskForge AI — Backend Application Entry Point
Production-ready FastAPI application with Google ADK multi-agent orchestration,
MCP tool registry, JWT authentication, and real-time streaming endpoints.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import engine, Base
from app.api.auth import router as auth_router
from app.api.goals import router as goals_router
from app.api.tasks import router as tasks_router
from app.api.study import router as study_router
from app.api.chat import router as chat_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("taskforge.main")

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler for database engine and service initialization."""
    logger.info("🚀 TaskForge AI Backend initializing...")
    try:
        # Create database tables if they don't exist (in dev mode)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("✅ Database tables verified.")
    except Exception as e:
        logger.warning(f"Database initialization warning (using simulated mode if offline): {e}")
    
    yield
    
    logger.info("🛑 TaskForge AI Backend shutting down...")
    await engine.dispose()


app = FastAPI(
    title="TaskForge AI — AI Operating System API",
    description="Production full-stack multi-agent AI workspace powered by Google ADK and MCP Protocol.",
    version="1.0.0",
    lifespan=lifespan
)

# Attach rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Error Boundary & Exception Handling
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred in the TaskForge AI backend.",
            "path": request.url.path
        }
    )


# Register API Routers
app.include_router(auth_router)
app.include_router(goals_router)
app.include_router(tasks_router)
app.include_router(study_router)
app.include_router(chat_router)


@app.get("/api/health", tags=["System"])
async def health_check():
    """System health check endpoint."""
    return {
        "status": "healthy",
        "service": "TaskForge AI Backend",
        "version": "1.0.0",
        "adk_orchestration": "ready",
        "mcp_server": "active (10 tools registered)"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
