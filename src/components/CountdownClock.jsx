import { useState, useEffect } from 'react'

function getNextMonday() {
  const now = new Date()
  const day = now.getDay() // 0=Sun, 1=Mon, ...
  const daysUntilMonday = day === 0 ? 1 : day === 1 ? 7 : 8 - day
  const next = new Date(now)
  next.setDate(now.getDate() + daysUntilMonday)
  next.setHours(0, 0, 0, 0)
  return next
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function TimeUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold font-mono text-cc-red drop-shadow-[0_0_12px_rgba(220,38,38,0.4)] tabular-nums">
        {pad(value)}
      </span>
      <span className="text-[9px] text-cc-text-muted uppercase tracking-[0.2em] mt-1">{label}</span>
    </div>
  )
}

function Separator() {
  return (
    <span className="text-xl font-mono text-cc-red/40 self-start mt-1.5 animate-pulse">:</span>
  )
}

export default function CountdownClock() {
  const [diff, setDiff] = useState({ d: 0, h: 0, m: 0, s: 0 })

  useEffect(() => {
    function calc() {
      const now = new Date()
      const target = getNextMonday()
      let ms = target - now
      if (ms < 0) ms = 0
      const d = Math.floor(ms / 86400000)
      const h = Math.floor((ms % 86400000) / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setDiff({ d, h, m, s })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  const totalHours = diff.d * 24 + diff.h
  const maxHours = 7 * 24
  const pct = ((maxHours - totalHours) / maxHours) * 100
  const urgent = totalHours < 24

  return (
    <div className="bg-cc-panel rounded-lg border border-cc-border p-5 relative overflow-hidden">
      {/* Crosshair background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-cc-red/[0.06]" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-cc-red/[0.06]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-cc-red/[0.05]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-cc-red/[0.03]" />
      </div>

      {/* Subtle red vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-cc-red/[0.03] to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-[10px] font-semibold text-cc-text-dim uppercase tracking-[0.15em]">
              Weekly Reset
            </h2>
            {urgent && (
              <span className="text-[9px] bg-cc-red/20 text-cc-red px-1.5 py-0.5 rounded font-bold font-mono tracking-wider animate-pulse">
                URGENT
              </span>
            )}
          </div>
          <span className="text-[10px] text-cc-text-muted font-mono">Next Monday 00:00</span>
        </div>

        <div className="flex items-center justify-center gap-3 py-3">
          <TimeUnit value={diff.d} label="Days" />
          <Separator />
          <TimeUnit value={diff.h} label="Hours" />
          <Separator />
          <TimeUnit value={diff.m} label="Mins" />
          <Separator />
          <TimeUnit value={diff.s} label="Secs" />
        </div>

        {/* Progress arc */}
        <div className="mt-4">
          <div className="flex justify-between text-[9px] mb-1.5 font-mono">
            <span className="text-cc-text-muted uppercase tracking-wider">Week elapsed</span>
            <span className={`${urgent ? 'text-cc-red-glow font-bold' : 'text-cc-text-muted'}`}>
              {Math.round(pct)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-cc-well rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(pct, 1)}%`,
                background: urgent
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : 'linear-gradient(90deg, #dc2626, #991b1b)',
                boxShadow: urgent
                  ? '0 0 12px rgba(239,68,68,0.5)'
                  : '0 0 8px rgba(220,38,38,0.3)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
