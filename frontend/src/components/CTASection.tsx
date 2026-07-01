import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

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

          {/* CTA email bar */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="liquid-glass rounded-full pl-5 sm:pl-6 pr-2 py-2 flex items-center gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-sm sm:text-base min-w-0"
              />
              <button className="bg-white rounded-full px-5 sm:px-6 py-3 text-black text-sm font-semibold hover:bg-white/90 transition-colors flex items-center gap-2 flex-shrink-0">
                Join Waitlist
                <ArrowRight size={16} />
              </button>
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
