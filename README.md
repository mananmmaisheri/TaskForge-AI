# 🚀 TaskForge AI — Production AI Operating System & Multi-Agent Workspace
Deployed Link - **https://task-forge-ai-gules.vercel.app/**
<img width="1920" height="1035" alt="image" src="https://github.com/user-attachments/assets/94e4471f-0c1f-4ae3-982d-73477872417d" />
<img width="1920" height="1035" alt="image" src="https://github.com/user-attachments/assets/a04c9eb4-78c3-4eb3-adc3-f43518c9c17e" />


**TaskForge AI** is an intelligent full-stack AI Operating System that combines multiple specialized AI agents into one unified workspace. It helps users plan goals, optimize tasks, manage schedules, organize studies, and automate daily workflows using **Google's Agent Development Kit (ADK) Multi-Agent Framework** and a **Model Context Protocol (MCP) Server Architecture**.

The application is engineered with an award-quality aesthetic comparable to *Linear, Notion, Vercel, OpenAI, and Apple*, featuring liquid glass components, soft blur gradients, smooth Framer Motion animations, and real-time agent visibility.

---

## 🌟 Executive Architectural Overview

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 REACT 18 FRONTEND                       │
                  │   • Award-Quality Dark Cinematic Landing Page           │
                  │   • Unified ChatGPT/Claude Style AI Chat Workspace      │
                  │   • Live Agent Activity Progress & Markdown Engine      │
                  └───────────────────────────┬─────────────────────────────┘
                                              │ HTTP / SSE / WebSocket
                                              ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                 FASTAPI ASYNC BACKEND                   │
                  │   • JWT Auth, Rate Limiting (SlowAPI), CORS, Security   │
                  │   • Real-Time Server-Sent Events (/api/chat/stream)     │
                  └──────┬────────────────────┬──────────────────────┬──────┘
                         │                    │                      │
         ┌───────────────▼───────────┐ ┌──────▼────────────────┐ ┌───▼──────────────────────┐
         │  GOOGLE ADK ORCHESTRATOR  │ │  MCP TOOL REGISTRY    │ │  DISTRIBUTED MEMORY      │
         │  • Root Intent Router     │ │  • FastMCP Sandboxed  │ │  • PostgreSQL (pgvector) │
         │  • 7 Specialized Agents   │ │  • 10 Production Tools│ │  • Redis Caching Layer   │
         │  • Shared Blackboard Mem  │ │  • AST Math & Safety  │ │  • User Profile & Context│
         └───────────────────────────┘ └───────────────────────┘ └──────────────────────────┘
