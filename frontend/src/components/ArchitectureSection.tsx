import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    step: '01',
    title: 'User Input',
    desc: 'Send a natural-language request through the AI Chat or Dashboard.',
    accent: 'text-violet-400',
  },
  {
    step: '02',
    title: 'ADK Orchestrator',
    desc: 'The Root Agent analyzes intent and routes to the specialized sub-agent.',
    accent: 'text-blue-400',
  },
  {
    step: '03',
    title: 'Agent Execution',
    desc: 'Sub-agent processes with tools: MCP Server, database, and external APIs.',
    accent: 'text-emerald-400',
  },
  {
    step: '04',
    title: 'MCP Tool Layer',
    desc: 'Validated, secure tool execution with logging, memory, and error recovery.',
    accent: 'text-amber-400',
  },
  {
    step: '05',
    title: 'Response Stream',
    desc: 'Results stream back through WebSocket with real-time UI updates.',
    accent: 'text-pink-400',
  },
]

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="relative py-24 sm:py-32 border-t border-white/5">
      <div className="orb orb-indigo w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-20" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Architecture</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            How TaskForge AI Works
          </h2>
          <p className="text-white/40 text-base sm:text-lg max-w-2xl mx-auto">
            From natural language to intelligent action — powered by Google ADK
            multi-agent orchestration and MCP Server tool execution.
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <div className="space-y-4 sm:space-y-6">
          {steps.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              className="liquid-glass-strong rounded-2xl p-5 sm:p-6 flex items-start gap-4 sm:gap-6 group hover:bg-white/[0.04] transition-all duration-500"
            >
              <div className={`text-2xl sm:text-3xl font-bold ${item.accent} opacity-60 font-mono flex-shrink-0`}>
                {item.step}
              </div>
              <div className="flex-1">
                <h3 className="text-white text-base sm:text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
              <ArrowRight
                size={20}
                className="text-white/10 group-hover:text-white/30 transition-colors mt-1 flex-shrink-0 hidden sm:block"
              />
            </motion.div>
          ))}
        </div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-12 sm:mt-16 liquid-glass-strong rounded-2xl p-6 sm:p-8"
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-6 text-center font-medium">
            Built With
          </h3>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {[
              'Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS',
              'Python', 'FastAPI', 'Google ADK', 'MCP Server',
              'PostgreSQL', 'Redis', 'Docker', 'Framer Motion',
            ].map((tech) => (
              <span
                key={tech}
                className="text-white/40 text-xs px-3 sm:px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] hover:text-white/60 hover:border-white/10 transition-all"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
