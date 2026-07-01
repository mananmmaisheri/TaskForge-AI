import { motion } from 'framer-motion'

const logos = [
  'Google', 'Microsoft', 'OpenAI', 'Anthropic', 'Meta', 'Stripe',
  'Vercel', 'Notion', 'Linear', 'Figma',
]

export default function TrustedBySection() {
  return (
    <section className="relative py-20 sm:py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-white/30 text-xs sm:text-sm uppercase tracking-[0.2em] font-medium mb-12"
        >
          Trusted by engineers at
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap justify-center items-center gap-x-8 sm:gap-x-12 gap-y-6"
        >
          {logos.map((name) => (
            <div
              key={name}
              className="text-white/20 hover:text-white/40 transition-colors text-base sm:text-lg font-semibold tracking-wide"
            >
              {name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
