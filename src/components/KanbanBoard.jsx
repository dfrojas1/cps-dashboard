import { useState, useRef } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const CATEGORIES = {
  EUC:    { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  Web:    { bg: 'bg-sky-500/10',    text: 'text-sky-400',    border: 'border-sky-500/20' },
  Travel: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20' },
  Admin:  { bg: 'bg-emerald-500/10',text: 'text-emerald-400', border: 'border-emerald-500/20' },
}

const COLUMNS = ['Backlog', 'In Progress', 'Review', 'Done']

const SEED = [
  { id: '1', title: 'IGEL White Paper',          category: 'EUC',    priority: 'high',   column: 'In Progress' },
  { id: '2', title: 'CPS Site Polish',            category: 'Web',    priority: 'high',   column: 'In Progress' },
  { id: '3', title: 'Avocado Toast Rebrand',      category: 'Web',    priority: 'medium', column: 'Backlog' },
  { id: '4', title: 'Clayton Park Swim Site',     category: 'Web',    priority: 'medium', column: 'Backlog' },
  { id: '5', title: 'SEO Strategy Doc',           category: 'Admin',  priority: 'low',    column: 'Backlog' },
  { id: '6', title: 'Mapbox Token Restriction',   category: 'Web',    priority: 'high',   column: 'Review' },
]

const PRIORITY = {
  high:   { color: 'bg-cc-red',   shadow: 'shadow-[0_0_6px_rgba(220,38,38,0.5)]' },
  medium: { color: 'bg-cc-amber', shadow: 'shadow-[0_0_6px_rgba(245,158,11,0.4)]' },
  low:    { color: 'bg-cc-green', shadow: 'shadow-[0_0_6px_rgba(34,197,94,0.4)]' },
}

function Card({ card, onDragStart }) {
  const cat = CATEGORIES[card.category]
  const pri = PRIORITY[card.priority]

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', card.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(card.id)
      }}
      className={`bg-cc-panel rounded-lg p-3 border cursor-grab active:cursor-grabbing hover:border-cc-red/30 transition-all select-none ${
        card.priority === 'high' ? 'border-cc-red/20' : 'border-cc-border'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-cc-text leading-snug">
          {card.title}
        </span>
        <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${pri.color} ${pri.shadow}`} />
      </div>
      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded border ${cat.bg} ${cat.text} ${cat.border}`}>
        {card.category}
      </span>
    </div>
  )
}

function Column({ name, cards, onDrop, onDragStart, dragOver, setDragOver }) {
  const isOver = dragOver === name

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em]">
          {name}
        </h3>
        <span className="text-[10px] text-cc-text-muted bg-cc-well rounded px-1.5 py-0.5 font-mono">
          {cards.length}
        </span>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
          setDragOver(name)
        }}
        onDragLeave={() => setDragOver(null)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(null)
          const cardId = e.dataTransfer.getData('text/plain')
          onDrop(cardId, name)
        }}
        className={`flex-1 flex flex-col gap-2 rounded-lg p-2.5 min-h-[200px] transition-all ${
          isOver ? 'bg-cc-red/5 ring-1 ring-cc-red/20' : 'bg-cc-well border border-cc-border/50'
        }`}
      >
        {cards.map((card) => (
          <Card key={card.id} card={card} onDragStart={onDragStart} />
        ))}
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const [cards, setCards] = useLocalStorage('kanban', SEED)
  const [dragOver, setDragOver] = useState(null)
  const draggingId = useRef(null)

  const handleDrop = (cardId, targetColumn) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, column: targetColumn } : c))
    )
    draggingId.current = null
  }

  const handleDragStart = (id) => {
    draggingId.current = id
  }

  return (
    <div className="mt-5">
      <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em] mb-4">Projects</h2>
      <div className="grid grid-cols-4 gap-3">
        {COLUMNS.map((col) => (
          <Column
            key={col}
            name={col}
            cards={cards.filter((c) => c.column === col)}
            onDrop={handleDrop}
            onDragStart={handleDragStart}
            dragOver={dragOver}
            setDragOver={setDragOver}
          />
        ))}
      </div>
    </div>
  )
}
