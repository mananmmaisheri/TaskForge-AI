import { useState } from 'react'
import HeroSection from './components/HeroSection'
import TrustedBySection from './components/TrustedBySection'
import AgentsSection from './components/AgentsSection'
import FeaturesSection from './components/FeaturesSection'
import ArchitectureSection from './components/ArchitectureSection'
import PricingSection from './components/PricingSection'
import CTASection from './components/CTASection'
import Footer from './components/Footer'
import { ChatWorkspace } from './components/chat/ChatWorkspace'
import { ArrowRight } from 'lucide-react'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'workspace'>('landing')

  if (currentView === 'workspace') {
    return <ChatWorkspace onBackToLanding={() => setCurrentView('landing')} />
  }

  return (
    <div className="bg-black min-h-screen relative selection:bg-violet-500 selection:text-white">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />
      
      <HeroSection onEnterWorkspace={() => setCurrentView('workspace')} />
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
    </div>
  )
}

export default App
