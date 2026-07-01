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
import { ArrowRight } from 'lucide-react'

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

      {/* Persistent Floating Workspace Launcher Badge */}
      <div className="fixed bottom-6 right-6 z-40 animate-bounce-subtle">
        <button
          onClick={() => setCurrentView('workspace')}
          className="group flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-2xl shadow-violet-500/40 border border-white/20 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <img src="/logo.jpg" alt="TaskForge AI" className="w-6 h-6 rounded-full object-cover border border-white/40 shadow-sm animate-pulse" />
          <span className="tracking-wide">Launch AI Chat Workspace</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

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
