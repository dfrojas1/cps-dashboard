import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const TABS = ['Claude Code', 'Web Work', 'Notes']

const TAB_ENTRY_STYLES = {
  'Claude Code': 'border-purple-500/20 bg-purple-500/5',
  'Web Work':    'border-sky-500/20 bg-sky-500/5',
  'Notes':       'border-amber-500/20 bg-amber-500/5',
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
        className="flex-1 text-xs px-3 py-2 rounded bg-cc-well border border-cc-border text-cc-text placeholder-cc-text-muted font-mono focus:outline-none focus:ring-1 focus:ring-cc-red/30 focus:border-cc-red/40"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="text-xs px-3 py-2 rounded bg-cc-well border border-cc-border text-cc-text font-mono focus:outline-none focus:ring-1 focus:ring-cc-red/30 focus:border-cc-red/40 [color-scheme:dark]"
      />
      <button
        type="submit"
        className="text-xs font-medium px-4 py-2 rounded bg-cc-red/20 border border-cc-red/40 text-cc-red hover:bg-cc-red/30 transition-colors font-mono"
      >
        ADD
      </button>
    </form>
  )
}

function EntryList({ entries, tab }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? entries : entries.slice(0, 10)
  const style = TAB_ENTRY_STYLES[tab]

  if (entries.length === 0) {
    return <p className="text-xs text-cc-text-muted py-4 text-center font-mono">No entries yet.</p>
  }

  return (
    <>
      <div className="flex flex-col gap-1.5 max-h-[280px] overflow-y-auto pr-1">
        {visible.map((entry) => (
          <div
            key={entry.id}
            className={`flex items-start justify-between gap-3 text-xs px-3 py-2 rounded border ${style}`}
          >
            <span className="text-cc-text leading-snug">{entry.text}</span>
            <span className="text-cc-text-muted shrink-0 font-mono text-[10px]">{entry.date}</span>
          </div>
        ))}
      </div>
      {entries.length > 10 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-[10px] text-cc-red font-mono hover:underline"
        >
          {showAll ? 'SHOW RECENT' : `VIEW ALL (${entries.length})`}
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
    <div className="bg-cc-panel rounded-lg border border-cc-border p-5">
      <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em] mb-4">Activity Log</h2>

      <div className="flex gap-0.5 mb-4 bg-cc-well rounded p-0.5 border border-cc-border/50">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex-1 text-[10px] font-medium py-1.5 rounded transition-all font-mono ${
              active === tab
                ? 'bg-cc-surface text-cc-red border border-cc-red/20'
                : 'text-cc-text-muted hover:text-cc-text-dim border border-transparent'
            }`}
          >
            {tab}
            {(entries[tab]?.length || 0) > 0 && (
              <span className="ml-1 text-cc-text-muted">{entries[tab].length}</span>
            )}
          </button>
        ))}
      </div>

      <AddForm onAdd={addEntry} />
      <EntryList entries={tabEntries} tab={active} />
    </div>
  )
}
