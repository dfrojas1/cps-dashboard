import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import KPICards from './components/KPICards'
import KanbanBoard from './components/KanbanBoard'
import ActivityLog from './components/ActivityLog'
import TrendChart from './components/TrendChart'
import ClaudeUsage from './components/ClaudeUsage'
import CountdownClock from './components/CountdownClock'
import ObsidianSync from './components/ObsidianSync'
import GameBackground from './components/GameBackground'

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center h-64 bg-cc-panel rounded-lg border border-cc-border border-dashed">
      <span className="text-cc-text-muted text-xs font-mono uppercase tracking-wider">{title} — coming soon</span>
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
  reports:    () => <ObsidianSync />,
  settings:   () => <Placeholder title="Settings" />,
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const Page = pages[page] || pages.dashboard

  return (
    <div className="flex h-screen overflow-hidden bg-cc-black">
      <GameBackground />
      <Sidebar active={page} onNavigate={setPage} />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <TopBar page={page} />
        <main className="flex-1 overflow-auto p-8" style={{ background: 'rgba(10,10,10,0.75)' }}>
          <Page />
        </main>
      </div>
    </div>
  )
}
