import { motion } from 'framer-motion'
import {
  MessageSquare,
  LayoutDashboard,
  Shield,
  Keyboard,
  Gauge,
  Puzzle,
  Terminal,
  Cpu,
  Layers,
} from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    desc: 'Real-time streaming conversations with context-aware agent routing.',
  },
  {
    icon: LayoutDashboard,
    title: 'Unified Dashboard',
    desc: 'A single command center for all agents, tasks, and analytics.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    desc: 'JWT auth, rate limiting, prompt injection protection, and output sanitization.',
  },
  {
    icon: Keyboard,
    title: 'Command Palette',
    desc: 'Ctrl+K for instant access to every action. Keyboard-first design.',
  },
  {
    icon: Gauge,
    title: 'Smart Analytics',
    desc: 'Productivity insights, study progress, and task completion trends.',
  },
  {
    icon: Puzzle,
    title: 'MCP Server',
    desc: 'Plugin-ready tool registry with validation, logging, and context memory.',
  },
  {
    icon: Terminal,
    title: 'CLI Tools',
    desc: 'Full command-line interface for agent interaction and automation.',
  },
  {
    icon: Cpu,
    title: 'Google ADK',
    desc: 'Multi-agent orchestration with hierarchical delegation and tool sharing.',
  },
  {
    icon: Layers,
    title: 'Drag & Drop Tasks',
    desc: 'Kanban-style task management with priority columns and smooth motion.',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32 border-t border-white/5">
      <div className="orb orb-blue w-[400px] h-[400px] bottom-0 right-0 z-0 opacity-30" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Features</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Everything you need. Nothing you don't.
          </h2>
          <p className="text-white/40 text-base sm:text-lg max-w-2xl mx-auto">
            A production-ready AI workspace with enterprise-grade security,
            real-time analytics, and modular architecture.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              className="liquid-glass-strong rounded-2xl p-6 hover:bg-white/[0.04] transition-all duration-500 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-white/[0.03]">
                  <feat.icon size={20} className="text-white/60 group-hover:text-white/80 transition-colors" />
                </div>
                <h3 className="text-white/90 text-sm font-semibold">{feat.title}</h3>
              </div>
              <p className="text-white/35 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
