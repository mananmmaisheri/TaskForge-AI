import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    desc: 'Perfect for individuals getting started with AI productivity.',
    features: [
      '2 AI Agents',
      '100 tasks/month',
      'Basic study tools',
      'Calendar sync',
      'Community support',
    ],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    desc: 'For professionals who need the full AI workforce.',
    features: [
      'All 4 AI Agents',
      'Unlimited tasks',
      'Advanced analytics',
      'MCP tool access',
      'Priority support',
      'Team collaboration',
      'Custom agent rules',
    ],
    cta: 'Start Pro Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Tailored solutions for teams and organizations.',
    features: [
      'Everything in Pro',
      'Self-hosted option',
      'SSO / SAML',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32 border-t border-white/5">
      <div className="orb orb-purple w-[400px] h-[400px] top-0 right-0 z-0 opacity-20" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 mb-6">
            <div className="w-2 h-2 bg-amber-500 rounded-full" />
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Pricing</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto">
            Start free. Upgrade when you need the full power of AI agents.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.7 }}
              className={`rounded-3xl p-6 sm:p-8 flex flex-col ${
                plan.highlight
                  ? 'liquid-glass-strong bg-gradient-to-b from-violet-500/[0.06] to-transparent ring-1 ring-violet-500/20'
                  : 'liquid-glass-strong'
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-medium text-violet-400 bg-violet-500/10 rounded-full px-3 py-1 self-start mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-white text-lg font-semibold">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-3 mb-2">
                <span className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-white/40 text-sm">{plan.period}</span>}
              </div>
              <p className="text-white/35 text-sm mb-6">{plan.desc}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-white/50 text-sm">
                    <Check size={14} className="text-green-400/60 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full rounded-full py-3 text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-white text-black hover:bg-white/90'
                    : 'liquid-glass text-white hover:bg-white/5'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
