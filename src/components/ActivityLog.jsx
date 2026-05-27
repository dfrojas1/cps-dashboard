import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const TABS = ['Claude Code', 'Web Work', 'Notes']

const TAB_STYLES = {
  'Claude Code': 'bg-purple-50 text-purple-600 border-purple-200',
  'Web Work':    'bg-sky-50 text-sky-600 border-sky-200',
  'Notes':       'bg-amber-50 text-amber-600 border-amber-200',
}

function AddForm({ onAdd }) {
  const [text, setText] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))

  const submit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd({ id: Date.now().toString(), text: trimmed, date })
    setText('')
  }

  return (
    <form onSubmit={submit} className="flex gap-2 mb-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What did you work on?"
        className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-sf-blue/30 focus:border-sf-blue"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-sf-blue/30 focus:border-sf-blue"
      />
      <button
        type="submit"
        className="text-sm font-medium px-4 py-2 rounded-lg bg-sf-blue text-white hover:bg-sf-blue-light transition-colors"
      >
        Add
      </button>
    </form>
  )
}

function EntryList({ entries, tab }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? entries : entries.slice(0, 10)
  const style = TAB_STYLES[tab]

  if (entries.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No entries yet.</p>
  }

  return (
    <>
      <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
        {visible.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-start justify-between gap-3 text-sm px-3 py-2.5 rounded-lg border ${style}`}
          >
            <span className="leading-snug">{entry.text}</span>
            <span className="text-xs opacity-60 shrink-0 pt-0.5">{entry.date}</span>
          </div>
        ))}
      </div>
      {entries.length > 10 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs text-sf-blue font-medium hover:underline"
        >
          {showAll ? 'Show recent' : `View all (${entries.length})`}
        </button>
      )}
    </>
  )
}

export default function ActivityLog() {
  const [active, setActive] = useState(TABS[0])
  const [entries, setEntries] = useLocalStorage('activity_log', {
    'Claude Code': [],
    'Web Work': [],
    'Notes': [],
  })

  const addEntry = (entry) => {
    setEntries((prev) => ({
      ...prev,
      [active]: [entry, ...(prev[active] || [])],
    }))
  }

  const tabEntries = entries[active] || []

  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Activity Log</h2>

      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${
              active === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            {(entries[tab]?.length || 0) > 0 && (
              <span className="ml-1.5 text-[10px] text-gray-400">
                {entries[tab].length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AddForm onAdd={addEntry} />
      <EntryList entries={tabEntries} tab={active} />
    </div>
  )
}
