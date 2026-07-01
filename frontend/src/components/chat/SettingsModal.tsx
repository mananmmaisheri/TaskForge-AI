import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  User,
  Cpu,
  Database,
  Sliders,
  Check,
  Key,
  Trash2,
  Download,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onClearHistory: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'agents' | 'mcp' | 'memory'>('profile')
  const [isSaved, setIsSaved] = useState(false)

  // Profile state
  const [userName, setUserName] = useState('Manan Pro Engineer')
  const [userEmail, setUserEmail] = useState('manan@taskforge.ai')
  const [apiKey, setApiKey] = useState('adk_live_998348723984723984_enterprise')
  const [showApiKey, setShowApiKey] = useState(false)

  // Agent Preferences
  const [temperature, setTemperature] = useState(0.2)
  const [maxAgents, setMaxAgents] = useState(5)
  const [autoOrchestrate, setAutoOrchestrate] = useState(true)
  const [enableSandboxedAST, setEnableSandboxedAST] = useState(true)

  // MCP Tools state
  const [tools, setTools] = useState([
    { id: 'calendar', name: 'calendar_tool', desc: 'Schedule management & availability checking', enabled: true, category: 'Productivity' },
    { id: 'notes', name: 'notes_tool', desc: 'Knowledge base search & note summarization', enabled: true, category: 'Memory' },
    { id: 'task', name: 'task_tool', desc: 'Kanban workflow & deadline priority optimization', enabled: true, category: 'Workflow' },
    { id: 'file', name: 'file_tool', desc: 'Sandboxed file reading, writing & directory listing', enabled: true, category: 'Storage' },
    { id: 'search', name: 'search_tool', desc: 'External web search simulation & fact verification', enabled: true, category: 'Research' },
    { id: 'calculator', name: 'calculator_tool', desc: 'Sandboxed AST math expression evaluation', enabled: true, category: 'Compute' },
    { id: 'reminder', name: 'reminder_tool', desc: 'Revision alerts & habit notification schedules', enabled: true, category: 'Productivity' },
    { id: 'email', name: 'email_tool', desc: 'Drafting emails & sending automated notifications', enabled: true, category: 'Communication' },
    { id: 'weather', name: 'weather_tool', desc: 'Local weather conditions & 5-day forecast sync', enabled: true, category: 'Ambient' },
    { id: 'time', name: 'time_tool', desc: 'UTC/local clock & timezone difference conversions', enabled: true, category: 'Ambient' },
  ])

  if (!isOpen) return null

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
      onClose()
    }, 800)
  }

  const handleToggleTool = (id: string) => {
    setTools(tools.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t)))
  }

  const exportMemory = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      user: { name: userName, email: userEmail, tier: 'Enterprise' },
      preferences: { temperature, maxAgents, autoOrchestrate },
      mcp_tools_active: tools.filter((t) => t.enabled).map((t) => t.name),
      timestamp: new Date().toISOString()
    }, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `taskforge_memory_export_${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl overflow-hidden backdrop-blur-2xl z-10 flex flex-col md:flex-row h-[620px] max-h-[90vh]"
      >
        {/* Sidebar Navigation Tabs */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/[0.08] bg-black/40 p-4 flex flex-row md:flex-col justify-between flex-shrink-0 overflow-x-auto">
          <div>
            <div className="flex items-center gap-2.5 px-3 py-2 mb-6 hidden md:flex">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
                <Sliders size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-serif tracking-tight">Settings & Profile</h3>
                <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider">TaskForge OS v2.4</p>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-1 w-full">
              {[
                { id: 'profile', label: 'User Profile', icon: User, badge: 'Pro' },
                { id: 'agents', label: 'Google ADK Config', icon: Cpu, badge: '7 Agents' },
                { id: 'mcp', label: 'MCP Tools Registry', icon: Database, badge: `${tools.filter(t=>t.enabled).length} Active` },
                { id: 'memory', label: 'Data & Memory', icon: Sliders },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/10 text-white border border-violet-500/30 shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <tab.icon size={16} className={activeTab === tab.id ? 'text-violet-400' : 'text-white/40'} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-white/40'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* User Tier Footnote */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-900/30 to-indigo-900/20 border border-violet-500/20 hidden md:block">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-300 mb-1">
              <Sparkles size={14} className="text-violet-400" />
              <span>Enterprise Edition</span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Unlimited multi-agent orchestration & sandboxed AST math evaluation.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar p-6 bg-gradient-to-b from-zinc-950/80 to-black/90">
          <div>
            {/* Header & Close Button */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/[0.08]">
              <h2 className="text-lg font-bold text-white font-serif">
                {activeTab === 'profile' && 'User Profile & Account'}
                {activeTab === 'agents' && 'Google ADK Multi-Agent Orchestrator'}
                {activeTab === 'mcp' && 'Model Context Protocol (MCP) Tools'}
                {activeTab === 'memory' && 'Workspace Memory & Data Management'}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* TAB 1: USER PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                {/* Avatar Banner */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <img src="/logo.jpg" alt="TaskForge AI Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-500/40 shadow-xl shadow-violet-500/20" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-white tracking-tight truncate">{userName}</h4>
                    <p className="text-xs text-white/50 truncate font-mono">{userEmail}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-mono font-semibold">
                        ● Active Status
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-mono">
                        Pro Tier
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider font-mono mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-violet-500 text-sm text-white outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider font-mono mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-violet-500 text-sm text-white outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider font-mono mb-1.5 flex items-center justify-between">
                      <span>TaskForge API Key (Bearer Token)</span>
                      <span className="text-[10px] text-violet-400 cursor-pointer hover:underline" onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? 'Hide' : 'Reveal'}
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <Key size={16} className="absolute left-3.5 text-white/30 pointer-events-none" />
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-violet-500 text-sm text-white font-mono outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AGENTS CONFIG */}
            {activeTab === 'agents' && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-200 leading-relaxed">
                  <span className="font-bold text-white">Google ADK v1.2.0 Active:</span> The Root Orchestrator dynamically evaluates incoming user intent and delegates sub-tasks across 7 specialized agents.
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Autonomous Agent Routing</h4>
                      <p className="text-xs text-white/40 mt-0.5">Let orchestrator automatically select collaborating agents</p>
                    </div>
                    <button
                      onClick={() => setAutoOrchestrate(!autoOrchestrate)}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${autoOrchestrate ? 'bg-violet-600' : 'bg-white/10'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${autoOrchestrate ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Sandboxed AST Math Evaluation</h4>
                      <p className="text-xs text-white/40 mt-0.5">Enforce AST literal parsing boundary in Calculator tool</p>
                    </div>
                    <button
                      onClick={() => setEnableSandboxedAST(!enableSandboxedAST)}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 ${enableSandboxedAST ? 'bg-violet-600' : 'bg-white/10'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enableSandboxedAST ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">LLM Creativity / Temperature</span>
                      <span className="font-mono text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-violet-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-white/30">
                      <span>0.0 (Precise / Analytical)</span>
                      <span>1.0 (Creative / Brainstorming)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">Max Delegated Sub-Agents per Turn</span>
                      <span className="font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{maxAgents} Agents</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      step="1"
                      value={maxAgents}
                      onChange={(e) => setMaxAgents(parseInt(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MCP TOOLS REGISTRY */}
            {activeTab === 'mcp' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-white/50 px-1 font-mono">
                  <span>FastMCP Server Protocol Active</span>
                  <span>{tools.filter(t => t.enabled).length} of {tools.length} Tools Enabled</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {tools.map((tool) => (
                    <div
                      key={tool.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        tool.enabled
                          ? 'bg-white/[0.04] border-white/[0.1] text-white'
                          : 'bg-white/[0.01] border-white/[0.04] text-white/40 opacity-60'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-violet-300">{tool.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/[0.06] text-white/50">
                            {tool.category}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 truncate mt-1">{tool.desc}</p>
                      </div>

                      <button
                        onClick={() => handleToggleTool(tool.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-colors flex-shrink-0 ${
                          tool.enabled
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-white/10 text-white/50 hover:bg-white/15'
                        }`}
                      >
                        {tool.enabled ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: DATA & MEMORY */}
            {activeTab === 'memory' && (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
                  <span className="font-bold text-white">Distributed Blackboard Memory:</span> Agents deposit intermediate findings into shared Redis/PostgreSQL vector storage for long-term retention.
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Export Workspace Memory</h4>
                      <p className="text-xs text-white/40 mt-0.5">Download JSON dump of agent preferences & tool states</p>
                    </div>
                    <button
                      onClick={exportMemory}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                    >
                      <Download size={14} />
                      <span>Export JSON</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Reset Shared Blackboard</h4>
                      <p className="text-xs text-white/40 mt-0.5">Clear temporary intermediate agent synthesis cache</p>
                    </div>
                    <button
                      onClick={() => alert('Shared blackboard memory reset successfully!')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
                    >
                      <RefreshCw size={14} />
                      <span>Reset Cache</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <div>
                      <h4 className="text-sm font-semibold text-red-300 flex items-center gap-1.5">
                        <ShieldAlert size={16} />
                        <span>Clear All Chat History</span>
                      </h4>
                      <p className="text-xs text-red-200/60 mt-0.5">Permanently delete all conversation threads from workspace</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete all chat sessions?')) {
                          onClearHistory()
                          onClose()
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 text-xs font-bold shadow-lg shadow-red-500/20 transition-all"
                    >
                      <Trash2 size={14} />
                      <span>Clear History</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 mt-6 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-xs text-white/30 font-mono hidden sm:inline">
              Changes auto-sync with TaskForge Cloud
            </span>
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-500/30 transition-all active:scale-95"
              >
                {isSaved ? (
                  <>
                    <Check size={14} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Preferences</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
