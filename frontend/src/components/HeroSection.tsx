import { useRef, useEffect, useCallback } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  ArrowRight,
  Globe,
  ChevronDown,
  Brain,
  CheckCircle2,
  Calendar,
  BarChart3,
  Zap,
  Layers,
  Mail,
  Heart,
} from 'lucide-react'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4'

/* ═══════════════════════════════════════════════════════
   Custom Video Fade Engine
   ═══════════════════════════════════════════════════════ */
function useVideoFade(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const animFrameRef = useRef<number | null>(null)
  const fadingOutRef = useRef(false)

  const cancelAnim = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
  }, [])

  const fadeIn = useCallback(() => {
    cancelAnim()
    fadingOutRef.current = false
    const vid = videoRef.current
    if (!vid) return

    const start = performance.now()
    const from = parseFloat(vid.style.opacity || '0')
    const duration = 500

    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      vid.style.opacity = String(from + (1 - from) * progress)
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        animFrameRef.current = null
      }
    }
    animFrameRef.current = requestAnimationFrame(step)
  }, [cancelAnim, videoRef])

  const fadeOut = useCallback(() => {
    cancelAnim()
    const vid = videoRef.current
    if (!vid) return

    const start = performance.now()
    const from = parseFloat(vid.style.opacity || '1')
    const duration = 500

    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      vid.style.opacity = String(from * (1 - progress))
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step)
      } else {
        animFrameRef.current = null
      }
    }
    animFrameRef.current = requestAnimationFrame(step)
  }, [cancelAnim, videoRef])

  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return

    vid.style.opacity = '0'

    const onCanPlay = () => fadeIn()

    const onTimeUpdate = () => {
      if (!vid.duration) return
      const remaining = vid.duration - vid.currentTime
      if (remaining <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true
        fadeOut()
      }
    }

    const onEnded = () => {
      cancelAnim()
      vid.style.opacity = '0'
      setTimeout(() => {
        vid.currentTime = 0
        vid.play().catch(() => {})
        fadingOutRef.current = false
        fadeIn()
      }, 100)
    }

    vid.addEventListener('canplay', onCanPlay)
    vid.addEventListener('timeupdate', onTimeUpdate)
    vid.addEventListener('ended', onEnded)

    return () => {
      cancelAnim()
      vid.removeEventListener('canplay', onCanPlay)
      vid.removeEventListener('timeupdate', onTimeUpdate)
      vid.removeEventListener('ended', onEnded)
    }
  }, [videoRef, fadeIn, fadeOut, cancelAnim])
}

/* ═══════════════════════════════════════════════════════
   Floating Status Cards
   ═══════════════════════════════════════════════════════ */
const floatingCards = [
  {
    icon: Brain,
    label: 'Planner Agent',
    status: 'Online',
    color: 'text-violet-400',
    dotColor: 'bg-green-400',
    position: 'top-[22%] left-[6%]',
    delay: 0,
    anim: 'animate-float',
  },
  {
    icon: CheckCircle2,
    label: "Today's Tasks",
    status: '12 completed',
    color: 'text-blue-400',
    dotColor: 'bg-blue-400',
    position: 'top-[35%] right-[5%]',
    delay: 0.3,
    anim: 'animate-float-delayed',
  },
  {
    icon: Calendar,
    label: 'Calendar',
    status: '3 events today',
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    position: 'bottom-[28%] left-[4%]',
    delay: 0.6,
    anim: 'animate-float-slow',
  },
  {
    icon: BarChart3,
    label: 'Study Progress',
    status: '78% complete',
    color: 'text-amber-400',
    dotColor: 'bg-amber-400',
    position: 'bottom-[35%] right-[4%]',
    delay: 0.9,
    anim: 'animate-float',
  },
  {
    icon: Zap,
    label: 'MCP Connected',
    status: '24 tools ready',
    color: 'text-cyan-400',
    dotColor: 'bg-cyan-400',
    position: 'top-[55%] left-[8%]',
    delay: 1.2,
    anim: 'animate-float-delayed',
  },
  {
    icon: Layers,
    label: 'Agent Status',
    status: '4/4 active',
    color: 'text-pink-400',
    dotColor: 'bg-pink-400',
    position: 'top-[15%] right-[10%]',
    delay: 0.5,
    anim: 'animate-float-slow',
  },
]

/* ═══════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════ */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

const navVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const, delay: 0.1 },
  },
}

/* ═══════════════════════════════════════════════════════
   Hero Section Component
   ═══════════════════════════════════════════════════════ */
