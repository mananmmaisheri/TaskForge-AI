import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  Brain,
  CheckCircle2,
  BookOpen,
  CalendarDays,
  BarChart2,
  Home,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onSelectPrompt: (prompt: string) => void
  onNewChat: () => void
  onBackToLanding: () => void
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectPrompt,
  onNewChat,
  onBackToLanding,
}) => {
  const [query, setQuery] = useState('')

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const actions = [
    {
      icon: Plus,
      title: 'New Workspace Chat',
      desc: 'Start a fresh multi-agent workflow',
      category: 'System',
      action: () => {
        onNewChat()
        onClose()
      },
      color: 'text-white bg-white/10',
    },
    {
      icon: Brain,
      title: 'Plan my project roadmap',
      desc: 'Decompose goals into milestones using Planner Agent',
      category: 'Agent Workflows',
      action: () => {
        onSelectPrompt('Plan my project roadmap and decompose goals into milestones')
        onClose()
      },
      color: 'text-violet-400 bg-violet-500/10',
    },
    {
      icon: CheckCircle2,
      title: 'Optimize my task deadlines',
      desc: 'Smart Kanban priority optimization via Task Manager',
      category: 'Agent Workflows',
      action: () => {
        onSelectPrompt('Optimize my task deadlines and recommend priority order')
        onClose()
      },
      color: 'text-amber-400 bg-amber-500/10',
    },
    {
      icon: BookOpen,
      title: 'Create my study schedule & quiz',
      desc: 'Generate curriculum and interactive revision flashcards',
      category: 'Agent Workflows',
      action: () => {
        onSelectPrompt('Create my study schedule and generate an interactive revision quiz')
        onClose()
      },
      color: 'text-blue-400 bg-blue-500/10',
    },
    {
      icon: CalendarDays,
      title: 'Schedule time blocks tomorrow',
      desc: 'Sync daily meetings and habits via Scheduler Agent',
      category: 'Agent Workflows',
      action: () => {
        onSelectPrompt('Schedule time blocks for my tasks and study blocks tomorrow at 10 AM')
        onClose()
      },
      color: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      icon: BarChart2,
      title: 'Analyze my productivity insights',
      desc: 'Weekly progress audit and performance score',
      category: 'Agent Workflows',
      action: () => {
        onSelectPrompt('Analyze my productivity insights and generate a weekly progress report')
        onClose()
      },
      color: 'text-pink-400 bg-pink-500/10',
    },
    {
      icon: Home,
      title: 'Back to Landing Page',
      desc: 'Return to the main homepage overview',
      category: 'Navigation',
      action: () => {
        onBackToLanding()
        onClose()
      },
      color: 'text-cyan-400 bg-cyan-500/10',
    },
  ]

  const filteredActions = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-md select-none animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-black/90 shadow-2xl overflow-hidden backdrop-blur-2xl z-10"
      >
        {/* Search input bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <Search size={20} className="text-white/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search multi-agent actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder:text-white/30 outline-none font-sans"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/40 font-mono">
            <span>ESC</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Actions List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
          {filteredActions.length === 0 ? (
            <div className="text-center py-10 text-white/40 text-xs">
              <Sparkles size={24} className="mx-auto mb-2 text-violet-400/50" />
              <p>No matching commands found.</p>
            </div>
          ) : (
            filteredActions.map((item, idx) => (
              <div
                key={idx}
                onClick={item.action}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/[0.06] cursor-pointer group transition-all duration-150 border border-transparent hover:border-white/[0.08]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl ${item.color} flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <item.icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/[0.06] text-white/40 font-mono flex-shrink-0 hidden sm:inline">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 truncate mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-white/[0.01] flex items-center justify-between text-[11px] text-white/30 font-mono">
          <div className="flex items-center gap-2">
            <span>Pro Tip: Press</span>
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">Ctrl+K</span>
            <span>anytime to summon Command Palette</span>
          </div>
          <span>TaskForge AI</span>
        </div>
      </motion.div>
    </div>
  )
}
