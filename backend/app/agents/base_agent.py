"""
TaskForge AI — Base Agent Definition
Defines the standard interface for specialized ADK agents.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.memory_service import AgentSharedMemory


class BaseAgent(ABC):
    def __init__(self, name: str, emoji: str, description: str):
        self.name = name
        self.emoji = emoji
        self.description = description

    @abstractmethod
    async def invoke(
        self,
        message: str,
        user_context: Dict[str, Any],
        shared_mem: AgentSharedMemory,
        db: Optional[AsyncSession] = None
    ) -> Dict[str, Any]:
        """
        Execute agent specialized logic.
        Must return a structured dict containing 'status', 'summary', and any domain artifacts.
        """
        pass
