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

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-cc-panel rounded-lg p-5 border border-cc-border flex flex-col gap-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
      <span className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em] relative">
        {label}
      </span>
      <span className="text-4xl font-bold font-mono text-cc-text relative">{value}</span>
      {sub && <span className="text-[10px] text-cc-text-muted font-mono relative">{sub}</span>}
    </div>
  )
}

export default function KPICards() {
  return (
    <div className="grid grid-cols-4 gap-3">
      <JobAppsCard />
      <StatCard label="Claude Sessions" value="—" sub="Today" />
      <StatCard label="Site Updates" value="—" sub="This week" />
      <StatCard label="Open Tasks" value="—" sub="Across projects" />
    </div>
  )
}
