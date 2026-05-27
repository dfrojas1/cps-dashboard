const navItems = [
  { id: 'dashboard',   icon: '📊', label: 'Dashboard' },
  { id: 'pipeline',    icon: '📈', label: 'Pipeline' },
  { id: 'activities',  icon: '🎯', label: 'Activities' },
  { id: 'usage',       icon: '✧',  label: 'Claude Usage' },
  { id: 'reports',     icon: '📋', label: 'Reports' },
  { id: 'settings',    icon: '⚙️', label: 'Settings' },
]

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="w-[220px] min-h-screen bg-navy-900 flex flex-col shrink-0">
      <div className="h-16 flex items-center px-5">
        <span className="text-white text-lg font-semibold tracking-tight">
          CPS Dashboard
        </span>
      </div>

      <nav className="flex-1 px-3 py-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
              active === item.id
                ? 'bg-sf-hover text-white'
                : 'text-slate-400 hover:bg-sf-hover hover:text-white'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-navy-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sf-blue flex items-center justify-center text-white text-xs font-bold">
            DF
          </div>
          <span className="text-slate-400 text-sm">D. Frojas</span>
        </div>
      </div>
    </aside>
  )
}
