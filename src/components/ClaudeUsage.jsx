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
      short: d.toLocaleDateString('en-US', { weekday: 'short' }),
    })
  }
  return days
}

const TIER_LIMITS = {
  pro: { label: 'Pro', dailySessions: 45, monthlyMessages: 900 },
}

function UsageBar({ used, limit, label, color }) {
  const pct = Math.min((used / limit) * 100, 100)
  const warn = pct >= 80
  const crit = pct >= 95
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={crit ? 'text-red-600 font-semibold' : warn ? 'text-amber-600 font-semibold' : 'text-gray-500'}>
          {used} / {limit}
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: crit ? '#ef4444' : warn ? '#f59e0b' : color,
          }}
        />
      </div>
    </div>
  )
}

function DayRow({ day, data, isToday }) {
  return (
    <div className={`flex items-center justify-between text-sm px-3 py-2 rounded-lg ${isToday ? 'bg-purple-50 border border-purple-100' : 'hover:bg-gray-50'}`}>
      <span className={`font-medium ${isToday ? 'text-purple-700' : 'text-gray-700'}`}>
        {day.label}
        {isToday && <span className="ml-2 text-[10px] bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">TODAY</span>}
      </span>
      <div className="flex items-center gap-4">
        <span className="text-gray-500">{data.sessions} sessions</span>
        <span className="text-gray-400 text-xs">{data.messages} msgs</span>
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
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Today</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-gray-900">{todayData.sessions}</span>
            <span className="text-sm text-gray-400">sessions</span>
          </div>
          <span className="text-xs text-gray-400">{todayData.messages} messages</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">This Week</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-gray-900">{weekSessions}</span>
            <span className="text-sm text-gray-400">sessions</span>
          </div>
          <span className="text-xs text-gray-400">7-day rolling</span>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">This Month</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-gray-900">{monthMessages}</span>
            <span className="text-sm text-gray-400">messages</span>
          </div>
          <span className="text-xs text-gray-400">{tier.label} tier</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Rate Limits</h3>
          <span className="text-xs text-gray-400">{tier.label} Plan</span>
        </div>
        <UsageBar used={todayData.sessions} limit={tier.dailySessions} label="Daily Sessions" color="#8b5cf6" />
        <UsageBar used={monthMessages} limit={tier.monthlyMessages} label="Monthly Messages" color="#0176d3" />
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">7-Day History</h3>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Log Session'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={logUsage} className="flex gap-2 mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <input
              type="number"
              min="0"
              value={sessions}
              onChange={(e) => setSessions(e.target.value)}
              placeholder="Sessions"
              className="w-24 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <input
              type="number"
              min="0"
              value={messages}
              onChange={(e) => setMessages(e.target.value)}
              placeholder="Messages"
              className="w-24 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button
              type="submit"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Save
            </button>
          </form>
        )}

        <div className="flex flex-col gap-1">
          {days.map((day) => (
            <DayRow
              key={day.key}
              day={day}
              data={usage[day.key] || { sessions: 0, messages: 0 }}
              isToday={day.key === today}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
