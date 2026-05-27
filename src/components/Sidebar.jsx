const navItems = [
  { id: 'dashboard',   icon: '◈', label: 'Dashboard' },
  { id: 'pipeline',    icon: '◆', label: 'Pipeline' },
  { id: 'activities',  icon: '◉', label: 'Activities' },
  { id: 'usage',       icon: '⬡', label: 'Claude Usage' },
  { id: 'reports',     icon: '▣', label: 'Obsidian' },
  { id: 'settings',    icon: '⚙', label: 'Settings' },
]

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="w-[220px] min-h-screen bg-cc-panel flex flex-col border-r border-cc-border shrink-0">
      <div className="h-16 flex items-center px-5 border-b border-cc-border">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-cc-red shadow-[0_0_8px_rgba(220,38,38,0.6)]" />
          <span className="text-cc-text text-sm font-semibold tracking-widest uppercase">
            CMD CENTER
          </span>
        </div>
      </div>

      <nav className="flex-1 py-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm text-left transition-all relative ${
              active === item.id
                ? 'text-cc-red bg-cc-red/5'
                : 'text-cc-text-dim hover:text-cc-text hover:bg-white/[0.03]'
            }`}
          >
            {active === item.id && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-cc-red shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
            )}
            <span className="text-xs font-mono">{item.icon}</span>
            <span className="tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-cc-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cc-red/20 border border-cc-red/40 flex items-center justify-center text-cc-red text-xs font-bold font-mono">
            DF
          </div>
          <div className="flex flex-col">
            <span className="text-cc-text text-xs font-medium">D. Frojas</span>
            <span className="text-cc-text-muted text-[10px] tracking-wider uppercase">Operator</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
