import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  Bell,
  Sparkles,
  X,
  Volume2,
  BellRing,
} from 'lucide-react'

export interface TodoItem {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  createdAt: string
  reminderTime?: string // format HH:MM
}

export interface AlarmItem {
  id: string
  time: string // format HH:MM
  label: string
  active: boolean
}

interface TodoAlarmsModalProps {
  isOpen: boolean
  onClose: () => void
  onAskAI?: (prompt: string) => void
}

export const TodoAlarmsModal: React.FC<TodoAlarmsModalProps> = ({ isOpen, onClose, onAskAI }) => {
  const [activeTab, setActiveTab] = useState<'todos' | 'alarms'>('todos')

  // Todo State
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('taskforge_todos')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return [
      {
        id: 'todo_1',
        title: 'Review TaskForge AI Agent orchestration logs',
        priority: 'high',
        completed: false,
        createdAt: new Date().toLocaleDateString(),
        reminderTime: '18:00',
      },
      {
        id: 'todo_2',
        title: 'Optimize Redis cache TTL parameters',
        priority: 'medium',
        completed: true,
        createdAt: new Date().toLocaleDateString(),
      },
    ]
  })
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [newTodoPriority, setNewTodoPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [newTodoReminder, setNewTodoReminder] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  // Alarm State
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    const saved = localStorage.getItem('taskforge_alarms')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    // Default sample alarm in 5 minutes
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5)
    const timeStr = now.toTimeString().slice(0, 5)
    return [
      { id: 'alm_1', time: timeStr, label: 'Workspace Sync Reminder', active: true },
    ]
  })
  const [newAlarmTime, setNewAlarmTime] = useState('')
  const [newAlarmLabel, setNewAlarmLabel] = useState('')

  // Triggered Alarm state
  const [ringingAlarm, setRingingAlarm] = useState<string | null>(null)

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('taskforge_todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem('taskforge_alarms', JSON.stringify(alarms))
  }, [alarms])

  // Play Web Audio Beep
  const playAlarmSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(880, audioCtx.currentTime) // A5
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.4)
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.4)
    } catch (e) {
      console.error('Audio play failed:', e)
    }
  }

  // Background Alarm Checker (runs every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const currentHHMM = now.toTimeString().slice(0, 5)
      
      // Check alarms
      alarms.forEach((alm) => {
        if (alm.active && alm.time === currentHHMM) {
          setRingingAlarm(`⏰ ALARM: ${alm.label} (${alm.time})`)
          playAlarmSound()
        }
      })

      // Check todo reminders
      todos.forEach((todo) => {
        if (!todo.completed && todo.reminderTime && todo.reminderTime === currentHHMM) {
          setRingingAlarm(`📋 TASK REMINDER: ${todo.title} (${todo.reminderTime})`)
          playAlarmSound()
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [alarms, todos])

  if (!isOpen && !ringingAlarm) return null

  // Todo handlers
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodoTitle.trim()) return
    const item: TodoItem = {
      id: `todo_${Date.now()}`,
      title: newTodoTitle.trim(),
      priority: newTodoPriority,
      completed: false,
      createdAt: new Date().toLocaleDateString(),
      reminderTime: newTodoReminder || undefined,
    }
    setTodos([item, ...todos])
    setNewTodoTitle('')
    setNewTodoReminder('')
  }

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id))
  }

  // Alarm handlers
  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAlarmTime) return
    const alm: AlarmItem = {
      id: `alm_${Date.now()}`,
      time: newAlarmTime,
      label: newAlarmLabel.trim() || 'AI Reminder Alarm',
      active: true,
    }
    setAlarms([...alarms, alm])
    setNewAlarmTime('')
    setNewAlarmLabel('')
  }

  const handleToggleAlarm = (id: string) => {
    setAlarms(alarms.map((a) => (a.id === id ? { ...a, active: !a.active } : a)))
  }

  const handleDeleteAlarm = (id: string) => {
    setAlarms(alarms.filter((a) => a.id !== id))
  }

  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  return (
    <AnimatePresence>
      {/* ── Ringing Alarm Toast Popup ── */}
      {ringingAlarm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
        >
          <div className="liquid-glass p-5 rounded-3xl border-2 border-red-500/80 shadow-2xl shadow-red-500/30 bg-black/90 flex flex-col gap-4 animate-bounce-subtle">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 animate-pulse">
                <BellRing size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-black text-sm uppercase tracking-wider text-red-400">Alarm Ringing!</h4>
                <p className="text-white font-bold text-base truncate">{ringingAlarm}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  playAlarmSound()
                  setRingingAlarm(null)
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg transition-all"
              >
                Dismiss Alarm
              </button>
              <button
                onClick={() => {
                  setRingingAlarm(null)
                }}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-all"
              >
                Snooze 5m
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Main Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-2xl bg-zinc-950/90 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">AI Task Manager & Alarms</h3>
                  <p className="text-xs text-white/50 font-mono">Persistent Local Storage • Autonomous Reminders</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mt-4 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setActiveTab('todos')}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'todos'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <CheckCircle2 size={15} />
                <span>To-Do List ({todos.filter(t => !t.completed).length} active)</span>
              </button>
              <button
                onClick={() => setActiveTab('alarms')}
                className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'alarms'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Bell size={15} />
                <span>Working Alarms ({alarms.filter(a => a.active).length} active)</span>
              </button>
            </div>

            {/* ── Tab Content: TODOS ── */}
            {activeTab === 'todos' && (
              <div className="flex-1 flex flex-col mt-4 min-h-0 overflow-y-auto pr-1 space-y-4">
                {/* Add Todo Form */}
                <form onSubmit={handleAddTodo} className="space-y-2 bg-white/[0.03] p-3 rounded-2xl border border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a new task (e.g. Prepare client review report)..."
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500"
                    />
                    <button
                      type="submit"
                      disabled={!newTodoTitle.trim()}
                      className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-bold px-4 rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-violet-600/30"
                    >
                      <Plus size={16} />
                      <span>Add</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <span>Priority:</span>
                      {(['high', 'medium', 'low'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewTodoPriority(p)}
                          className={`px-2.5 py-1 rounded-md font-semibold uppercase text-[10px] transition-all border ${
                            newTodoPriority === p
                              ? p === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/50'
                              : p === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                              : 'bg-transparent border-white/10 text-white/40 hover:text-white/80'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <Clock size={13} className="text-violet-400" />
                      <span>Reminder:</span>
                      <input
                        type="time"
                        value={newTodoReminder}
                        onChange={(e) => setNewTodoReminder(e.target.value)}
                        className="bg-black/60 border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>
                </form>

                {/* Filter and Ask AI button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06] text-xs">
                    {(['all', 'active', 'completed'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1 rounded-md font-medium capitalize transition-all ${
                          filter === f ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  {onAskAI && (
                    <button
                      onClick={() => {
                        const prompt = `Here is my current To-Do List:\n${todos
                          .map((t) => `- [${t.completed ? 'x' : ' '}] (${t.priority.toUpperCase()}) ${t.title}${t.reminderTime ? ` (Reminder: ${t.reminderTime})` : ''}`)
                          .join('\n')}\n\nPlease analyze my tasks, recommend an optimal execution schedule, and suggest any missing items.`
                        onAskAI(prompt)
                        onClose()
                      }}
                      className="text-xs bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles size={13} className="text-amber-400" />
                      <span>Ask AI to Plan Tasks</span>
                    </button>
                  )}
                </div>

                {/* Todo List Items */}
                <div className="space-y-2 pb-2">
                  {filteredTodos.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-xs font-mono">
                      No tasks found in this view.
                    </div>
                  ) : (
                    filteredTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                          todo.completed
                            ? 'bg-white/[0.02] border-white/5 opacity-50'
                            : 'bg-white/[0.04] hover:bg-white/[0.06] border-white/10'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleTodo(todo.id)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          {todo.completed ? (
                            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle size={18} className="text-white/40 hover:text-violet-400 flex-shrink-0 transition-colors" />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span
                              className={`text-sm font-medium truncate ${
                                todo.completed ? 'line-through text-white/50' : 'text-white'
                              }`}
                            >
                              {todo.title}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-white/40 font-mono">
                              <span className={`uppercase font-bold ${
                                todo.priority === 'high' ? 'text-red-400' : todo.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {todo.priority}
                              </span>
                              {todo.reminderTime && (
                                <span className="flex items-center gap-1 text-cyan-300 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/20">
                                  <Clock size={10} />
                                  <span>{todo.reminderTime}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 flex items-center justify-center transition-colors flex-shrink-0"
                          title="Delete task"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── Tab Content: ALARMS ── */}
            {activeTab === 'alarms' && (
              <div className="flex-1 flex flex-col mt-4 min-h-0 overflow-y-auto pr-1 space-y-4">
                {/* Add Alarm Form */}
                <form onSubmit={handleAddAlarm} className="space-y-3 bg-white/[0.03] p-4 rounded-2xl border border-white/10">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex flex-col gap-1 w-full sm:w-36">
                      <label className="text-[11px] text-white/60 font-mono">ALARM TIME</label>
                      <input
                        type="time"
                        required
                        value={newAlarmTime}
                        onChange={(e) => setNewAlarmTime(e.target.value)}
                        className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-base font-bold text-white outline-none focus:border-violet-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-[11px] text-white/60 font-mono">LABEL / REMINDER NOTE</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Standup Meeting / Take Break..."
                          value={newAlarmLabel}
                          onChange={(e) => setNewAlarmLabel(e.target.value)}
                          className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500"
                        />
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-4 rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-lg shadow-violet-600/30"
                        >
                          <Plus size={16} />
                          <span>Set Alarm</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-white/50 pt-1">
                    <span className="flex items-center gap-1.5 font-mono text-cyan-300">
                      <Volume2 size={14} />
                      <span>Sound: Web Audio Synthesized Beep (A5 Note)</span>
                    </span>
                    <button
                      type="button"
                      onClick={playAlarmSound}
                      className="text-xs text-violet-300 hover:text-white underline font-semibold transition-colors"
                    >
                      Test Sound
                    </button>
                  </div>
                </form>

                {/* Alarm List Items */}
                <div className="space-y-2.5 pb-2">
                  {alarms.length === 0 ? (
                    <div className="text-center py-8 text-white/40 text-xs font-mono">
                      No active reminder alarms set.
                    </div>
                  ) : (
                    alarms.map((alm) => (
                      <div
                        key={alm.id}
                        className={`flex items-center justify-between gap-4 p-3.5 rounded-2xl border transition-all ${
                          alm.active
                            ? 'bg-gradient-to-r from-white/[0.06] to-white/[0.02] border-violet-500/40 shadow-lg shadow-violet-500/5'
                            : 'bg-white/[0.02] border-white/5 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <button
                            onClick={() => handleToggleAlarm(alm.id)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              alm.active
                                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                                : 'bg-white/10 text-white/40'
                            }`}
                            title={alm.active ? 'Disable alarm' : 'Enable alarm'}
                          >
                            <Bell size={18} />
                          </button>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-extrabold text-white tracking-tight font-mono">
                                {alm.time}
                              </span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                                alm.active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-500'
                              }`}>
                                {alm.active ? 'Active' : 'Off'}
                              </span>
                            </div>
                            <span className="text-xs text-white/70 font-medium">{alm.label}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteAlarm(alm.id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400 flex items-center justify-center transition-colors flex-shrink-0"
                          title="Delete alarm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