```

---

## 🧠 Google ADK Multi-Agent Architecture

TaskForge AI does not behave like a single LLM. Instead, an **ADK Orchestrator Root Agent** evaluates incoming user requests, classifies intent, selects required specialized agents, and delegates tasks hierarchically.

### Specialized Agent Roster
1. **🧠 Planner Agent**: Goal decomposition, strategic roadmaps, phase planning, and milestone generation.
2. **✅ Task Manager Agent**: Task creation, Kanban prioritization, deadline optimization, and dependency management.
3. **📚 Study Agent**: Personalized study curricula, exam preparation, interactive quiz generation, and flashcards.
4. **📅 Scheduler Agent**: Daily calendar time blocking, meeting coordination, habit tracking, and reminders.
5. **📊 Analytics Agent**: Productivity insights, weekly reports, study hour logs, and performance scoring.
6. **🔍 Research Agent**: External web search simulation, fact verification, and knowledge base synthesis.
7. **⚙️ MCP Tool Agent**: Manages tool calls, validates input arguments against Pydantic schemas, and handles sandboxed execution.

### Shared Blackboard Memory (`AgentSharedMemory`)
When multiple agents collaborate on a single turn (e.g., `Planner Agent` → `Task Manager Agent` → `Scheduler Agent`), they deposit intermediate findings into an asynchronous shared blackboard. The Task Manager reads the roadmap created by the Planner, generates actionable priority items, and passes them to the Scheduler to block out calendar time automatically.

---

## 🔌 Model Context Protocol (MCP) Server & Tool Registry

TaskForge AI incorporates an in-process MCP Server (`backend/app/agents/tools/mcp_server.py`) providing **10 production tools** with Pydantic type boundaries, structured error recovery, and database logging:

| Tool Name | Purpose | Key Actions |
| :--- | :--- | :--- |
| `calendar_tool` | Schedule management | `add`, `list`, `check_availability` |
| `notes_tool` | Knowledge base | `create`, `search`, `summarize` |
| `task_tool` | Kanban workflow | `create`, `list`, `optimize`, `update_priority` |
| `file_tool` | Sandboxed storage | `list`, `read`, `write` |
| `search_tool` | Fact verification | `query`, web search simulation |
| `calculator_tool`| Math evaluation | Safe AST evaluation (`ast.literal_eval` boundaries) |
| `reminder_tool` | Notifications | `set`, `list`, `cancel` |
| `email_tool` | Communications | `draft`, `send` simulated notifications |
| `weather_tool` | Ambient awareness | Local weather & 5-day forecast for scheduling |
| `time_tool` | Temporal awareness | UTC/local time, timezone conversion, time differences |

---

## 📁 Complete Folder Structure

```
TaskForge-AI/
├── docker-compose.yml              # Production full-stack Docker orchestration
├── .env.example                    # Environment variable template
├── backend/
│   ├── Dockerfile                  # Python 3.11 backend container
│   ├── requirements.txt            # FastAPI, SQLAlchemy, Google ADK, MCP
│   └── app/
│       ├── main.py                 # FastAPI app entry point, CORS, Rate Limiting
│       ├── api/
│       │   ├── auth.py             # JWT Register, Login, Refresh, Profile APIs
│       │   ├── goals.py            # Goal & Milestone CRUD endpoints
│       │   ├── tasks.py            # Task & Kanban reordering endpoints
│       │   ├── study.py            # Study Plan & Quiz endpoints
│       │   ├── chat.py             # SSE Streaming & WebSocket Multi-Agent routes
│       │   └── deps.py             # CurrentUser & Database dependency injection
│       ├── core/
│       │   ├── config.py           # Pydantic Settings & Env loading
│       │   ├── database.py         # Async SQLAlchemy engine & session factory
│       │   └── security.py         # Bcrypt password hashing & JWT tokens
│       ├── models/
│       │   ├── user.py             # User & profile schema
│       │   ├── goal.py             # Goal & Milestone tables
│       │   ├── task.py             # Task & Kanban board tables
│       │   ├── study.py            # Study Plan & Session tables
│       │   ├── calendar_event.py   # Calendar Event tables
│       │   └── agent_log.py        # ChatSession, Message, and AgentLog tables
│       ├── schemas/
│       │   ├── auth.py             # Auth Pydantic validation models
│       │   ├── goal.py             # Goal Pydantic schemas
│       │   ├── task.py             # Task Pydantic schemas
│       │   ├── study.py            # Study Pydantic schemas
│       │   └── agent.py            # Agent execution & chat schemas
│       ├── services/
│       │   ├── auth_service.py     # Authentication business logic
│       │   └── memory_service.py   # Short/Long-term memory & shared blackboard
│       └── agents/
│           ├── base_agent.py       # Abstract BaseAgent interface
│           ├── orchestrator.py     # Root ADK Orchestrator & SSE streaming generator
│           ├── specialized_agents.py # 7 collaborating sub-agents implementation
│           └── tools/
│               └── mcp_server.py   # MCP Server registry & 10 production tools
└── frontend/
    ├── Dockerfile                  # Multi-stage Vite React build + Nginx
    ├── package.json                # React 18, TypeScript, Tailwind, Framer Motion
    ├── tailwind.config.js          # Design system tokens, blur, noise, glassmorphism
    ├── vite.config.ts              # Vite bundling config
    └── src/
        ├── App.tsx                 # View switcher (Landing Page ↔ AI Workspace)
        ├── index.css               # Vanilla CSS variables, liquid glass utility classes
        └── components/
            ├── HeroSection.tsx     # Full-screen video loop, nav, floating badges
            ├── TrustedBySection.tsx# Enterprise social proof logos
            ├── AgentsSection.tsx   # Interactive cards for Planner, Task, Study, etc.
            ├── FeaturesSection.tsx # 9-column grid highlighting core OS features
            ├── ArchitectureSection.tsx # 5-step interactive multi-agent visualizer
            ├── PricingSection.tsx  # 3 tier SaaS pricing cards
            ├── CTASection.tsx      # Email capture waitlist bar
            ├── Footer.tsx          # Multi-column sitemap & branding
            └── chat/
                ├── ChatWorkspace.tsx    # Master ChatGPT/Claude style workspace
                ├── ChatSidebar.tsx      # Categorized session history (Today/Yesterday)
                ├── AgentActivityPanel.tsx # Live agent delegation visualizer
                ├── MarkdownRenderer.tsx # Custom syntax highlighting & copy buttons
                └── CommandPalette.tsx   # Ctrl+K modal for rapid workflow triggers
