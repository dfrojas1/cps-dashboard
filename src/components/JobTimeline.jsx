import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Brush, Cell, AreaChart, Area, ReferenceLine
} from 'recharts'

const RANGE_OPTIONS = [
  { key: '2w',  label: '2 Weeks',   days: 14 },
  { key: '1m',  label: '1 Month',   days: 30 },
  { key: '3m',  label: '3 Months',  days: 90 },
  { key: '6m',  label: '6 Months',  days: 180 },
  { key: 'all', label: 'All Time',  days: 9999 },
]

const STATUS_COLORS = {
  applied:  '#dc2626',
  rejected: '#525252',
  interview: '#f59e0b',
  offer:    '#22c55e',
}

const SOURCE_COLORS = {
  direct:   '#dc2626',
  linkedin: '#3b82f6',
  internal: '#f59e0b',
}

function getWeekLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getMonthLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function getMondayKey(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function getMonthKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const data = payload[0]?.payload
  return (
    <div className="bg-cc-surface rounded-lg border border-cc-border px-4 py-3 text-sm shadow-xl backdrop-blur-sm">
      <p className="font-mono text-cc-text-dim text-[10px] mb-2 uppercase tracking-wider">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-mono text-xs flex items-center gap-2" style={{ color: p.color || p.fill }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color || p.fill }} />
          {p.name}: <span className="font-bold text-cc-text">{p.value}</span>
        </p>
      ))}
      {data?.companies && (
        <div className="mt-2 pt-2 border-t border-cc-border">
          <p className="text-[9px] text-cc-text-muted uppercase tracking-wider mb-1">Companies</p>
          <p className="text-[10px] text-cc-text-dim font-mono leading-relaxed">{data.companies}</p>
        </div>
      )}
    </div>
  )
}

function StatBadge({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold font-mono" style={{ color, textShadow: `0 0 12px ${color}40` }}>{value}</span>
      <span className="text-[8px] text-cc-text-muted uppercase tracking-widest font-mono">{label}</span>
    </div>
  )
}

