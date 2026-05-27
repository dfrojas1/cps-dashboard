const PAGE_TITLES = {
  dashboard:  'Dashboard',
  pipeline:   'Pipeline',
  activities: 'Activities',
  usage:      'Claude Usage',
  reports:    'Reports',
  settings:   'Settings',
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
    <header className="h-16 bg-topbar-bg border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          {PAGE_TITLES[page] || 'Dashboard'}
        </h1>
        <p className="text-xs text-gray-500">
          Week of {fmt(startOfWeek)} – {fmt(endOfWeek)}, {now.getFullYear()}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-sm text-sf-blue font-medium hover:underline">
          This Week
        </button>
      </div>
    </header>
  )
}