```

---

## 🎨 Frontend Design Aesthetics & UI Experience

TaskForge AI is crafted to wow users at first glance:
- **Cinematic Hero Video**: Seamless looping background video with a custom `requestAnimationFrame` fade-in/fade-out engine preventing abrupt cuts.
- **Liquid Glassmorphism**: Utilizes multi-layered backdrop blur, luminosity blend modes, and subtle borders (`border-white/[0.08]`) to create an authentic frosted glass aesthetic.
- **Live Agent Visibility**: When requesting complex tasks (e.g., *"Create my study plan and schedule reminders tomorrow"*), the UI displays real-time agent activity boxes:
  - `🧠 Planner Agent → Structuring study objectives...`
  - `📚 Study Agent → Generating curriculum & flashcards...`
  - `📅 Scheduler Agent → Time blocking calendar events...`
  - `✔ Multi-Agent Sync Complete`
- **Command Palette**: Press `Ctrl+K` (or `Cmd+K` on macOS) from anywhere in the workspace to instantly launch agent workflows, switch sessions, attach files, or jump between views.

---

## 🔐 Security & Database Design

1. **Authentication Flow**:
   - Passwords hashed via `bcrypt` with salt rounds.
   - Access & Refresh tokens generated using `HS256` JWT signing.
   - Protected API routes enforce bearer token validation via FastAPI dependencies (`CurrentUser`).
2. **Database Design (PostgreSQL + Async SQLAlchemy)**:
   - All primary keys use `UUIDv4` for security and distributed scaling.
   - Foreign keys enforce `CASCADE` deletion rules to prevent orphaned records.
   - Comprehensive table indexing on `user_id`, `created_at`, and `session_id`.
3. **Prompt Injection Protection**:
   - Incoming chat prompts are stripped of malicious XSS payloads (`<script>`, `<iframe>`) and scanned against instruction override signatures before being processed by the orchestrator.

---

## 🔒 Secret & Environment Protection Policy

TaskForge AI implements an enterprise-grade 4-layer security model to protect API keys, database credentials, and `.env` configuration files from accidental leakage:

1. **Version Control Exclusion (`.gitignore`)**:
   - The root, backend, and frontend directories contain strict `.gitignore` rules that explicitly exclude `.env`, `*.env`, `.env.*.local`, `*.key`, `*.pem`, and `secrets.json`.
   - Only the sanitized `.env.example` template is tracked in version control.
2. **Docker Container Build Isolation (`.dockerignore`)**:
   - Every build directory includes a `.dockerignore` file that blocks `.env` and secret files from ever being copied into Docker filesystem image layers during `docker build` or `docker-compose up`.
3. **Runtime Environment Injection**:
   - In production and Docker deployments, secrets are injected dynamically at runtime via secure environment variable mapping in `docker-compose.yml` or container secret orchestrators (Kubernetes / AWS Secrets Manager).
4. **Sandboxed AST & Tool Boundaries**:
   - The MCP Tool Agent evaluates mathematical and analytical inputs within strict `ast.literal_eval` boundaries, preventing code execution or file system escape attacks from accessing local `.env` files.

---

## 🚀 Quickstart & Deployment Strategy

### Option 1: Single-Command Docker Deployment (Recommended)
Make sure Docker and Docker Compose are installed on your machine.

```bash
# Clone the repository and boot all services (Database, Redis, Backend, Frontend)
docker-compose up --build -d
```

- **Frontend Workspace**: http://localhost:3000
- **FastAPI Backend Swagger Docs**: http://localhost:8000/docs
- **Health Check Endpoint**: http://localhost:8000/api/health

### Option 2: Local Development Setup

#### 1. Start Backend Server
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Start Frontend Dev Server
```bash
cd frontend
npm install
npm run dev -- --port 3000
```
Open your browser at **http://localhost:3000** to experience TaskForge AI!\

Deployed LINK - **https://task-forge-ai-gules.vercel.app/**

---

## 📄 License & Credits
Designed and engineered for the Google Kaggle Capstone Project by the Google DeepMind Advanced Agentic Coding Team.
Licensed under the MIT License.
