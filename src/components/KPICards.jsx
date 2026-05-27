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
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Job Apps This Week
        </span>
        <button
          onClick={increment}
          className="w-7 h-7 rounded-lg bg-sf-blue text-white text-sm font-bold hover:bg-sf-blue-light transition-colors flex items-center justify-center"
        >
          +
        </button>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-gray-900">{count}</span>
        <span className="text-sm text-gray-400">/ {TARGET}</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 100 ? '#10b981' : pct >= 50 ? '#0176d3' : '#f59e0b',
          }}
        />
      </div>
      <span className="text-xs text-gray-400">
        {weekData.gmail} from Gmail · {weekData.manual} manual
      </span>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  )
}

export default function KPICards() {
  return (
    <div className="grid grid-cols-4 gap-5">
      <JobAppsCard />
      <StatCard label="Claude Sessions" value="—" sub="Today" />
      <StatCard label="Site Updates" value="—" sub="This week" />
      <StatCard label="Open Tasks" value="—" sub="Across projects" />
    </div>
  )
}
