import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2, Cpu } from 'lucide-react'

export interface AgentActivityItem {
  name: string
  emoji: string
  status: 'running' | 'completed' | 'error'
  statusText?: string
}

interface AgentActivityPanelProps {
  activities: AgentActivityItem[]
  isOrchestrating: boolean
}

export const AgentActivityPanel: React.FC<AgentActivityPanelProps> = ({
  activities,
  isOrchestrating,
}) => {
  if (activities.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="my-3 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-2xl overflow-hidden relative"
    >
      {/* Background glow orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
            <Cpu size={16} className={isOrchestrating ? 'animate-spin' : ''} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-white/80 font-mono">
            Google ADK Orchestrator
          </span>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
          {isOrchestrating ? 'Collaborating...' : 'Execution Complete'}
        </span>
      </div>

      {/* Activity List */}
      <div className="space-y-2.5">
        <AnimatePresence>
          {activities.map((item) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-all"
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90 font-medium">
                <span className="text-base">{item.emoji}</span>
                <span className="font-semibold text-white">{item.name}</span>
                <span className="text-white/30">→</span>
                <span className={item.status === 'completed' ? 'text-green-400 font-normal' : 'text-violet-300 animate-pulse font-normal'}>
                  {item.status === 'completed'
                    ? 'Completed'
                    : item.statusText || 'Processing task...'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                {item.status === 'running' ? (
                  <div className="flex items-center gap-1 text-[11px] text-violet-400 font-mono">
                    <Loader2 size={14} className="animate-spin text-violet-400" />
                    <span className="hidden sm:inline">Active</span>
                  </div>
                ) : item.status === 'completed' ? (
                  <div className="flex items-center gap-1 text-[11px] text-green-400 font-mono">
                    <CheckCircle2 size={14} className="text-green-400" />
                    <span className="hidden sm:inline">Done</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-red-400 font-mono">Error</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom status bar */}
      {!isOrchestrating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-white/40"
        >
          <span>All intermediate results saved to MCP memory</span>
          <span className="text-green-400/80 font-mono">✔ Multi-Agent Sync Complete</span>
        </motion.div>
      )}
    </motion.div>
  )
}
