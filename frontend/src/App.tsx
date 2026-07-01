import { useState, useEffect } from 'react'
import HeroSection from './components/HeroSection'
import TrustedBySection from './components/TrustedBySection'
import AgentsSection from './components/AgentsSection'
import FeaturesSection from './components/FeaturesSection'
import ArchitectureSection from './components/ArchitectureSection'
import PricingSection from './components/PricingSection'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import { ChatWorkspace } from './components/chat/ChatWorkspace'
import { AuthModal, type UserProfile } from './components/auth/AuthModal'
import { ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>('landing')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('taskforge_token')
    const savedUserStr = localStorage.getItem('taskforge_user')
    if (savedToken && savedUserStr) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUserStr))
      } catch (e) {
        console.error('Failed to restore user session:', e)
      }
    }
  }, [])

  const handleOpenLogin = () => {
    setAuthMode('login')
    setAuthModalOpen(true)
  }

  const handleOpenRegister = () => {
    setAuthMode('register')
    setAuthModalOpen(true)
  }

  const handleAuthSuccess = (userProfile: UserProfile, jwtToken: string) => {
    setUser(userProfile)
    setToken(jwtToken)
    setCurrentView('workspace')
  }

  const handleSignOut = () => {
    localStorage.removeItem('taskforge_token')
    localStorage.removeItem('taskforge_user')
    setUser(null)
    setToken(null)
    setCurrentView('landing')
  }

  if (currentView === 'workspace') {
    return (
      <>
        <ChatWorkspace
          onBackToLanding={() => setCurrentView('landing')}
          user={user}
          token={token}
          onSignOut={handleSignOut}
          onOpenLogin={handleOpenLogin}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    )
  }

  return (
    <div className="bg-black min-h-screen relative selection:bg-violet-500 selection:text-white">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />
      
      <HeroSection
        onEnterWorkspace={() => setCurrentView('workspace')}
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        user={user}
      />
      <TrustedBySection />
      <AgentsSection />
      <FeaturesSection />
      <ArchitectureSection />
      <PricingSection />
      <CTASection />
      <Footer />

      {/* Persistent Futuristic Animated Floating Workspace Launcher */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{
          opacity: 1,
          y: [0, -6, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          y: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' },
          scale: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
          default: { duration: 0.5 },
        }}
        className="fixed bottom-6 right-6 z-50 group"
      >
        {/* Animated outer neon aura */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 via-violet-600 to-fuchsia-600 rounded-full blur-md opacity-75 group-hover:opacity-100 animate-pulse group-hover:scale-110 transition duration-500" />
        
        <button
          onClick={() => setCurrentView('workspace')}
          className="relative flex items-center gap-3.5 px-6 py-3.5 rounded-full bg-black/85 backdrop-blur-2xl border border-white/20 group-hover:border-violet-400 text-white font-semibold text-sm shadow-2xl transition-all duration-300 group-hover:bg-black group-active:scale-95"
        >
          {/* Animated Orbital Logo Badge */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full animate-spin duration-3000 opacity-80 group-hover:opacity-100" />
            <img src="/logo.jpg" alt="TaskForge AI" className="w-7 h-7 rounded-full object-cover border-2 border-white relative z-10 shadow-md" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 z-20">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 border border-black"></span>
            </span>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase flex items-center gap-1 font-bold">
              <Sparkles size={11} className="animate-spin text-amber-400 duration-5000" />
              Autonomous OS
            </span>
            <span className="font-extrabold tracking-wide text-sm bg-gradient-to-r from-white via-violet-200 to-cyan-200 bg-clip-text text-transparent group-hover:text-white transition-all">
              Launch AI Workspace
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-violet-600/30 border border-white/15 group-hover:border-violet-500/50 flex items-center justify-center text-white/80 group-hover:text-white transition-all group-hover:translate-x-1 duration-300 shadow-inner">
            <ArrowRight size={16} />
          </div>
        </button>
      </motion.div>

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default App
