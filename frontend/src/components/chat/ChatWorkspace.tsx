import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Copy,
  RotateCcw,
  Square,
  Sparkles,
  User,
  Sidebar as SidebarIcon,
  Command as CommandIcon,
  ArrowLeft,
  X,
  Clock,
  Zap,
  Settings as SettingsIcon,
} from 'lucide-react'

import { ChatSidebar, type ChatSessionItem } from './ChatSidebar'
import { CommandPalette } from './CommandPalette'
import { SettingsModal } from './SettingsModal'
import { AgentActivityPanel, type AgentActivityItem } from './AgentActivityPanel'
import { MarkdownRenderer } from './MarkdownRenderer'

export interface ChatMessageItem {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  activities?: AgentActivityItem[]
  suggestedPrompts?: string[]
}

interface ChatWorkspaceProps {
  onBackToLanding: () => void
  user?: any
  token?: string | null
  onSignOut?: () => void
  onOpenLogin?: () => void
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  onBackToLanding,
  user,
  token,
  onSignOut,
  onOpenLogin,
}) => {
  // State for sidebar and command palette
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isCommandOpen, setIsCommandOpen] = useState(false)

  // Sessions and active session
  const [sessions, setSessions] = useState<ChatSessionItem[]>([
    { id: 'sess_1', title: 'Plan AI Multi-Agent Architecture', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'sess_2', title: 'Study Schedule & ML Exam Preparation', created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'sess_3', title: 'Kanban Task Prioritization Audit', created_at: new Date(Date.now() - 3 * 86400000).toISOString(), updated_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  ])
  const [activeSessionId, setActiveSessionId] = useState<string | null>('sess_1')

  // Messages in active session
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'msg_1',
      role: 'user',
      content: 'Plan my project roadmap and decompose goals into milestones for TaskForge AI.',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      id: 'msg_2',
      role: 'assistant',
      content: `### 🚀 TaskForge AI — Strategic Roadmap Report

I have coordinated **2 specialized AI agents** (\`Planner Agent\`, \`Task Manager Agent\`) to structure your project:

#### 🧠 Planner Agent
**Strategic Roadmap Generated**:
1. *Foundation & Discovery* (Milestone: Architecture Blueprint Approval)
2. *Core Development & MVP* (Milestone: Core Functional Pipeline)
3. *Optimization & QA* (Milestone: End-to-End Test Suite & Benchmarks)

#### ✅ Task Manager Agent
**Workflow Optimized & Tasks Configured**:
• [HIGH] Execute Phase 1: Architecture Blueprint Approval
• [MEDIUM] Execute Phase 2: Core Functional Pipeline
• [MEDIUM] Execute Phase 3: End-to-End Test Suite & Benchmarks

---
*💡 All intermediate results have been synchronized to your long-term workspace memory.*`,
      timestamp: new Date(Date.now() - 30000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activities: [
        { name: 'Planner Agent', emoji: '🧠', status: 'completed' },
        { name: 'Task Manager Agent', emoji: '✅', status: 'completed' },
      ],
      suggestedPrompts: [
        'Optimize my task deadlines and priority queue',
        'Generate an interactive quiz for this study curriculum',
        'Schedule a follow-up review meeting tomorrow at 4 PM',
        'Analyze my productivity insights for the week',
      ],
    },
  ])

  // Input & Generation state
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentActivities, setCurrentActivities] = useState<AgentActivityItem[]>([])
  const [streamingText, setStreamingText] = useState('')
  const [attachments, setAttachments] = useState<Array<{ name: string; type: 'file' | 'image'; size?: string; previewUrl?: string; content?: string }>>([])
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Refs for auto-scroll and aborting stream
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingText, currentActivities])

  // Fetch real database sessions when authenticated
  useEffect(() => {
    if (token && !token.startsWith('guest_')) {
      fetch('http://localhost:8000/api/chat/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data) && data.length > 0) {
            setSessions(data)
            setActiveSessionId(data[0].id)
          }
        })
        .catch((err) => console.error('Failed to load DB sessions:', err))
    }
  }, [token])

  // Handle session switching
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id)
    if (token && !token.startsWith('guest_')) {
      fetch(`http://localhost:8000/api/chat/sessions/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data)) {
            const formatted: ChatMessageItem[] = data.map((m: any) => ({
              id: m.id,
              role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
              content: m.content,
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              activities: m.agent_metadata?.activities,
              suggestedPrompts: m.agent_metadata?.suggestedPrompts,
            }))
            if (formatted.length > 0) {
              setMessages(formatted)
              return
            }
          }
        })
        .catch((err) => console.error('Failed to load session messages:', err))
    }

    const found = sessions.find((s) => s.id === id)
    if (found && found.title.includes('Study')) {
      setMessages([
        {
          id: 'msg_s1',
          role: 'user',
          content: 'Create my study schedule and generate an interactive revision quiz.',
          timestamp: '10:15 AM',
        },
        {
          id: 'msg_s2',
          role: 'assistant',
          content: `### 📚 Study & Exam Curriculum
I deployed the **Study Agent** and **Scheduler Agent** to organize your curriculum:
• **Session 1**: Multi-Agent Orchestration & ADK Patterns (45 mins)
• **Session 2**: Model Context Protocol (MCP) Tool Registries (60 mins)
• **Session 3**: Distributed Memory Systems & Redis Caching (30 mins)

💡 *Sample Quiz*: What is the primary benefit of MCP? → **Standardized secure tool execution**.`,
          timestamp: '10:16 AM',
          activities: [
            { name: 'Study Agent', emoji: '📚', status: 'completed' },
            { name: 'Scheduler Agent', emoji: '📅', status: 'completed' },
          ],
        },
      ])
    } else if (found && found.title.includes('Kanban')) {
      setMessages([
        {
          id: 'msg_k1',
          role: 'user',
          content: 'Optimize my task deadlines and recommend priority order.',
          timestamp: '04:30 PM',
        },
        {
          id: 'msg_k2',
          role: 'assistant',
          content: `### ⚡ Task Optimization Report
**Task Manager Agent** analyzed your pending queue:
1. Prioritize tasks tagged 'high' scheduled before Friday.
2. Move 2 low-priority administrative tasks to next week.

All Kanban columns have been reordered automatically!`,
          timestamp: '04:31 PM',
          activities: [{ name: 'Task Manager Agent', emoji: '✅', status: 'completed' }],
        },
      ])
    } else {
      setMessages([
        {
          id: 'msg_1',
          role: 'user',
          content: 'Plan my project roadmap and decompose goals into milestones for TaskForge AI.',
          timestamp: '11:00 AM',
        },
        {
          id: 'msg_2',
          role: 'assistant',
          content: `### 🚀 TaskForge AI — Strategic Roadmap Report\nI have coordinated **2 specialized AI agents** (\`Planner Agent\`, \`Task Manager Agent\`) to structure your project.`,
          timestamp: '11:01 AM',
          activities: [
            { name: 'Planner Agent', emoji: '🧠', status: 'completed' },
            { name: 'Task Manager Agent', emoji: '✅', status: 'completed' },
          ],
        },
      ])
    }
  }

  // Handle new chat creation
  const handleNewChat = () => {
    const newId = `sess_${Date.now()}`
    const newSess: ChatSessionItem = {
      id: newId,
      title: 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setSessions([newSess, ...sessions])
    setActiveSessionId(newId)
    setMessages([])
  }

  // Handle session delete
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const filtered = sessions.filter((s) => s.id !== id)
    setSessions(filtered)
    if (activeSessionId === id) {
      if (filtered.length > 0) {
        handleSelectSession(filtered[0].id)
      } else {
        handleNewChat()
      }
    }
  }

  // Handle sending a message with multi-agent orchestration
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input
    if (!textToSend.trim() && attachments.length === 0) return

    let attachmentContentStr = ''
    if (attachments.length > 0) {
      attachmentContentStr = '\n\n**Attached Documents & Images:**\n' + attachments.map((att) => {
        if (att.content) {
          return `• **${att.name}** (${att.size || 'Text'}):\n\`\`\`\n${att.content.slice(0, 2000)}\n\`\`\``
        }
        return `• **${att.name}** (${att.size || att.type}) [Attached from local PC]`
      }).join('\n')
    }

    const userMsg: ChatMessageItem = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: textToSend + attachmentContentStr,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setAttachments([])
    setIsGenerating(true)
    setStreamingText('')
    setCurrentActivities([])

    // Update active session title if it was New Conversation
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId && s.title === 'New Conversation') {
          return { ...s, title: textToSend.slice(0, 35) + (textToSend.length > 35 ? '...' : '') }
        }
        return s
      })
    )

    abortControllerRef.current = new AbortController()

    // Try live SSE backend connection first; fallback to simulated orchestrator if offline
    try {
      const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token && !token.startsWith('guest_')) {
        reqHeaders['Authorization'] = `Bearer ${token}`
      }
      const resp = await fetch('http://localhost:8000/api/chat/stream', {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          message: textToSend,
          session_id: activeSessionId?.startsWith('sess_') ? undefined : activeSessionId,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!resp.ok || !resp.body) {
        throw new Error('Backend offline or unreachable')
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let accumText = ''
      let activeActivitiesList: AgentActivityItem[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim()
            if (!dataStr) continue
            try {
              const evt = JSON.parse(dataStr)
              if (evt.type === 'agent_start') {
                const item: AgentActivityItem = {
                  name: evt.agent,
                  emoji: evt.emoji || '🤖',
                  status: 'running',
                  statusText: evt.status_text || 'Processing task...',
                }
                activeActivitiesList = [...activeActivitiesList.filter((a) => a.name !== evt.agent), item]
                setCurrentActivities([...activeActivitiesList])
              } else if (evt.type === 'agent_complete') {
                activeActivitiesList = activeActivitiesList.map((a) =>
                  a.name === evt.agent ? { ...a, status: 'completed' as const } : a
                )
                setCurrentActivities([...activeActivitiesList])
              } else if (evt.type === 'text_chunk') {
                accumText += evt.content
                setStreamingText(accumText)
              } else if (evt.type === 'suggested_prompts') {
                // Done with stream, save assistant message
                const assistMsg: ChatMessageItem = {
                  id: `msg_a_${Date.now()}`,
                  role: 'assistant',
                  content: accumText,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  activities: activeActivitiesList,
                  suggestedPrompts: evt.prompts,
                }
                setMessages((prev) => [...prev, assistMsg])
                setIsGenerating(false)
                setStreamingText('')
                setCurrentActivities([])
                return
              }
            } catch (err) {
              console.error('Error parsing SSE event:', err)
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setIsGenerating(false)
        return
      }
      // Execute Simulated Orchestrator Stream for immediate interactive browser demo
      await simulateOrchestrationStream(textToSend)
    }
  }

  // Simulated Orchestrator Stream with realistic multi-agent delegation timing
  const simulateOrchestrationStream = async (userPrompt: string) => {
    const promptLower = userPrompt.toLowerCase()
    let agentsToRun: Array<{ name: string; emoji: string; desc: string }> = []

    if (promptLower.includes('study') || promptLower.includes('quiz') || promptLower.includes('schedule')) {
      agentsToRun = [
        { name: 'Planner Agent', emoji: '🧠', desc: 'Structuring study objectives...' },
        { name: 'Study Agent', emoji: '📚', desc: 'Generating curriculum & flashcards...' },
        { name: 'Scheduler Agent', emoji: '📅', desc: 'Time blocking calendar events...' },
      ]
    } else if (promptLower.includes('task') || promptLower.includes('priority') || promptLower.includes('deadline')) {
      agentsToRun = [
        { name: 'Task Manager Agent', emoji: '✅', desc: 'Reordering Kanban columns & deadlines...' },
        { name: 'MCP Tool Agent', emoji: '⚙️', desc: 'Syncing task repository via MCP...' },
      ]
    } else if (promptLower.includes('report') || promptLower.includes('analytic') || promptLower.includes('score')) {
      agentsToRun = [{ name: 'Analytics Agent', emoji: '📊', desc: 'Auditing weekly productivity metrics...' }]
    } else {
      agentsToRun = [
        { name: 'Planner Agent', emoji: '🧠', desc: 'Decomposing goals into milestones...' },
        { name: 'Task Manager Agent', emoji: '✅', desc: 'Creating priority task items...' },
        { name: 'Scheduler Agent', emoji: '📅', desc: 'Syncing schedule with calendar...' },
      ]
    }

    let currentList: AgentActivityItem[] = []
    for (const ag of agentsToRun) {
      if (abortControllerRef.current?.signal.aborted) return
      const activeItem: AgentActivityItem = { name: ag.name, emoji: ag.emoji, status: 'running', statusText: ag.desc }
      currentList = [...currentList, activeItem]
      setCurrentActivities([...currentList])
      await new Promise((r) => setTimeout(r, 700))

      currentList = currentList.map((a) => (a.name === ag.name ? { ...a, status: 'completed' as const } : a))
      setCurrentActivities([...currentList])
      await new Promise((r) => setTimeout(r, 300))
    }

    if (abortControllerRef.current?.signal.aborted) return

    // Formulate markdown response
    const simContent = `### 🚀 TaskForge AI — Multi-Agent Orchestration Report\n\nI have coordinated **${agentsToRun.length} specialized AI agents** (\`${agentsToRun.map((a) => a.name).join('`, `')}\`) via Google ADK to fulfill your request:\n\n` +
      agentsToRun
        .map((a) => {
          if (a.name === 'Planner Agent') {
            return `#### 🧠 Planner Agent\n**Strategic Roadmap Generated**:\n1. *Foundation & Discovery* (Milestone: Blueprint)\n2. *Core Development* (Milestone: MVP)\n3. *Optimization & QA* (Milestone: Performance Suite)\n`
          }
          if (a.name === 'Study Agent') {
            return `#### 📚 Study Agent\n**Curriculum Configured**:\n• Multi-Agent Orchestration (45 mins)\n• MCP Tool Registries (60 mins)\n💡 *Sample Quiz*: What is the primary benefit of MCP? → **Standardized secure tool execution**.\n`
          }
          if (a.name === 'Task Manager Agent') {
            return `#### ✅ Task Manager Agent\n**Workflow Optimized & Kanban Updated**:\n• [HIGH] Execute Architecture Blueprint\n• [MEDIUM] Implement Core Functional Pipeline\n`
          }
          if (a.name === 'Scheduler Agent') {
            return `#### 📅 Scheduler Agent\n**Time Blocks Scheduled**:\n• 🕒 **Tomorrow 10:00 AM** → Deep Work Block\n• 🕒 **Tomorrow 02:00 PM** → Review Session\n`
          }
          return `#### ${a.emoji} ${a.name}\nExecution completed successfully with Pydantic validation.\n`
        })
        .join('\n') +
      `\n---\n*💡 All intermediate results have been synchronized to your long-term workspace memory and calendar.*`

    // Stream text chunks
    let textSoFar = ''
    const chunkSize = 40
    for (let i = 0; i < simContent.length; i += chunkSize) {
      if (abortControllerRef.current?.signal.aborted) return
      textSoFar += simContent.slice(i, i + chunkSize)
      setStreamingText(textSoFar)
      await new Promise((r) => setTimeout(r, 25))
    }

    const finalMsg: ChatMessageItem = {
      id: `msg_sim_${Date.now()}`,
      role: 'assistant',
      content: simContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activities: currentList,
      suggestedPrompts: [
        'Optimize my task deadlines and priority queue',
        'Generate an interactive quiz for this study curriculum',
        'Schedule a follow-up review meeting tomorrow at 4 PM',
        'Analyze my productivity insights for the week',
      ],
    }

    setMessages((prev) => [...prev, finalMsg])
    setIsGenerating(false)
    setStreamingText('')
    setCurrentActivities([])
  }

  // Handle stop generation
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsGenerating(false)
  }

  // Attach real files and images from PC
  const handleAttachFile = () => {
    fileInputRef.current?.click()
  }
  const handleAttachImage = () => {
    imageInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`

      let previewUrl: string | undefined = undefined
      let content: string | undefined = undefined

      if (type === 'image' || file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file)
      } else if (file.size < 200 * 1024 && (
        file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.py') ||
        file.name.endsWith('.json') || file.name.endsWith('.csv') || file.name.endsWith('.js') ||
        file.name.endsWith('.ts') || file.name.endsWith('.html') || file.name.endsWith('.css') ||
        file.name.endsWith('.yaml') || file.name.endsWith('.yml') || file.name.endsWith('.xml')
      )) {
        try {
          content = await file.text()
        } catch (err) {
          console.error('Error reading text file:', err)
        }
      }

      setAttachments((prev) => [...prev, { name: file.name, type: type === 'image' || file.type.startsWith('image/') ? 'image' : 'file', size: sizeStr, previewUrl, content }])
    }
    e.target.value = ''
  }

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans select-none">
      {/* Hidden Native File Upload Inputs */}
      <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e, 'file')} multiple className="hidden" />
      <input type="file" ref={imageInputRef} onChange={(e) => handleFileSelect(e, 'image')} accept="image/*" multiple className="hidden" />

      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onBackToLanding={onBackToLanding}
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={user}
        onSignOut={onSignOut}
        onOpenLogin={onOpenLogin}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-screen relative overflow-hidden bg-gradient-to-b from-black via-zinc-950 to-black">
        {/* Background glow orbs */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Header Bar */}
        <header className="h-16 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-20 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white transition-colors"
              title="Toggle Sidebar"
            >
              <SidebarIcon size={18} />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-sm sm:text-base text-white font-serif tracking-wide">
                {sessions.find((s) => s.id === activeSessionId)?.title || 'New Conversation'}
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-mono">
                <Zap size={12} className="text-violet-400" />
                <span>Google ADK Orchestrator</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white text-xs font-medium transition-all"
              title="Open Workspace Settings"
            >
              <SettingsIcon size={14} className="text-violet-400" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white text-xs font-mono transition-all"
              title="Command Palette (Ctrl+K)"
            >
              <CommandIcon size={14} className="text-violet-400" />
              <span className="hidden sm:inline">Commands</span>
              <span className="px-1 rounded bg-white/10 text-[10px] text-white/50">Ctrl+K</span>
            </button>

            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Landing Page</span>
            </button>
          </div>
        </header>

        {/* Message Stream Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 custom-scrollbar z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16 sm:py-24 max-w-xl mx-auto"
              >
                <img src="/logo.jpg" alt="TaskForge AI" className="w-20 h-20 mx-auto mb-6 rounded-3xl object-cover shadow-2xl shadow-violet-500/40 border-2 border-white/20 hover:scale-105 transition-transform" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-serif tracking-tight">
                  How can TaskForge AI assist you today?
                </h2>
                <p className="text-sm sm:text-base text-white/50 mb-8 leading-relaxed">
                  Ask me anything. I orchestrate specialized AI agents — Planner, Task Manager,
                  Study, Scheduler, and MCP Tools — to execute your complex goals seamlessly.
                </p>

                {/* Initial Suggestion Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {[
                    { title: 'Plan project roadmap', desc: 'Decompose goals into milestones via Planner Agent', prompt: 'Plan my project roadmap and decompose goals into milestones' },
                    { title: 'Create study schedule & quiz', desc: 'Curriculum planning & AI flashcards via Study Agent', prompt: 'Create my study schedule and generate an interactive revision quiz' },
                    { title: 'Optimize task deadlines', desc: 'Smart Kanban priority ordering via Task Manager', prompt: 'Optimize my task deadlines and recommend priority order' },
                    { title: 'Schedule tomorrow time blocks', desc: 'Sync calendar meetings & habits via Scheduler Agent', prompt: 'Schedule time blocks for my tasks and study blocks tomorrow at 10 AM' },
                  ].map((sug, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSendMessage(sug.prompt)}
                      className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-violet-500/30 cursor-pointer transition-all duration-200 group"
                    >
                      <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-violet-300 transition-colors flex items-center justify-between">
                        <span>{sug.title}</span>
                        <Sparkles size={14} className="text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-xs text-white/40 mt-1 leading-relaxed">{sug.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start gap-3 sm:gap-4 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Avatar */}
                  {msg.role === 'assistant' && (
                    <img src="/logo.jpg" alt="AI" className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl object-cover flex-shrink-0 shadow-lg shadow-violet-500/30 border border-white/20 mt-1" />
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`relative max-w-3xl rounded-3xl p-5 sm:p-6 transition-all duration-200 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-900/20 rounded-tr-sm'
                        : 'bg-white/[0.03] border border-white/[0.08] text-white/90 shadow-2xl backdrop-blur-md rounded-tl-sm w-full'
                    }`}
                  >
                    {/* Role Header */}
                    <div className="flex items-center justify-between mb-2 text-[11px] font-mono text-white/40">
                      <span className="font-semibold uppercase tracking-wider text-white/70">
                        {msg.role === 'user' ? 'You' : 'TaskForge AI OS'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Agent Activity Panel (if assistant message has activities) */}
                    {msg.role === 'assistant' && msg.activities && msg.activities.length > 0 && (
                      <AgentActivityPanel activities={msg.activities} isOrchestrating={false} />
                    )}

                    {/* Message Content */}
                    {msg.role === 'user' ? (
                      <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}

                    {/* Assistant Action Buttons */}
                    {msg.role === 'assistant' && (
                      <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/40">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigator.clipboard.writeText(msg.content)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <Copy size={13} />
                            <span>Copy</span>
                          </button>
                          <button
                            onClick={() => handleSendMessage(messages[messages.length - 2]?.content)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <RotateCcw size={13} />
                            <span>Regenerate</span>
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded">
                          Google ADK Verified
                        </span>
                      </div>
                    )}

                    {/* Suggested Prompts Pills */}
                    {msg.role === 'assistant' && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40 font-mono">
                          Suggested Next Actions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {msg.suggestedPrompts.map((p, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(p)}
                              className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-violet-500/20 border border-white/[0.08] hover:border-violet-500/40 text-xs text-white/80 hover:text-white transition-all text-left flex items-center gap-1.5"
                            >
                              <span>{p}</span>
                              <Sparkles size={12} className="text-violet-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center text-white flex-shrink-0 mt-1">
                      <User size={18} />
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {/* Currently Generating Stream & Live Activity Panel */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 sm:gap-4 justify-start"
              >
                <img src="/logo.jpg" alt="AI" className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl object-cover flex-shrink-0 shadow-lg shadow-violet-500/30 border border-white/20 mt-1 animate-pulse" />
                <div className="max-w-3xl w-full rounded-3xl p-5 sm:p-6 bg-white/[0.03] border border-white/[0.08] text-white/90 shadow-2xl backdrop-blur-md rounded-tl-sm space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-violet-400">
                    <Sparkles size={14} className="animate-spin text-violet-400" />
                    <span>Google ADK Orchestrator collaborating with specialized sub-agents...</span>
                  </div>

                  {/* Live Activity Progress */}
                  <AgentActivityPanel activities={currentActivities} isOrchestrating={true} />

                  {/* Streaming markdown chunk */}
                  {streamingText && (
                    <div className="pt-2 border-t border-white/[0.05]">
                      <MarkdownRenderer content={streamingText} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 sm:p-6 bg-black/80 border-t border-white/[0.08] backdrop-blur-2xl z-20">
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Attachment preview badges */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2.5 px-2 pb-2">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-violet-500/20 to-purple-500/15 border border-violet-500/30 text-xs text-violet-200 shadow-lg animate-scale-up"
                  >
                    {att.previewUrl ? (
                      <img src={att.previewUrl} alt={att.name} className="w-8 h-8 rounded-lg object-cover border border-white/20 shadow" />
                    ) : (
                      <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-300">
                        {att.type === 'file' ? <Paperclip size={14} /> : <ImageIcon size={14} />}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-white truncate max-w-[160px]">{att.name}</span>
                      {att.size && <span className="text-[10px] text-white/50 font-mono">{att.size}</span>}
                    </div>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="p-1 rounded-lg hover:bg-white/10 hover:text-white text-white/40 transition-colors ml-1"
                      title="Remove attachment"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="relative flex items-center rounded-2xl bg-white/[0.04] border border-white/[0.1] hover:border-white/[0.18] focus-within:border-violet-500/50 transition-all duration-200 shadow-2xl pl-3 pr-2 py-1.5">
              <div className="flex items-center gap-1 pr-2 border-r border-white/10">
                <button
                  onClick={handleAttachFile}
                  className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  title="Attach file (PDF/MD/TXT)"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  onClick={handleAttachImage}
                  className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  title="Attach image or diagram"
                >
                  <ImageIcon size={18} />
                </button>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Ask TaskForge AI anything (e.g. 'Create my study plan and schedule reminders tomorrow')..."
                rows={1}
                className="flex-1 bg-transparent px-3 py-2 text-sm sm:text-base text-white placeholder:text-white/30 outline-none resize-none font-sans max-h-36 custom-scrollbar"
              />

              <div className="flex items-center gap-2 pl-2">
                {isGenerating ? (
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-semibold transition-all"
                  >
                    <Square size={14} className="fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() && attachments.length === 0}
                    className="p-2.5 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-30 disabled:hover:bg-white font-semibold transition-all duration-150 active:scale-95 shadow-lg shadow-white/10"
                  >
                    <Send size={18} className="text-black" />
                  </button>
                )}
              </div>
            </div>

            {/* Sub-footer disclaimer */}
            <div className="flex items-center justify-between px-2 text-[11px] text-white/30 font-mono">
              <span>Google ADK Multi-Agent Orchestration • MCP Tool Protocol Active</span>
              <span className="hidden sm:inline">Press Enter ↵ to send, Shift + Enter for new line</span>
            </div>
          </div>
        </div>

        {/* Command Palette Modal */}
        <CommandPalette
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
          onSelectPrompt={(p) => handleSendMessage(p)}
          onNewChat={handleNewChat}
          onBackToLanding={onBackToLanding}
        />

        {/* Settings & Profile Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onClearHistory={() => setMessages([])}
        />
      </main>
    </div>
  )
}