export default function JobTimeline() {
  const [apps, setApps] = useState([])
  const [range, setRange] = useState('6m')
  const [view, setView] = useState('weekly') // weekly | monthly | cumulative
  const [hoveredBar, setHoveredBar] = useState(null)

  useEffect(() => {
    fetch('/data/job_applications.json')
      .then((r) => r.json())
      .then(setApps)
      .catch(() => setApps([]))
  }, [])

  const rangeOption = RANGE_OPTIONS.find((r) => r.key === range)
  const cutoff = useMemo(() => {
    if (range === 'all') return '2000-01-01'
    const d = new Date()
    d.setDate(d.getDate() - rangeOption.days)
    return d.toISOString().slice(0, 10)
  }, [range, rangeOption])

  const filtered = useMemo(() => apps.filter((a) => a.date >= cutoff), [apps, cutoff])

  // Stats
  const stats = useMemo(() => {
    const total = filtered.length
    const applied = filtered.filter((a) => a.status === 'applied').length
    const rejected = filtered.filter((a) => a.status === 'rejected').length
    const responseRate = total > 0 ? Math.round((rejected / total) * 100) : 0
    const uniqueCompanies = [...new Set(filtered.map((a) => a.company))].length
    const avgPerWeek = total > 0 ? (total / Math.max(1, rangeOption.days / 7)).toFixed(1) : '0'
    return { total, applied, rejected, responseRate, uniqueCompanies, avgPerWeek }
  }, [filtered, rangeOption])

  // Weekly data
  const weeklyData = useMemo(() => {
    const buckets = {}
    filtered.forEach((a) => {
      const wk = getMondayKey(a.date)
      if (!buckets[wk]) buckets[wk] = { applied: 0, rejected: 0, interview: 0, offer: 0, companies: [] }
      buckets[wk][a.status] = (buckets[wk][a.status] || 0) + 1
      if (!buckets[wk].companies.includes(a.company)) buckets[wk].companies.push(a.company)
    })
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => ({
        date: key,
        label: getWeekLabel(key),
        applied: val.applied,
        rejected: val.rejected,
        interview: val.interview || 0,
        offer: val.offer || 0,
        total: val.applied + val.rejected + (val.interview || 0) + (val.offer || 0),
        companies: val.companies.join(', '),
      }))
  }, [filtered])

  // Monthly data
  const monthlyData = useMemo(() => {
    const buckets = {}
    filtered.forEach((a) => {
      const mk = getMonthKey(a.date)
      if (!buckets[mk]) buckets[mk] = { applied: 0, rejected: 0, interview: 0, offer: 0, companies: [] }
      buckets[mk][a.status] = (buckets[mk][a.status] || 0) + 1
      if (!buckets[mk].companies.includes(a.company)) buckets[mk].companies.push(a.company)
    })
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => ({
        date: key,
        label: getMonthLabel(key),
        applied: val.applied,
        rejected: val.rejected,
        interview: val.interview || 0,
        offer: val.offer || 0,
        total: val.applied + val.rejected + (val.interview || 0) + (val.offer || 0),
        companies: val.companies.join(', '),
      }))
  }, [filtered])

  // Cumulative data
  const cumulativeData = useMemo(() => {
    let running = 0
    return weeklyData.map((w) => {
      running += w.total
      return { ...w, cumulative: running }
    })
  }, [weeklyData])

  const chartData = view === 'monthly' ? monthlyData : view === 'cumulative' ? cumulativeData : weeklyData
  const avgLine = stats.total > 0 ? Math.round(stats.total / Math.max(1, chartData.length)) : 0

  return (
    <div className="bg-cc-panel rounded-lg border border-cc-border p-5 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cc-red/[0.03] via-transparent to-cc-red/[0.02] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em]">
            Job Application Timeline
          </h2>
          <div className="w-1.5 h-1.5 rounded-full bg-cc-green shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          {['weekly', 'monthly', 'cumulative'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded text-[9px] font-mono uppercase tracking-wider transition-all ${
                view === v
                  ? 'bg-cc-red/20 text-cc-red border border-cc-red/40 shadow-[0_0_8px_rgba(220,38,38,0.2)]'
                  : 'text-cc-text-muted hover:text-cc-text-dim border border-transparent hover:border-cc-border'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between mb-5 px-2 relative">
        <StatBadge label="Total" value={stats.total} color="#dc2626" />
        <div className="w-px h-8 bg-cc-border" />
        <StatBadge label="Companies" value={stats.uniqueCompanies} color="#f59e0b" />
        <div className="w-px h-8 bg-cc-border" />
        <StatBadge label="Avg/Week" value={stats.avgPerWeek} color="#3b82f6" />
        <div className="w-px h-8 bg-cc-border" />
        <StatBadge label="Rejected" value={stats.rejected} color="#525252" />
        <div className="w-px h-8 bg-cc-border" />
        <StatBadge label="Response" value={`${stats.responseRate}%`} color="#22c55e" />
      </div>

      {/* Range Selector */}
      <div className="flex items-center gap-1 mb-4 relative">
        {RANGE_OPTIONS.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-3 py-1.5 rounded text-[9px] font-mono uppercase tracking-wider transition-all ${
              range === r.key
                ? 'bg-cc-red/15 text-cc-red border border-cc-red/30 shadow-[0_0_10px_rgba(220,38,38,0.15)]'
                : 'text-cc-text-muted hover:text-cc-text-dim border border-cc-border/50 hover:border-cc-border'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          {view === 'cumulative' ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#dc2626" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#dc2626" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: '#525252', fontFamily: 'monospace' }}
                axisLine={{ stroke: '#2a2a2a' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#525252', fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#dc2626"
                strokeWidth={2}
                fill="url(#cumGrad)"
                name="Total Applications"
                dot={{ r: 3, fill: '#dc2626', stroke: '#0a0a0a', strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#ef4444', stroke: '#dc2626', strokeWidth: 2 }}
              />
              <Brush
                dataKey="label"
                height={24}
                stroke="#2a2a2a"
                fill="#0f0f0f"
                tickFormatter={() => ''}
                travellerWidth={8}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
              barGap={2}
              barCategoryGap="20%"
              onMouseMove={(e) => {
                if (e?.activeTooltipIndex !== undefined) setHoveredBar(e.activeTooltipIndex)
              }}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <defs>
                <linearGradient id="barGradApplied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
                <linearGradient id="barGradRejected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6b7280" />
                  <stop offset="100%" stopColor="#374151" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: '#525252', fontFamily: 'monospace' }}
                axisLine={{ stroke: '#2a2a2a' }}
                tickLine={false}
                interval={view === 'monthly' ? 0 : 'preserveStartEnd'}
              />
              <YAxis
                tick={{ fontSize: 9, fill: '#525252', fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(220,38,38,0.04)' }} />
              {avgLine > 0 && (
                <ReferenceLine
                  y={avgLine}
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                  label={{
                    value: `avg: ${avgLine}`,
                    position: 'insideTopRight',
                    fill: '#dc262680',
                    fontSize: 9,
                    fontFamily: 'monospace',
                  }}
                />
              )}
              <Bar dataKey="applied" name="Applied" stackId="a" radius={[0, 0, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={hoveredBar === i ? '#ef4444' : 'url(#barGradApplied)'}
                    style={{
                      filter: hoveredBar === i ? 'drop-shadow(0 0 6px rgba(220,38,38,0.5))' : 'none',
                      transition: 'filter 0.2s',
                    }}
                  />
                ))}
              </Bar>
              <Bar dataKey="rejected" name="Rejected" stackId="a" radius={[3, 3, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={hoveredBar === i ? '#6b7280' : 'url(#barGradRejected)'} />
                ))}
              </Bar>
              <Brush
                dataKey="label"
                height={24}
                stroke="#2a2a2a"
                fill="#0f0f0f"
                tickFormatter={() => ''}
                travellerWidth={8}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Source breakdown mini-bar */}
      <div className="mt-4 flex items-center gap-4 relative">
        <span className="text-[9px] text-cc-text-muted uppercase tracking-wider font-mono">Source:</span>
        {Object.entries(
          filtered.reduce((acc, a) => { acc[a.source] = (acc[a.source] || 0) + 1; return acc }, {})
        ).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
          <div key={source} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: SOURCE_COLORS[source] || '#525252' }} />
            <span className="text-[10px] font-mono text-cc-text-dim">
              {source} <span className="text-cc-text-muted">({count})</span>
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 relative">
        <span className="text-[9px] text-cc-text-muted uppercase tracking-wider font-mono">Status:</span>
        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const count = filtered.filter((a) => a.status === status).length
          if (count === 0) return null
          return (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px] font-mono text-cc-text-dim">
                {status} <span className="text-cc-text-muted">({count})</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
