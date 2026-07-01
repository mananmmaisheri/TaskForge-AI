import { motion } from 'framer-motion'
import { Brain, Zap, BookOpen, CalendarDays } from 'lucide-react'

const agents = [
  {
    icon: Brain,
    name: 'Planner Agent',
    emoji: '🧠',
    description: 'Goal decomposition, roadmap generation, milestone creation, and strategic project planning.',
    capabilities: ['Goal Decomposition', 'Roadmap Generation', 'Milestone Tracking', 'Project Planning'],
    color: 'from-violet-500/20 to-purple-500/20',
    iconColor: 'text-violet-400',
    borderColor: 'hover:shadow-violet-500/10',
  },
  {
    icon: Zap,
    name: 'Task Optimizer',
    emoji: '⚡',
    description: 'Smart prioritization, deadline optimization, productivity recommendations, and dependency management.',
    capabilities: ['Smart Prioritization', 'Deadline Optimization', 'Productivity Tips', 'Dependency Analysis'],
    color: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
    borderColor: 'hover:shadow-amber-500/10',
  },
  {
    icon: BookOpen,
    name: 'Study & Exam Agent',
    emoji: '📚',
    description: 'Personalized study plans, AI-generated quizzes, note summarization, and progress tracking.',
    capabilities: ['Study Plans', 'AI Quizzes', 'Note Summaries', 'Revision Reminders'],
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
    borderColor: 'hover:shadow-blue-500/10',
  },
  {
    icon: CalendarDays,
    name: 'Life Scheduler',
    emoji: '📅',
    description: 'Calendar management, daily planning, reminder generation, time blocking, and habit scheduling.',
    capabilities: ['Calendar Sync', 'Time Blocking', 'Habit Tracking', 'Smart Reminders'],
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
    borderColor: 'hover:shadow-emerald-500/10',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

export default function AgentsSection() {
  return (
    <section id="agents" className="relative py-24 sm:py-32">
      {/* Background orb */}
      <div className="orb orb-purple w-[500px] h-[500px] top-0 left-1/2 -translate-x-1/2 z-0 opacity-40" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-violet-500 rounded-full status-dot" />
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">AI Agents</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Four Agents. One Intelligence.
          </h2>
          <p className="text-white/40 text-base sm:text-lg max-w-2xl mx-auto">
            Specialized AI agents that collaborate through Google ADK orchestration
            to handle every aspect of your productivity.
          </p>
        </motion.div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`liquid-glass-strong rounded-3xl p-6 sm:p-8 hover:bg-white/[0.04] transition-all duration-500 group cursor-pointer ${agent.borderColor} hover:shadow-2xl`}
            >
              {/* Icon + Title */}
              <div className="flex items-start gap-4 mb-5">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${agent.color}`}>
                  <agent.icon size={24} className={agent.iconColor} />
                </div>
                <div>
                  <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                    <span>{agent.emoji}</span> {agent.name}
                  </h3>
                  <p className="text-white/40 text-sm mt-1 leading-relaxed">
                    {agent.description}
                  </p>
                </div>
              </div>

              {/* Capabilities */}
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="text-white/50 text-xs px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]"
                  >
                    {cap}
                  </span>
                ))}
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/5">
                <div className="w-2 h-2 rounded-full bg-green-400 status-dot" />
                <span className="text-white/30 text-xs">Active • Google ADK</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
