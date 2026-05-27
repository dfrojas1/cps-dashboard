import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    })
  }
  return days
}

const TIER_LIMITS = { pro: { label: 'PRO', dailySessions: 45, monthlyMessages: 900 } }

function UsageBar({ used, limit, label }) {
  const pct = Math.min((used / limit) * 100, 100)
  const crit = pct >= 95
  const warn = pct >= 80
  return (
    <div className="mb-4">
      <div className="flex justify-between text-[10px] mb-1.5 font-mono">
        <span className="text-cc-text-dim uppercase tracking-wider">{label}</span>
        <span className={crit ? 'text-cc-red-glow font-bold' : warn ? 'text-cc-amber font-bold' : 'text-cc-text-muted'}>
          {used} / {limit}
        </span>
      </div>
      <div className="w-full h-2 bg-cc-well rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: crit
              ? 'linear-gradient(90deg, #dc2626, #ef4444)'
              : warn
              ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
              : 'linear-gradient(90deg, #dc2626, #991b1b)',
            boxShadow: crit ? '0 0 12px rgba(239,68,68,0.5)' : '0 0 8px rgba(220,38,38,0.3)',
          }}
        />
      </div>
    </div>
  )
}

function DayRow({ day, data, isToday }) {
  return (
    <div className={`flex items-center justify-between text-xs px-3 py-2 rounded ${
      isToday ? 'bg-cc-red/5 border border-cc-red/20' : 'hover:bg-white/[0.02]'
    }`}>
      <span className={`font-mono ${isToday ? 'text-cc-red' : 'text-cc-text-dim'}`}>
        {day.label}
        {isToday && <span className="ml-2 text-[9px] bg-cc-red/20 text-cc-red px-1.5 py-0.5 rounded font-bold tracking-wider">LIVE</span>}
      </span>
      <div className="flex items-center gap-4 font-mono">
        <span className="text-cc-text-dim">{data.sessions} <span className="text-cc-text-muted">sess</span></span>
        <span className="text-cc-text-muted">{data.messages} <span className="text-cc-text-muted">msg</span></span>
      </div>
    </div>
  )
}

export default function ClaudeUsage() {
  const tier = TIER_LIMITS.pro
  const [usage, setUsage] = useLocalStorage('claude_usage', {})
  const [showForm, setShowForm] = useState(false)
  const [sessions, setSessions] = useState('')
  const [messages, setMessages] = useState('')

  const today = todayKey()
  const todayData = usage[today] || { sessions: 0, messages: 0 }
  const days = getLast7Days()

  const monthKey = today.slice(0, 7)
  const monthMessages = Object.entries(usage)
    .filter(([k]) => k.startsWith(monthKey))
    .reduce((sum, [, v]) => sum + (v.messages || 0), 0)

  const weekSessions = days.reduce((sum, d) => sum + (usage[d.key]?.sessions || 0), 0)

  const logUsage = (e) => {
    e.preventDefault()
    const s = parseInt(sessions) || 0
    const m = parseInt(messages) || 0
    if (s === 0 && m === 0) return
    setUsage((prev) => ({
      ...prev,
      [today]: {
        sessions: (prev[today]?.sessions || 0) + s,
        messages: (prev[today]?.messages || 0) + m,
      },
    }))
    setSessions('')
    setMessages('')
    setShowForm(false)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Today', val: todayData.sessions, unit: 'sessions', sub: `${todayData.messages} messages` },
          { label: 'This Week', val: weekSessions, unit: 'sessions', sub: '7-day rolling' },
          { label: 'This Month', val: monthMessages, unit: 'messages', sub: `${tier.label} tier` },
        ].map((c) => (
          <div key={c.label} className="bg-cc-panel rounded-lg p-5 border border-cc-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cc-red/[0.02] to-transparent pointer-events-none" />
            <span className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em] relative">{c.label}</span>
            <div className="mt-2 flex items-baseline gap-1.5 relative">
              <span className="text-4xl font-bold font-mono text-cc-red drop-shadow-[0_0_12px_rgba(220,38,38,0.3)]">{c.val}</span>
              <span className="text-xs text-cc-text-muted font-mono">{c.unit}</span>
            </div>
            <span className="text-[10px] text-cc-text-muted font-mono relative">{c.sub}</span>
          </div>
        ))}
      </div>

      <div className="bg-cc-panel rounded-lg p-5 border border-cc-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em]">Rate Limits</h3>
          <span className="text-[10px] text-cc-text-muted font-mono">{tier.label} Plan</span>
        </div>
        <UsageBar used={todayData.sessions} limit={tier.dailySessions} label="Daily Sessions" />
        <UsageBar used={monthMessages} limit={tier.monthlyMessages} label="Monthly Messages" />
      </div>

      <div className="bg-cc-panel rounded-lg p-5 border border-cc-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em]">7-Day History</h3>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-[10px] font-mono font-medium px-3 py-1.5 rounded bg-cc-red/20 border border-cc-red/40 text-cc-red hover:bg-cc-red/30 transition-colors tracking-wider"
          >
            {showForm ? 'CANCEL' : 'LOG SESSION'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={logUsage} className="flex gap-2 mb-4 p-3 bg-cc-red/5 rounded border border-cc-red/20">
            <input type="number" min="0" value={sessions} onChange={(e) => setSessions(e.target.value)} placeholder="Sessions"
              className="w-24 text-xs px-3 py-2 rounded bg-cc-well border border-cc-border text-cc-text font-mono focus:outline-none focus:ring-1 focus:ring-cc-red/30" />
            <input type="number" min="0" value={messages} onChange={(e) => setMessages(e.target.value)} placeholder="Messages"
              className="w-24 text-xs px-3 py-2 rounded bg-cc-well border border-cc-border text-cc-text font-mono focus:outline-none focus:ring-1 focus:ring-cc-red/30" />
            <button type="submit" className="text-xs font-mono font-medium px-4 py-2 rounded bg-cc-red text-white hover:bg-cc-red-glow transition-colors tracking-wider">
              SAVE
            </button>
          </form>
        )}

        <div className="flex flex-col gap-1">
          {days.map((day) => (
            <DayRow key={day.key} day={day} data={usage[day.key] || { sessions: 0, messages: 0 }} isToday={day.key === today} />
          ))}
        </div>
      </div>
    </div>
  )
}
