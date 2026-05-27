import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import KPICards from './components/KPICards'
import KanbanBoard from './components/KanbanBoard'
import ActivityLog from './components/ActivityLog'
import TrendChart from './components/TrendChart'
import ClaudeUsage from './components/ClaudeUsage'
import CountdownClock from './components/CountdownClock'

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center h-64 bg-cc-panel rounded-lg border border-cc-border border-dashed">
      <span className="text-cc-text-muted text-xs font-mono uppercase tracking-wider">{title} — coming soon</span>
    </div>
  )
}

/* Crosshair / target SVG background overlay */
function CrosshairBG() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Radial grid circles */}
        <circle cx="50%" cy="50%" r="160" fill="none" stroke="#dc2626" strokeOpacity="0.03" strokeWidth="1" />
        <circle cx="50%" cy="50%" r="320" fill="none" stroke="#dc2626" strokeOpacity="0.025" strokeWidth="1" />
        <circle cx="50%" cy="50%" r="480" fill="none" stroke="#dc2626" strokeOpacity="0.02" strokeWidth="1" />
        <circle cx="50%" cy="50%" r="640" fill="none" stroke="#dc2626" strokeOpacity="0.015" strokeWidth="1" />
        {/* Crosshair lines */}
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#dc2626" strokeOpacity="0.03" strokeWidth="1" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#dc2626" strokeOpacity="0.03" strokeWidth="1" />
        {/* Diagonal sweeps */}
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="#dc2626" strokeOpacity="0.015" strokeWidth="1" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="#dc2626" strokeOpacity="0.015" strokeWidth="1" />
        {/* Corner tick marks */}
        <line x1="48%" y1="0" x2="48%" y2="20" stroke="#dc2626" strokeOpacity="0.04" strokeWidth="1" />
        <line x1="52%" y1="0" x2="52%" y2="20" stroke="#dc2626" strokeOpacity="0.04" strokeWidth="1" />
        <line x1="48%" y1="100%" x2="48%" y2="calc(100% - 20px)" stroke="#dc2626" strokeOpacity="0.04" strokeWidth="1" />
        <line x1="52%" y1="100%" x2="52%" y2="calc(100% - 20px)" stroke="#dc2626" strokeOpacity="0.04" strokeWidth="1" />
        {/* Small center dot */}
        <circle cx="50%" cy="50%" r="3" fill="#dc2626" fillOpacity="0.06" />
      </svg>
    </div>
  )
}

const pages = {
  dashboard: () => (
    <>
      <KPICards />
      <div className="grid grid-cols-3 gap-3 mt-5">
        <div className="col-span-2">
          <CountdownClock />
        </div>
        <div className="col-span-1 bg-cc-panel rounded-lg border border-cc-border p-5 flex flex-col justify-center items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cc-red/[0.03] to-transparent pointer-events-none" />
          <div className="relative text-center">
            <span className="text-[9px] text-cc-text-muted uppercase tracking-[0.2em] font-mono">Mission Status</span>
            <div className="mt-3 w-16 h-16 rounded-full border-2 border-cc-red/30 flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 rounded-full border border-cc-red/10 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="w-8 h-8 rounded-full border border-cc-red/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-cc-green shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
            </div>
            <span className="text-[10px] text-cc-green font-mono font-bold tracking-wider mt-2 block">ACTIVE</span>
          </div>
        </div>
      </div>
      <KanbanBoard />
      <div className="grid grid-cols-2 gap-3 mt-5">
        <TrendChart />
        <ActivityLog />
      </div>
    </>
  ),
  pipeline:   () => <KanbanBoard />,
  activities: () => <ActivityLog />,
  usage:      () => <ClaudeUsage />,
  reports:    () => <Placeholder title="Reports" />,
  settings:   () => <Placeholder title="Settings" />,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const Page = pages[page] || pages.dashboard

  return (
    <div className="flex h-screen overflow-hidden bg-cc-black">
      <CrosshairBG />
      <Sidebar active={page} onNavigate={setPage} />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <TopBar page={page} />
        <main className="flex-1 overflow-auto bg-content-bg/80 p-8">
          <Page />
        </main>
      </div>
    </div>
  )
}
