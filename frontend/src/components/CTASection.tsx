import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 border-t border-white/5 overflow-hidden">
      {/* Ambient glow */}
      <div className="orb orb-indigo w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-30" />
      <div className="orb orb-purple w-[400px] h-[400px] bottom-0 left-1/4 z-0 opacity-20" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-6 tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Ready to forge your{' '}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              AI workforce?
            </span>
          </h2>
          <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Join the waitlist today and be among the first to experience the
            future of AI-powered productivity.
          </p>

          {/* Replaced email bar with Cooler Interactive Launch Hub */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="liquid-glass rounded-3xl p-4 sm:p-6 border border-violet-500/30 relative overflow-hidden group shadow-2xl shadow-violet-500/10">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/60 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 flex-shrink-0 animate-pulse">
                    <Sparkles size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-sm sm:text-base">Experience TaskForge 3.0</span>
                    <span className="text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      10 Autonomous Agents Live
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl px-6 py-3 text-sm font-bold transition-all shadow-xl shadow-violet-600/30 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <span>Enter Workspace</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <p className="text-white/20 text-xs">
            No credit card required • Free tier available • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  )
}
