const PAGE_TITLES = {
  dashboard:  'DASHBOARD',
  pipeline:   'PIPELINE',
  activities: 'ACTIVITIES',
  usage:      'CLAUDE USAGE',
  reports:    'REPORTS',
  settings:   'SETTINGS',
}

export default function TopBar({ page }) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  const fmt = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <header className="h-14 bg-cc-panel border-b border-cc-border flex items-center justify-between px-8 shrink-0 relative">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cc-red/30 to-transparent" />
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-cc-text tracking-[0.2em] uppercase">
          {PAGE_TITLES[page] || 'DASHBOARD'}
        </h1>
        <div className="w-px h-4 bg-cc-border" />
        <p className="text-xs text-cc-text-dim font-mono">
          {fmt(startOfWeek)} – {fmt(endOfWeek)}, {now.getFullYear()}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-cc-green shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
          <span className="text-[10px] text-cc-text-dim uppercase tracking-wider">Systems Online</span>
        </div>
      </div>
    </header>
  )
}
