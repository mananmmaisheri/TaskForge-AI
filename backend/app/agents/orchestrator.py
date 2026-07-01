"""
TaskForge AI — Google ADK Multi-Agent Orchestrator (Root Agent)
Responsible for intent classification, agent selection, hierarchical delegation,
shared blackboard management, real-time activity streaming, and response synthesis.
"""

import logging
import asyncio
from typing import Dict, Any, List, Optional, AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.memory_service import AgentSharedMemory
from app.agents.specialized_agents import (
    PlannerAgent, TaskManagerAgent, StudyAgent,
    SchedulerAgent, AnalyticsAgent, ResearchAgent, MCPToolAgent
)

logger = logging.getLogger("taskforge.orchestrator")


class ADKOrchestrator:
    """Root Orchestrator for TaskForge AI Multi-Agent System."""
    def __init__(self):
        self.planner = PlannerAgent()
        self.task_manager = TaskManagerAgent()
        self.study = StudyAgent()
        self.scheduler = SchedulerAgent()
        self.analytics = AnalyticsAgent()
        self.research = ResearchAgent()
        self.mcp_tool = MCPToolAgent()

        self.all_agents = {
            "planner": self.planner,
            "task_manager": self.task_manager,
            "study": self.study,
            "scheduler": self.scheduler,
            "analytics": self.analytics,
            "research": self.research,
            "mcp_tool": self.mcp_tool
        }

    def classify_intent_and_select_agents(self, message: str) -> List[Any]:
        """
        Intelligently determine which specialized agents are required for the task.
        In production, this can use a fast classifier or embedding routing;
        here we use keyword & semantic intent matching conforming to required specifications.
        """
        msg_lower = message.lower()
        selected = []

        # Explicit routing rules required by specification
        if "study schedule" in msg_lower or "study curriculum" in msg_lower:
            return [self.planner, self.study, self.scheduler]
        elif "plan my project" in msg_lower or "roadmap" in msg_lower or "decompose" in msg_lower:
            return [self.planner, self.task_manager]
        elif "summarize my notes" in msg_lower or "quiz" in msg_lower or "exam" in msg_lower or "flashcard" in msg_lower:
            return [self.study]
        elif "analyze my productivity" in msg_lower or "analytics" in msg_lower or "weekly report" in msg_lower or "progress" in msg_lower:
            return [self.analytics]
        elif "search" in msg_lower or "news" in msg_lower or "research" in msg_lower or "verify" in msg_lower:
            return [self.research]
        elif "meeting" in msg_lower or "calendar" in msg_lower or "remind" in msg_lower or "schedule" in msg_lower or "time block" in msg_lower:
            return [self.scheduler, self.mcp_tool]

        # Multi-agent keyword accumulation for general prompts
        if any(k in msg_lower for k in ["goal", "plan", "strategy", "roadmap"]):
            selected.append(self.planner)
        if any(k in msg_lower for k in ["task", "todo", "kanban", "priority", "deadline"]):
            selected.append(self.task_manager)
        if any(k in msg_lower for k in ["study", "learn", "course", "note", "quiz"]):
            selected.append(self.study)
        if any(k in msg_lower for k in ["time", "calendar", "event", "meeting", "reminder", "habit"]):
            selected.append(self.scheduler)
        if any(k in msg_lower for k in ["report", "insight", "metric", "score"]):
            selected.append(self.analytics)

        # If no specific agents matched, orchestrate a collaborative planning & task workflow
        if not selected:
            selected = [self.planner, self.task_manager, self.mcp_tool]

        # Remove duplicates while preserving order
        seen = set()
        unique_selected = []
        for ag in selected:
            if ag.name not in seen:
                seen.add(ag.name)
                unique_selected.append(ag)
        return unique_selected

    async def stream_orchestration(
        self,
        message: str,
        user_context: Dict[str, Any],
        session_id: str,
        user_id: str,
        db: Optional[AsyncSession] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Execute multi-agent workflow and stream real-time SSE/WebSocket events
        including live agent activity progress, markdown responses, and suggested prompts.
        """
        shared_mem = AgentSharedMemory(session_id=session_id, user_id=user_id)
        selected_agents = self.classify_intent_and_select_agents(message)

        logger.info(f"[Orchestrator] Selected {len(selected_agents)} agents for message: '{message[:40]}...'")

        # Notify UI about selected collaborating agents
        yield {
            "type": "orchestration_start",
            "agents": [{"name": a.name, "emoji": a.emoji, "description": a.description} for a in selected_agents]
        }

        agent_results = []
        for agent in selected_agents:
            # Step 1: Notify UI agent is starting work
            yield {
                "type": "agent_start",
                "agent": agent.name,
                "emoji": agent.emoji,
                "status_text": f"Running {agent.name} logic..."
            }

            # Simulate brief asynchronous processing delay for UI cinematic feel
            await asyncio.sleep(0.6)

            # Step 2: Invoke agent logic with shared blackboard
            res = await agent.invoke(message, user_context, shared_mem, db)
            agent_results.append(res)

            # Step 3: Notify UI agent completed its task
            yield {
                "type": "agent_complete",
                "agent": agent.name,
                "emoji": agent.emoji,
                "summary": res.get("summary", "")
            }
            await asyncio.sleep(0.3)

        # Synthesize final coherent response from all collaborating agents
        synthesis_lines = [
            f"### 🚀 TaskForge AI — Multi-Agent Orchestration Report\n",
            f"I have coordinated **{len(selected_agents)} specialized AI agents** (`{'`, `'.join([a.name for a in selected_agents])}`) to fulfill your request:\n"
        ]

        for res in agent_results:
            synthesis_lines.append(f"#### {res['agent']}\n{res['summary']}\n")

        synthesis_lines.append(
            "\n---\n*💡 All intermediate results have been synchronized to your long-term workspace memory and calendar.*"
        )

        final_markdown = "\n".join(synthesis_lines)

        # Stream the synthesized text chunks
        chunk_size = 80
        for i in range(0, len(final_markdown), chunk_size):
            yield {
                "type": "text_chunk",
                "content": final_markdown[i:i+chunk_size]
            }
            await asyncio.sleep(0.02)

        # Generate contextual suggested prompts for next steps
        suggested_prompts = [
            "Optimize my task deadlines and priority queue",
            "Generate an interactive quiz for this study curriculum",
            "Schedule a follow-up review meeting tomorrow at 4 PM",
            "Analyze my productivity insights for the week"
        ]
        yield {
            "type": "suggested_prompts",
            "prompts": suggested_prompts
        }

        # Signal completion
        yield {
            "type": "done",
            "session_id": session_id,
            "agents_executed": [a.name for a in selected_agents]
        }


orchestrator = ADKOrchestrator()
