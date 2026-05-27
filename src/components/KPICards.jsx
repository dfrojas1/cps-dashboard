import { useEffect } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const TARGET = 12
const GMAIL_SEED = 2

function getWeekKey() {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`
}

function todayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function thisWeekKeys() {
  const keys = []
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
  }
  return keys
}

function JobAppsCard() {
  const weekKey = getWeekKey()
  const [data, setData] = useLocalStorage('job_apps', {})
  const weekData = data[weekKey] || { gmail: 0, manual: 0 }
  const count = weekData.gmail + weekData.manual

  useEffect(() => {
    const cur = data[weekKey]
    if (!cur || cur.gmail === 0) {
      setData((prev) => ({
        ...prev,
        [weekKey]: { gmail: GMAIL_SEED, manual: prev[weekKey]?.manual || 0 },
      }))
    }
  }, [weekKey])

  const increment = () =>
    setData((prev) => {
      const cur = prev[weekKey] || { gmail: 0, manual: 0 }
      return { ...prev, [weekKey]: { ...cur, manual: cur.manual + 1 } }
    })

  const pct = Math.min((count / TARGET) * 100, 100)

  return (
    <div className="bg-cc-panel rounded-lg p-5 border border-cc-border flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cc-red/[0.03] to-transparent pointer-events-none" />
      <div className="flex items-center justify-between relative">
        <span className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em]">
          Job Apps This Week
        </span>
        <button
          onClick={increment}
          className="w-7 h-7 rounded bg-cc-red/20 border border-cc-red/40 text-cc-red text-sm font-bold hover:bg-cc-red/30 transition-colors flex items-center justify-center font-mono"
        >
          +
        </button>
      </div>
      <div className="flex items-baseline gap-2 relative">
        <span className="text-4xl font-bold font-mono text-cc-red drop-shadow-[0_0_12px_rgba(220,38,38,0.3)]">
          {count}
        </span>
        <span className="text-sm text-cc-text-muted font-mono">/ {TARGET}</span>
      </div>
      <div className="w-full h-1.5 bg-cc-well rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct >= 100
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : pct >= 50
              ? 'linear-gradient(90deg, #dc2626, #ef4444)'
              : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            boxShadow: pct >= 50 ? '0 0 10px rgba(220,38,38,0.4)' : '0 0 10px rgba(245,158,11,0.3)',
          }}
        />
      </div>
      <span className="text-[10px] text-cc-text-muted font-mono relative">
        {weekData.gmail} gmail · {weekData.manual} manual
      </span>
    </div>
  )
}

function LiveStatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-cc-panel rounded-lg p-5 border border-cc-border flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cc-red/[0.02] to-transparent pointer-events-none" />
      <span className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em] relative">
        {label}
      </span>
      <span className={`text-4xl font-bold font-mono relative ${accent ? 'text-cc-red drop-shadow-[0_0_12px_rgba(220,38,38,0.3)]' : 'text-cc-text'}`}>
        {value}
      </span>
      {sub && <span className="text-[10px] text-cc-text-muted font-mono relative">{sub}</span>}
    </div>
  )
}

export default function KPICards() {
  // Pull Claude Sessions from usage tracker
  const [usage] = useLocalStorage('claude_usage', {})
  const today = todayKey()
  const todaySessions = usage[today]?.sessions || 0

  // Pull Open Tasks from Kanban (non-Done cards)
  const [kanban] = useLocalStorage('kanban', [])
  const openTasks = kanban.filter((c) => c.column !== 'Done').length

  // Pull Site Updates from Activity Log "Web Work" tab this week
  const [activityLog] = useLocalStorage('activity_log', { 'Claude Code': [], 'Web Work': [], 'Notes': [] })
  const weekKeys = thisWeekKeys()
  const webEntries = (activityLog['Web Work'] || []).filter((e) => weekKeys.includes(e.date))
  const siteUpdates = webEntries.length

  return (
    <div className="grid grid-cols-4 gap-3">
      <JobAppsCard />
      <LiveStatCard label="Claude Sessions" value={todaySessions} sub="Today" accent={todaySessions > 0} />
      <LiveStatCard label="Site Updates" value={siteUpdates} sub="This week" accent={siteUpdates > 0} />
      <LiveStatCard label="Open Tasks" value={openTasks} sub="Across projects" accent={openTasks > 0} />
    </div>
  )
}
