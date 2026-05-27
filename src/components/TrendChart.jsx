import { useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import useLocalStorage from '../hooks/useLocalStorage'

function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  date.setDate(date.getDate() - ((day + 6) % 7))
  date.setHours(0, 0, 0, 0)
  return date
}

function formatWeekKey(d) {
  const m = getMonday(d)
  return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}-${String(m.getDate()).padStart(2, '0')}`
}

function getLast6Weeks() {
  const weeks = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    const monday = getMonday(d)
    weeks.push({
      key: formatWeekKey(d),
      label: `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    })
  }
  return weeks
}

function getCurrentWeekData() {
  try {
    const weekKey = formatWeekKey(new Date())
    const jobAppsRaw = localStorage.getItem('cps_job_apps')
    const jobApps = jobAppsRaw ? JSON.parse(jobAppsRaw) : {}
    const weekApps = jobApps[weekKey] || { gmail: 0, manual: 0 }
    const totalApps = weekApps.gmail + weekApps.manual
    const kanbanRaw = localStorage.getItem('cps_kanban')
    const kanban = kanbanRaw ? JSON.parse(kanbanRaw) : []
    const tasksClosed = kanban.filter((c) => c.column === 'Done').length
    return { jobApps: totalApps, tasksClosed }
  } catch {
    return { jobApps: 0, tasksClosed: 0 }
  }
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-cc-surface rounded-lg border border-cc-border px-4 py-3 text-sm shadow-xl">
      <p className="font-mono text-cc-text-dim text-xs mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-mono text-xs" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export default function TrendChart() {
  const [snapshots, setSnapshots] = useLocalStorage('weekly_snapshots', {})

  useEffect(() => {
    const now = new Date()
    const weekKey = formatWeekKey(now)
    const isSunday = now.getDay() === 0
    const existing = snapshots[weekKey]
    if (isSunday && !existing?.finalized) {
      const data = getCurrentWeekData()
      setSnapshots((prev) => ({ ...prev, [weekKey]: { ...data, finalized: true } }))
    } else if (!existing) {
      const data = getCurrentWeekData()
      setSnapshots((prev) => ({ ...prev, [weekKey]: { ...data, finalized: false } }))
    }
  }, [])

  const weeks = getLast6Weeks()
  const currentWeekKey = formatWeekKey(new Date())
  const live = getCurrentWeekData()

  const data = weeks.map(({ key, label }) => {
    const isCurrentWeek = key === currentWeekKey
    const snap = isCurrentWeek ? live : snapshots[key] || {}
    return {
      week: label,
      'Job Apps': snap.jobApps || 0,
      'Tasks Closed': snap.tasksClosed || 0,
    }
  })

  return (
    <div className="bg-cc-panel rounded-lg border border-cc-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em]">Weekly Trends</h2>
        <span className="text-[10px] text-cc-text-muted font-mono">Last 6 weeks</span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: '#525252', fontFamily: 'monospace' }}
            axisLine={{ stroke: '#2a2a2a' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#525252', fontFamily: 'monospace' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(220,38,38,0.03)' }} />
          <Legend
            iconType="circle"
            iconSize={6}
            wrapperStyle={{ fontSize: 10, paddingTop: 8, fontFamily: 'monospace', color: '#737373' }}
          />
          <Bar dataKey="Job Apps" fill="#dc2626" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Tasks Closed" fill="#22c55e" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
