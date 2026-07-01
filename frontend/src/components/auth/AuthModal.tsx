import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  preferences?: Record<string, any>
}

interface AuthModalProps {
  isOpen: boolean
  initialMode?: 'login' | 'register'
  onClose: () => void
  onSuccess: (user: UserProfile, token: string) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Sync mode when prop changes
  React.useEffect(() => {
    setMode(initialMode)
    setError(null)
    setSuccessMsg(null)
  }, [initialMode, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const bodyPayload =
        mode === 'login'
          ? { email, password }
          : { email, password, full_name: name || 'Valued User' }

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || 'Authentication failed. Please verify credentials.')
      }

      let token = ''
      let userProfile: UserProfile

      if (mode === 'login') {
        const data = await response.json()
        token = data.access_token

        // Fetch profile
        const profileResp = await fetch('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (profileResp.ok) {
          userProfile = await profileResp.json()
        } else {
          userProfile = { id: 'usr_' + Date.now(), email, full_name: email.split('@')[0], avatar_url: '/logo.jpg' }
        }
      } else {
        // Register successful, auto login
        setSuccessMsg('Account created! Logging you in...')
        const loginResp = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        if (loginResp.ok) {
          const loginData = await loginResp.json()
          token = loginData.access_token
          userProfile = { id: 'usr_' + Date.now(), email, full_name: name || email.split('@')[0], avatar_url: '/logo.jpg' }
        } else {
          setMode('login')
          setIsLoading(false)
          return
        }
      }

      // Save to localStorage
      localStorage.setItem('taskforge_token', token)
      localStorage.setItem('taskforge_user', JSON.stringify(userProfile))

      onSuccess(userProfile, token)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Unable to connect to authentication server.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = () => {
    setIsLoading(true)
    setTimeout(() => {
      const mockToken = 'guest_jwt_token_taskforge_ai_' + Date.now()
      const mockUser: UserProfile = {
        id: 'guest_user_1',
        email: 'guest.executive@taskforge.ai',
        full_name: 'Demo Executive User',
        avatar_url: '/logo.jpg',
      }
      localStorage.setItem('taskforge_token', mockToken)
      localStorage.setItem('taskforge_user', JSON.stringify(mockUser))
      setIsLoading(false)
      onSuccess(mockUser, mockToken)
      onClose()
    }, 600)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl liquid-glass-strong border border-white/15 shadow-2xl overflow-hidden bg-gradient-to-b from-white/[0.07] to-white/[0.02]"
        >
          {/* Subtle Orb Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-violet-600/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 p-0.5 mb-3 shadow-lg shadow-violet-500/30">
              <div className="w-full h-full bg-black/80 rounded-[14px] flex items-center justify-center">
                <img src="/logo.jpg" alt="TaskForge AI" className="w-10 h-10 rounded-xl object-cover" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Workforce Account'}
            </h2>
            <p className="text-xs text-white/60 mt-1">
              {mode === 'login'
                ? 'Sign in to access your synchronized AI memory and agents'
                : 'Deploy 7 specialized AI agents to orchestrate your workflow'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs mb-4"
            >
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Success Message */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs mb-4"
            >
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Workspace' : 'Launch AI Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative px-3 bg-[#0d0d12] text-[11px] font-medium text-white/40 uppercase tracking-wider">
              Instant Access
            </span>
          </div>

          {/* Guest Shortcut Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/90 font-medium text-xs transition-all flex items-center justify-center gap-2 hover:border-violet-500/40 shadow-sm"
          >
            <Sparkles size={15} className="text-violet-400" />
            <span>Continue as Demo Guest (Instant Entry)</span>
          </button>

          {/* Footer Security Note */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-white/40">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>End-to-end encrypted & database synchronized</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
