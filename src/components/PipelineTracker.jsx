import { useState, useEffect } from 'react'

const PRIORITY_STYLES = {
  critical: { bg: 'bg-cc-red/20', border: 'border-cc-red/50', text: 'text-cc-red', dot: 'bg-cc-red shadow-[0_0_8px_rgba(220,38,38,0.6)]', label: 'CRITICAL' },
  high:     { bg: 'bg-cc-red/10', border: 'border-cc-red/30', text: 'text-cc-red-glow', dot: 'bg-cc-red-glow shadow-[0_0_6px_rgba(239,68,68,0.4)]', label: 'HIGH' },
  medium:   { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-cc-amber', dot: 'bg-cc-amber shadow-[0_0_6px_rgba(245,158,11,0.4)]', label: 'MED' },
  low:      { bg: 'bg-cc-green/10', border: 'border-cc-green/30', text: 'text-cc-green', dot: 'bg-cc-green shadow-[0_0_6px_rgba(34,197,94,0.4)]', label: 'LOW' },
}

const STATUS_STYLES = {
  'Referral in progress': { color: '#dc2626', icon: '🔥' },
  'Referral source':      { color: '#f59e0b', icon: '🤝' },
  'Interview process':    { color: '#22c55e', icon: '📞' },
  'Interview stage':      { color: '#22c55e', icon: '📞' },
  'Job lead shared':      { color: '#3b82f6', icon: '🔗' },
  'New connection':       { color: '#8b5cf6', icon: '✨' },
}

function daysAgo(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.floor((now - d) / 86400000)
}

function DaysAgoBadge({ date }) {
  const d = daysAgo(date)
  const color = d === 0 ? 'text-cc-green' : d <= 3 ? 'text-cc-amber' : d <= 7 ? 'text-cc-text-dim' : 'text-cc-text-muted'
  const label = d === 0 ? 'Today' : d === 1 ? '1d ago' : `${d}d ago`
  return <span className={`text-[9px] font-mono ${color}`}>{label}</span>
}

function SummaryCard({ value, label, glow }) {
  return (
    <div className="flex flex-col items-center gap-1 px-3">
      <span className="text-2xl font-bold font-mono text-cc-red" style={glow ? { textShadow: '0 0 12px rgba(220,38,38,0.4)' } : {}}>{value}</span>
      <span className="text-[8px] text-cc-text-muted uppercase tracking-widest font-mono text-center leading-tight">{label}</span>
    </div>
  )
}

export default function PipelineTracker() {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('leads')
  const [expandedAction, setExpandedAction] = useState(null)

  useEffect(() => {
    fetch('/data/linkedin_pipeline.json')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  if (!data) {
    return (
      <div className="bg-cc-panel rounded-lg border border-cc-border p-8 flex items-center justify-center">
        <span className="text-cc-text-muted text-xs font-mono">Loading pipeline data...</span>
      </div>
    )
  }

  const tabs = [
    { key: 'leads', label: 'Hot Leads', count: data.hotLeads.length },
    { key: 'outreach', label: 'Outreach', count: data.activeOutreach.length },
    { key: 'network', label: 'Network', count: data.warmNetwork.length },
    { key: 'actions', label: 'Next Actions', count: data.nextActions.length },
  ]

  return (
    <div className="bg-cc-panel rounded-lg border border-cc-border relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cc-red/[0.03] via-transparent to-cc-red/[0.01] pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-5 pb-3 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em]">
              LinkedIn Pipeline
            </h2>
            <div className="w-1.5 h-1.5 rounded-full bg-cc-green shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse" />
          </div>
          <span className="text-[9px] text-cc-text-muted font-mono">
            Updated {daysAgo(data.lastUpdated) === 0 ? 'today' : `${daysAgo(data.lastUpdated)}d ago`}
          </span>
        </div>

        {/* Summary cards */}
        <div className="flex items-center justify-between py-3 border-y border-cc-border/50">
          <SummaryCard value={data.summary.referralsActive} label="Referrals" glow />
          <div className="w-px h-8 bg-cc-border/30" />
          <SummaryCard value={data.summary.interviewProcesses} label="Interviews" glow />
          <div className="w-px h-8 bg-cc-border/30" />
          <SummaryCard value={data.summary.jobLeadsToFollow} label="Leads" />
          <div className="w-px h-8 bg-cc-border/30" />
          <SummaryCard value={data.summary.newConnections} label="New Connects" />
          <div className="w-px h-8 bg-cc-border/30" />
          <SummaryCard value={data.summary.outreachThisWeek} label="Outreach/wk" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-cc-border/50 px-5 relative">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-[9px] font-mono uppercase tracking-wider transition-all relative ${
              tab === t.key
                ? 'text-cc-red'
                : 'text-cc-text-muted hover:text-cc-text-dim'
            }`}
          >
            {t.label}
            <span className={`ml-1.5 text-[8px] px-1.5 py-0.5 rounded-full font-bold ${
              tab === t.key ? 'bg-cc-red/20 text-cc-red' : 'bg-cc-surface text-cc-text-muted'
            }`}>{t.count}</span>
            {tab === t.key && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-cc-red shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-5 relative" style={{ minHeight: 260 }}>
        {/* Hot Leads */}
        {tab === 'leads' && (
          <div className="space-y-2">
            {data.hotLeads.map((lead, i) => {
              const status = STATUS_STYLES[lead.status] || { color: '#525252', icon: '●' }
              const pri = lead.priority || 'medium'
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border border-cc-border/50 bg-cc-well/50 hover:border-cc-red/20 hover:bg-cc-well transition-all group"
                >
                  <span className="text-sm">{status.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-cc-text truncate">{lead.contact}</span>
                      <span
                        className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                        style={{ color: status.color, background: `${status.color}15`, border: `1px solid ${status.color}30` }}
                      >
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-cc-text-dim mt-0.5 truncate">{lead.notes}</p>
                  </div>
                  <DaysAgoBadge date={lead.lastActivity} />
                </div>
              )
            })}
          </div>
        )}

        {/* Outreach */}
        {tab === 'outreach' && (
          <div className="space-y-2">
            {data.activeOutreach.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-cc-border/50 bg-cc-well/50 hover:border-cc-red/20 hover:bg-cc-well transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-cc-red/10 border border-cc-red/20 flex items-center justify-center text-cc-red text-[10px] font-bold font-mono shrink-0">
                  {c.contact.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-cc-text">{c.contact}</span>
                  <p className="text-[10px] text-cc-text-dim mt-0.5 truncate">{c.notes}</p>
                </div>
                <DaysAgoBadge date={c.lastActivity} />
              </div>
            ))}
          </div>
        )}

        {/* Warm Network */}
        {tab === 'network' && (
          <div className="grid grid-cols-2 gap-2">
            {data.warmNetwork.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-cc-border/30 bg-cc-well/30 hover:border-cc-border/60 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-cc-surface border border-cc-border flex items-center justify-center text-cc-text-muted text-[9px] font-bold font-mono shrink-0">
                  {c.contact.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-medium text-cc-text-dim truncate block">{c.contact}</span>
                  <span className="text-[9px] text-cc-text-muted font-mono">{daysAgo(c.lastActivity)}d ago</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Next Actions */}
        {tab === 'actions' && (
          <div className="space-y-2">
            {data.nextActions.map((a, i) => {
              const pri = PRIORITY_STYLES[a.priority] || PRIORITY_STYLES.medium
              const isExpanded = expandedAction === i
              return (
                <button
                  key={i}
                  onClick={() => setExpandedAction(isExpanded ? null : i)}
                  className={`w-full text-left p-3 rounded-lg border ${pri.border} ${pri.bg} hover:brightness-110 transition-all`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${pri.dot}`} />
                    <span className="text-xs font-semibold text-cc-text flex-1">{a.action}</span>
                    <span className={`text-[8px] font-mono font-bold ${pri.text} tracking-wider`}>{pri.label}</span>
                    <span className="text-cc-text-muted text-[10px]">{isExpanded ? '▾' : '▸'}</span>
                  </div>
                  {isExpanded && (
                    <p className="text-[10px] text-cc-text-dim mt-2 ml-4.5 leading-relaxed">{a.detail}</p>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
