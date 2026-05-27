import { useState, useRef } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const CATEGORIES = {
  EUC:    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  Web:    { bg: 'bg-sky-100',    text: 'text-sky-700',    border: 'border-sky-200' },
  Travel: { bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200' },
  Admin:  { bg: 'bg-emerald-100',text: 'text-emerald-700', border: 'border-emerald-200' },
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

const PRIORITY_ICONS = { high: '🔴', medium: '🟡', low: '🟢' }

function Card({ card, onDragStart }) {
  const cat = CATEGORIES[card.category]

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', card.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(card.id)
      }}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-gray-900 leading-snug">
          {card.title}
        </span>
        <span className="text-xs shrink-0" title={card.priority}>
          {PRIORITY_ICONS[card.priority]}
        </span>
      </div>
      <span
        className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${cat.bg} ${cat.text} ${cat.border}`}
      >
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
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {name}
        </h3>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 font-medium">
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
        className={`flex-1 flex flex-col gap-2.5 rounded-xl p-3 min-h-[200px] transition-colors ${
          isOver ? 'bg-sf-blue/5 ring-2 ring-sf-blue/20' : 'bg-gray-50'
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
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Projects</h2>
      <div className="grid grid-cols-4 gap-4">
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