export default function HeroSection({
  onEnterWorkspace,
  onOpenLogin,
  onOpenRegister,
  user,
}: {
  onEnterWorkspace?: () => void
  onOpenLogin?: () => void
  onOpenRegister?: () => void
  user?: any
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  useVideoFade(videoRef)

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* ── Background Video ──────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
          src={VIDEO_URL}
          muted
          autoPlay
          playsInline
          preload="auto"
          style={{ opacity: 0 }}
        />
      </div>

      {/* ── Cinematic Overlays ────────────────────────── */}
      {/* Dark gradient overlay — ensures text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 z-[2]"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Gradient orbs for ambient glow */}
      <div className="orb orb-indigo w-[600px] h-[600px] -top-40 -left-40 z-[3] animate-pulse-glow" />
      <div className="orb orb-purple w-[500px] h-[500px] top-1/3 -right-32 z-[3] animate-pulse-glow" style={{ animationDelay: '-2s' }} />
      <div className="orb orb-blue w-[400px] h-[400px] bottom-20 left-1/4 z-[3] animate-pulse-glow" style={{ animationDelay: '-4s' }} />

      {/* ── Floating Status Cards (desktop only) ──────── */}
      <div className="hidden lg:block">
        {floatingCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 + card.delay, duration: 0.7, ease: 'easeOut' }}
            className={`absolute z-[5] ${card.position} ${card.anim}`}
          >
            <div className="liquid-glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[180px]">
              <div className={`${card.color}`}>
                <card.icon size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-white/90 text-xs font-medium">{card.label}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${card.dotColor} status-dot`} />
                  <span className="text-white/50 text-[10px]">{card.status}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Content Layer ─────────────────────────────── */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ── Navigation ──────────────────────────────── */}
        <motion.nav
          variants={navVariants}
          initial="hidden"
          animate="visible"
          className="relative z-20 px-4 sm:px-6 py-5"
        >
          <div className="liquid-glass rounded-full px-5 sm:px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img src="/logo.jpg" alt="TaskForge AI Logo" className="w-8 h-8 rounded-xl object-cover border border-white/20 shadow-md" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full status-dot border-2 border-black" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight font-serif">
                TaskForge AI
              </span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Agents', 'Dashboard', 'Pricing', 'About'].map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                >
                  {link}
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-medium text-white/90 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{user.full_name || user.email?.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={onEnterWorkspace}
                    className="liquid-glass rounded-full px-5 sm:px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors shadow-lg shadow-violet-500/20"
                  >
                    Go to Workspace
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={onOpenRegister || onEnterWorkspace}
                    className="text-white/80 hover:text-white transition-colors text-sm font-medium hidden sm:block"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={onOpenLogin || onEnterWorkspace}
                    className="liquid-glass rounded-full px-5 sm:px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors shadow-lg shadow-violet-500/20"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.nav>

        {/* ── Hero Content ────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-16 md:pt-24 pb-12 text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-6">
            <div className="liquid-glass rounded-full px-5 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-violet-500 rounded-full status-dot" />
              <span className="text-white/70 text-xs sm:text-sm font-medium">
                Powered by Google ADK + MCP Protocol
              </span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Your AI Workforce.
          </motion.h1>
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              One Workspace.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-white/50 text-base sm:text-lg max-w-xl mb-10 leading-relaxed px-4"
          >
            TaskForge AI combines multiple intelligent agents into a unified
            productivity operating system. Plan goals, optimize tasks, manage
            schedules, and automate workflows.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <button
              onClick={onEnterWorkspace}
              className="group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-white via-violet-100 to-white px-8 py-3.5 text-sm font-bold text-black shadow-xl shadow-white/10 hover:shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Get Started Free</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-violet-600 font-bold" />
            </button>
            <button
              onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })}
              className="liquid-glass rounded-full px-8 py-3.5 text-white/90 hover:text-white text-sm font-semibold hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              View Architecture
            </button>
          </motion.div>
        </motion.div>

        {/* ── Social Icons + Scroll ───────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="relative z-10 flex flex-col items-center gap-6 pb-8 sm:pb-12"
        >
          {/* Scroll indicator */}
          <div className="scroll-indicator flex flex-col items-center gap-1">
            <span className="text-white/30 text-xs">Scroll to explore</span>
            <ChevronDown size={16} className="text-white/30" />
          </div>

          {/* Social icons */}
          <div className="flex justify-center gap-3 sm:gap-4">
            {[
              { Icon: Mail, label: 'Email' },
              { Icon: Heart, label: 'Support' },
              { Icon: Globe, label: 'Website' },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="liquid-glass rounded-full p-3 sm:p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
              >
                <Icon size={20} />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
