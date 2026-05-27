import { useState, useEffect } from 'react'

export default function ObsidianSync() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/data/obsidian.json')
      .then((r) => {
        if (!r.ok) throw new Error('No sync data — run: npm run sync')
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="bg-cc-panel rounded-lg border border-cc-border border-dashed p-5">
        <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em] mb-3">Obsidian Sync</h2>
        <div className="text-center py-6">
          <span className="text-cc-text-muted text-xs font-mono">No sync data found</span>
          <p className="text-cc-text-muted text-[10px] font-mono mt-2 opacity-60">
            Run <span className="text-cc-red">npm run sync</span> to pull data from Obsidian vault
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-cc-panel rounded-lg border border-cc-border p-5 animate-pulse">
        <div className="h-3 bg-cc-well rounded w-32 mb-4" />
        <div className="h-20 bg-cc-well rounded" />
      </div>
    )
  }

  const { claudeSessions, taskQueue, ltm, sessionHistory, syncedAt } = data
  const syncAge = Math.round((Date.now() - new Date(syncedAt).getTime()) / 60000)
  const syncLabel = syncAge < 1 ? 'Just now' : syncAge < 60 ? `${syncAge}m ago` : `${Math.round(syncAge / 60)}h ago`

  return (
    <div className="space-y-5">
      {/* Sync Status Bar */}
      <div className="bg-cc-panel rounded-lg border border-cc-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cc-green shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em]">Obsidian Vault Connected</span>
        </div>
        <span className="text-[10px] text-cc-text-muted font-mono">Synced {syncLabel}</span>
      </div>

      {/* Claude Session Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Sessions Today', val: claudeSessions.today },
          { label: 'This Week', val: claudeSessions.thisWeek },
          { label: 'Total Sessions', val: claudeSessions.total },
          { label: 'Active Days', val: claudeSessions.activeDays },
        ].map((c) => (
          <div key={c.label} className="bg-cc-panel rounded-lg p-4 border border-cc-border relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-cc-red/[0.02] to-transparent pointer-events-none" />
            <span className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em] relative">{c.label}</span>
            <div className="mt-2 relative">
              <span className="text-3xl font-bold font-mono text-cc-red drop-shadow-[0_0_12px_rgba(220,38,38,0.3)]">{c.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Session History Heatmap */}
      <div className="bg-cc-panel rounded-lg border border-cc-border p-5">
        <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em] mb-4">Session History</h2>
        <div className="flex flex-wrap gap-1.5">
          {sessionHistory.slice(0, 30).map(({ date, count }) => (
            <div
              key={date}
              title={`${date}: ${count} session${count !== 1 ? 's' : ''}`}
              className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-mono font-bold border transition-all hover:scale-110 cursor-default"
              style={{
                background: count === 0
                  ? 'var(--color-cc-well)'
                  : count <= 2
                  ? 'rgba(220,38,38,0.15)'
                  : count <= 4
                  ? 'rgba(220,38,38,0.3)'
                  : 'rgba(220,38,38,0.5)',
                borderColor: count > 0 ? 'rgba(220,38,38,0.2)' : 'var(--color-cc-border)',
                color: count > 0 ? '#ef4444' : 'var(--color-cc-text-muted)',
              }}
            >
              {count}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[9px] text-cc-text-muted font-mono">Less</span>
          {[0, 0.15, 0.3, 0.5].map((op, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded border border-cc-border"
              style={{ background: op === 0 ? 'var(--color-cc-well)' : `rgba(220,38,38,${op})` }}
            />
          ))}
          <span className="text-[9px] text-cc-text-muted font-mono">More</span>
        </div>
      </div>

      {/* LTM + Task Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-cc-panel rounded-lg border border-cc-border p-5">
          <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em] mb-4">Long-Term Memory</h2>
          <div className="space-y-3">
            {[
              { label: 'Decisions', count: ltm.decisionCount, active: ltm.hasDecisions },
              { label: 'Workflows', count: ltm.workflowCount, active: ltm.hasWorkflows },
              { label: 'Research', count: ltm.researchCount, active: ltm.hasResearch },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.active ? 'bg-cc-green shadow-[0_0_4px_rgba(34,197,94,0.5)]' : 'bg-cc-text-muted'}`} />
                  <span className="text-xs text-cc-text-dim font-mono">{item.label}</span>
                </div>
                <span className={`text-xs font-mono font-bold ${item.count > 0 ? 'text-cc-red' : 'text-cc-text-muted'}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cc-panel rounded-lg border border-cc-border p-5">
          <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em] mb-4">Task Queue</h2>
          <div className="space-y-3">
            {[
              { label: 'Active', count: taskQueue.activeCount, color: 'text-cc-green' },
              { label: 'Queued', count: taskQueue.queuedCount, color: 'text-cc-amber' },
              { label: 'Completed', count: taskQueue.completed.length, color: 'text-cc-text-dim' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-cc-text-dim font-mono">{item.label}</span>
                <span className={`text-xs font-mono font-bold ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
          {taskQueue.queued.length > 0 && (
            <div className="mt-4 pt-3 border-t border-cc-border">
              <span className="text-[9px] text-cc-text-muted uppercase tracking-wider">Next up:</span>
              {taskQueue.queued.slice(0, 3).map((t, i) => (
                <p key={i} className="text-xs text-cc-text-dim mt-1.5 font-mono truncate">{t.Task || t.task || '—'}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      {claudeSessions.recentSessions.length > 0 && (
        <div className="bg-cc-panel rounded-lg border border-cc-border p-5">
          <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em] mb-4">Recent Claude Sessions</h2>
          <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
            {claudeSessions.recentSessions.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded hover:bg-white/[0.02]">
                <span className="font-mono text-cc-text-dim">{s.date}</span>
                <span className="font-mono text-cc-text-muted">{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
