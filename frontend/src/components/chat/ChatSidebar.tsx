import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  Database,
  LogOut,
  LogIn,
  CheckCircle2,
} from 'lucide-react'

export interface ChatSessionItem {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface ChatSidebarProps {
  sessions: ChatSessionItem[]
  activeSessionId: string | null
  onSelectSession: (id: string) => void
  onNewChat: () => void
  onDeleteSession: (id: string, e: React.MouseEvent) => void
  isOpen: boolean
  onToggle: () => void
  onBackToLanding: () => void
  onOpenSettings?: () => void
  onOpenTodo?: () => void
  user?: any
  onSignOut?: () => void
  onOpenLogin?: () => void
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onBackToLanding,
  onOpenSettings,
  onOpenTodo,
  user,
  onSignOut,
  onOpenLogin,
}) => {
  if (!isOpen) return null

  // Categorize sessions by time
  const categorizeSessions = () => {
    const today: ChatSessionItem[] = []
    const yesterday: ChatSessionItem[] = []
    const previous: ChatSessionItem[] = []

    const now = new Date()
    const todayDateStr = now.toDateString()
    const yesterdayDate = new Date(now)
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterdayDateStr = yesterdayDate.toDateString()

    sessions.forEach((s) => {
      const d = new Date(s.updated_at || s.created_at)
      if (d.toDateString() === todayDateStr) {
        today.push(s)
      } else if (d.toDateString() === yesterdayDateStr) {
        yesterday.push(s)
      } else {
        previous.push(s)
      }
    })

    return { today, yesterday, previous }
  }

  const { today, yesterday, previous } = categorizeSessions()

  const renderSessionGroup = (label: string, items: ChatSessionItem[]) => {
    if (items.length === 0) return null

    return (
      <div className="mb-6">
        <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-2 font-mono">
          {label}
        </h4>
        <div className="space-y-1">
          <AnimatePresence>
            {items.map((s) => {
              const isActive = s.id === activeSessionId
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => onSelectSession(s.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs sm:text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-white border border-violet-500/30 shadow-lg'
                      : 'text-white/70 hover:bg-white/[0.04] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <MessageSquare
                      size={15}
                      className={isActive ? 'text-violet-400 flex-shrink-0' : 'text-white/40 group-hover:text-white/70 flex-shrink-0'}
                    />
                    <span className="truncate font-medium">{s.title || 'New Conversation'}</span>
                  </div>

                  <button
                    onClick={(e) => onDeleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all flex-shrink-0"
                    title="Delete session"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <aside className="w-72 sm:w-80 flex-shrink-0 h-screen bg-black/80 border-r border-white/[0.08] flex flex-col justify-between p-4 backdrop-blur-2xl z-30 select-none">
      {/* Top Header */}
      <div>
        {/* Brand */}
        <div
          onClick={onBackToLanding}
          className="flex items-center justify-between px-2 py-1 mb-6 cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="TaskForge AI" className="w-9 h-9 rounded-xl object-cover shadow-lg shadow-violet-500/30 border border-white/20" />
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 font-serif">
                TaskForge AI
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 status-dot" />
              </h1>
              <p className="text-[10px] text-white/40 uppercase tracking-wider font-mono">
                ADK Multi-Agent OS
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white text-black hover:bg-white/90 font-semibold text-xs sm:text-sm shadow-xl transition-all duration-200 active:scale-95"
        >
          <Plus size={16} />
          <span>New Workspace Chat</span>
        </button>

        {/* Sessions List */}
        <div className="overflow-y-auto max-h-[calc(100vh-280px)] pr-1 custom-scrollbar">
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-4 text-white/30 text-xs">
              <Sparkles size={24} className="mx-auto mb-2 text-violet-400/40" />
              <p>No chat history yet.</p>
              <p className="mt-1 text-[11px] text-white/20">Start a new workflow to orchestrate AI agents.</p>
            </div>
          ) : (
            <>
              {renderSessionGroup('Today', today)}
              {renderSessionGroup('Yesterday', yesterday)}
              {renderSessionGroup('Previous 7 Days', previous)}
            </>
          )}
        </div>
      </div>

      {/* Bottom Profile & Status */}
      <div className="pt-4 border-t border-white/[0.08] space-y-2">
        <div onClick={onOpenTodo} className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-500/20 hover:from-violet-600/20 hover:to-indigo-600/20 transition-all cursor-pointer group shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-violet-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-violet-200 group-hover:text-white font-semibold">Tasks & Alarms</span>
          </div>
          <span className="text-[10px] font-mono text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30 animate-pulse">
            Live
          </span>
        </div>

        <div onClick={onOpenSettings} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors cursor-pointer group">
          <div className="flex items-center gap-2">
            <Database size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-white/70 group-hover:text-white font-medium">MCP Tools</span>
          </div>
          <span className="text-[11px] font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
            10 Active
          </span>
        </div>

        {user ? (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 transition-colors group">
            <div onClick={onOpenSettings} className="flex items-center gap-2.5 cursor-pointer flex-1 overflow-hidden">
              <img src={user.avatar_url || '/logo.jpg'} alt="User" className="w-8 h-8 rounded-full object-cover border border-violet-500/40 shadow-sm flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                  {user.full_name || user.email?.split('@')[0] || 'Authenticated User'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synchronized
                </span>
              </div>
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-all flex-shrink-0 ml-1"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors">
            <div onClick={onOpenSettings} className="flex items-center gap-2.5 cursor-pointer flex-1">
              <img src="/logo.jpg" alt="TF" className="w-8 h-8 rounded-full object-cover border border-white/20 shadow-sm opacity-70" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white/80">Guest Workforce</span>
                <span className="text-[10px] text-white/40 font-mono">Local Demo Tier</span>
              </div>
            </div>
            <button
              onClick={onOpenLogin}
              title="Sign In to Save Chats"
              className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-medium flex items-center gap-1 transition-all"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
