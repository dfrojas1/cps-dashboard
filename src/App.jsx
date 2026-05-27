import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import KPICards from './components/KPICards'
import KanbanBoard from './components/KanbanBoard'
import ActivityLog from './components/ActivityLog'
import TrendChart from './components/TrendChart'
import ClaudeUsage from './components/ClaudeUsage'

function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200 border-dashed">
      <span className="text-gray-400 text-sm">{title} — coming soon</span>
    </div>
  )
}

const pages = {
  dashboard: () => (
    <>
      <KPICards />
      <KanbanBoard />
      <div className="grid grid-cols-2 gap-6">
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar active={page} onNavigate={setPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar page={page} />
        <main className="flex-1 overflow-auto bg-content-bg p-8">
          <Page />
        </main>
      </div>
    </div>
  )
}
