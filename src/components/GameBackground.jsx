import { useEffect, useRef } from 'react'

/**
 * Full-screen animated canvas background
 * — particle starfield with mouse interaction
 * — radar sweep with pulsing contacts
 * — matrix rain columns
 * — expanding sonar rings
 * — mouse trail particles
 * — oscilloscope waveform
 */
export default function GameBackground() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -1000, y: -1000 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let W, H

    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // ─── Mouse tracking ───
    const onMouse = (e) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY }
    window.addEventListener('mousemove', onMouse)

    // ─── 1. STARFIELD PARTICLES ───
    const STAR_COUNT = 180
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 3000 - 500,
      y: Math.random() * 2000 - 500,
      z: Math.random() * 1000,
      size: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }))

    function drawStars(t) {
      const mx = mouse.current.x
      const my = mouse.current.y
      for (const s of stars) {
        s.z -= s.speed
        s.pulse += 0.02
        if (s.z <= 0) { s.z = 1000; s.x = Math.random() * 3000 - 500; s.y = Math.random() * 2000 - 500 }

        const scale = 800 / (s.z + 800)
        const sx = (s.x - 1000) * scale + W / 2
        const sy = (s.y - 500) * scale + H / 2
        const sz = s.size * scale

        // Mouse repulsion
        const dx = sx - mx, dy = sy - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const repel = dist < 150 ? (150 - dist) / 150 : 0
        const rx = sx + dx * repel * 0.5
        const ry = sy + dy * repel * 0.5

        const alpha = (0.15 + Math.sin(s.pulse) * 0.1) * Math.min(scale, 1)
        ctx.beginPath()
        ctx.arc(rx, ry, sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220, 38, 38, ${alpha})`
        ctx.fill()

        // Connection lines to nearby stars
        for (const s2 of stars) {
          if (s2 === s) continue
          const sc2 = 800 / (s2.z + 800)
          const sx2 = (s2.x - 1000) * sc2 + W / 2
          const sy2 = (s2.y - 500) * sc2 + H / 2
          const d = Math.hypot(sx2 - rx, sy2 - ry)
          if (d < 80) {
            ctx.beginPath()
            ctx.moveTo(rx, ry)
            ctx.lineTo(sx2, sy2)
            ctx.strokeStyle = `rgba(220, 38, 38, ${0.04 * (1 - d / 80)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    // ─── 2. RADAR SWEEP ───
    const radarX = 120, radarY = H - 120, radarR = 80
    const contacts = Array.from({ length: 8 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 0.8 + 0.1,
      fade: 0,
    }))

    function drawRadar(t) {
      const ry = H - 120
      const sweepAngle = (t * 0.001) % (Math.PI * 2)

      // Radar circle
      ctx.beginPath()
      ctx.arc(radarX, ry, radarR, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.15)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Inner rings
      for (let r = 20; r <= 60; r += 20) {
        ctx.beginPath()
        ctx.arc(radarX, ry, r, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.06)'
        ctx.stroke()
      }

      // Cross lines
      ctx.beginPath()
      ctx.moveTo(radarX - radarR, ry); ctx.lineTo(radarX + radarR, ry)
      ctx.moveTo(radarX, ry - radarR); ctx.lineTo(radarX, ry + radarR)
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.06)'
      ctx.stroke()

      // Sweep line with gradient trail
      const grad = ctx.createConicalGradient
        ? null // not supported everywhere
        : null
      // Sweep trail (fading arc)
      for (let i = 0; i < 30; i++) {
        const a = sweepAngle - i * 0.03
        const alpha = 0.12 * (1 - i / 30)
        ctx.beginPath()
        ctx.moveTo(radarX, ry)
        ctx.lineTo(radarX + Math.cos(a) * radarR, ry + Math.sin(a) * radarR)
        ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Contacts
      for (const c of contacts) {
        const diff = ((sweepAngle - c.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
        if (diff < 0.1) c.fade = 1
        c.fade *= 0.995

        if (c.fade > 0.01) {
          const cx = radarX + Math.cos(c.angle) * c.dist * radarR
          const cy = ry + Math.sin(c.angle) * c.dist * radarR
          ctx.beginPath()
          ctx.arc(cx, cy, 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(34, 197, 94, ${c.fade * 0.8})`
          ctx.fill()
          // Glow
          ctx.beginPath()
          ctx.arc(cx, cy, 5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(34, 197, 94, ${c.fade * 0.15})`
          ctx.fill()
        }
      }
    }

    // ─── 3. MATRIX RAIN ───
    const COLS = Math.floor(3000 / 18)
    const drops = Array.from({ length: COLS }, () => ({
      y: Math.random() * -200 - 50,
      speed: Math.random() * 1.5 + 0.5,
      chars: Array.from({ length: 20 }, () => String.fromCharCode(0x30A0 + Math.random() * 96)),
    }))

    function drawMatrix(t) {
      ctx.font = '11px monospace'
      for (let i = 0; i < COLS; i++) {
        const d = drops[i]
        const x = i * 18 + 230 // offset past sidebar
        d.y += d.speed

        for (let j = 0; j < d.chars.length; j++) {
          const y = d.y - j * 14
          if (y < 0 || y > H) continue
          const alpha = j === 0 ? 0.12 : 0.03 * (1 - j / d.chars.length)
          ctx.fillStyle = `rgba(220, 38, 38, ${alpha})`
          ctx.fillText(d.chars[j], x, y)
          // Randomly change characters
          if (Math.random() < 0.01) d.chars[j] = String.fromCharCode(0x30A0 + Math.random() * 96)
        }

        if (d.y - d.chars.length * 14 > H) {
          d.y = Math.random() * -200 - 50
          d.speed = Math.random() * 1.5 + 0.5
        }
      }
    }

    // ─── 4. SONAR RINGS ───
    const rings = []
    let lastRing = 0

    function drawRings(t) {
      if (t - lastRing > 3000) {
        rings.push({ x: W / 2 + 100, y: H / 2, born: t })
        lastRing = t
      }

      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]
        const age = (t - r.born) / 1000
        if (age > 4) { rings.splice(i, 1); continue }
        const radius = age * 150
        const alpha = 0.08 * (1 - age / 4)
        ctx.beginPath()
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }

    // ─── 5. MOUSE TRAIL ───
    const trail = []

    function drawTrail(t) {
      const mx = mouse.current.x, my = mouse.current.y
      if (mx > 0 && my > 0) {
        for (let i = 0; i < 2; i++) {
          trail.push({
            x: mx + (Math.random() - 0.5) * 10,
            y: my + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 1,
            life: 1,
            size: Math.random() * 3 + 1,
          })
        }
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i]
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.02
        if (p.life <= 0) { trail.splice(i, 1); continue }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(239, 68, 68, ${p.life * 0.4})`
        ctx.fill()
      }
    }

    // ─── 6. WAVEFORM / OSCILLOSCOPE ───
    function drawWaveform(t) {
      const y0 = H - 30
      ctx.beginPath()
      ctx.moveTo(230, y0)
      for (let x = 230; x < W; x += 2) {
        const n = (x - 230) / (W - 230)
        const y = y0 + Math.sin(n * 12 + t * 0.003) * 8
          + Math.sin(n * 25 + t * 0.005) * 4
          + Math.sin(n * 50 + t * 0.002) * 2
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.12)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Second wave
      ctx.beginPath()
      ctx.moveTo(230, y0)
      for (let x = 230; x < W; x += 2) {
        const n = (x - 230) / (W - 230)
        const y = y0 + Math.sin(n * 8 - t * 0.002) * 6
          + Math.cos(n * 18 + t * 0.004) * 3
        ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.06)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // ─── 7. FLOATING HEX GRID ───
    function drawHexGrid(t) {
      const size = 40
      const rows = Math.ceil(H / (size * 1.5)) + 1
      const cols = Math.ceil(W / (size * Math.sqrt(3))) + 1

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const offset = r % 2 === 0 ? 0 : size * Math.sqrt(3) / 2
          const cx = c * size * Math.sqrt(3) + offset
          const cy = r * size * 1.5

          // Only draw some hexes (sparse)
          const hash = (r * 137 + c * 97) % 17
          if (hash > 2) continue

          const pulse = Math.sin(t * 0.001 + r * 0.3 + c * 0.5) * 0.5 + 0.5
          const alpha = 0.015 + pulse * 0.02

          ctx.beginPath()
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 6
            const hx = cx + (size * 0.4) * Math.cos(a)
            const hy = cy + (size * 0.4) * Math.sin(a)
            if (i === 0) ctx.moveTo(hx, hy)
            else ctx.lineTo(hx, hy)
          }
          ctx.closePath()
          ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    // ─── 8. CORNER HUD BRACKETS ───
    function drawHUD(t) {
      const bLen = 30
      const pad = 20
      const alpha = 0.15 + Math.sin(t * 0.002) * 0.05
      ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`
      ctx.lineWidth = 1.5

      // Top-left
      ctx.beginPath()
      ctx.moveTo(230 + pad, pad + bLen); ctx.lineTo(230 + pad, pad); ctx.lineTo(230 + pad + bLen, pad)
      ctx.stroke()
      // Top-right
      ctx.beginPath()
      ctx.moveTo(W - pad - bLen, pad); ctx.lineTo(W - pad, pad); ctx.lineTo(W - pad, pad + bLen)
      ctx.stroke()
      // Bottom-right
      ctx.beginPath()
      ctx.moveTo(W - pad, H - pad - bLen); ctx.lineTo(W - pad, H - pad); ctx.lineTo(W - pad - bLen, H - pad)
      ctx.stroke()
      // Bottom-left (skip — radar is there)

      // Scanning line
      const scanY = (t * 0.05) % H
      ctx.beginPath()
      ctx.moveTo(230, scanY)
      ctx.lineTo(W, scanY)
      const scanGrad = ctx.createLinearGradient(230, 0, W, 0)
      scanGrad.addColorStop(0, 'rgba(220, 38, 38, 0)')
      scanGrad.addColorStop(0.3, 'rgba(220, 38, 38, 0.04)')
      scanGrad.addColorStop(0.7, 'rgba(220, 38, 38, 0.04)')
      scanGrad.addColorStop(1, 'rgba(220, 38, 38, 0)')
      ctx.strokeStyle = scanGrad
      ctx.lineWidth = 1
      ctx.stroke()

      // Data readout text
      ctx.font = '9px monospace'
      ctx.fillStyle = `rgba(220, 38, 38, ${0.15 + Math.sin(t * 0.003) * 0.05})`
      ctx.fillText(`SYS.UPTIME ${Math.floor(t / 1000)}s`, 240 + pad, pad + 12)
      ctx.fillText(`PARTICLES ${stars.length + trail.length}`, 240 + pad, pad + 24)
      ctx.fillText(`FRAME ${Math.round(1000 / 16)}fps`, W - pad - 80, pad + 12)

      // Targeting reticle at mouse
      const mx = mouse.current.x, my = mouse.current.y
      if (mx > 230 && my > 0) {
        const rAlpha = 0.15
        ctx.strokeStyle = `rgba(239, 68, 68, ${rAlpha})`
        ctx.lineWidth = 1

        // Outer ring
        ctx.beginPath()
        ctx.arc(mx, my, 25, 0, Math.PI * 2)
        ctx.stroke()

        // Inner cross
        const gap = 8
        ctx.beginPath()
        ctx.moveTo(mx - 25, my); ctx.lineTo(mx - gap, my)
        ctx.moveTo(mx + gap, my); ctx.lineTo(mx + 25, my)
        ctx.moveTo(mx, my - 25); ctx.lineTo(mx, my - gap)
        ctx.moveTo(mx, my + gap); ctx.lineTo(mx, my + 25)
        ctx.stroke()

        // Rotating outer brackets
        const ra = t * 0.002
        for (let i = 0; i < 4; i++) {
          const a = ra + (Math.PI / 2) * i
          const ox = mx + Math.cos(a) * 35
          const oy = my + Math.sin(a) * 35
          ctx.beginPath()
          ctx.arc(ox, oy, 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(239, 68, 68, ${rAlpha})`
          ctx.fill()
        }
      }
    }

    // ─── 9. EQ VISUALIZER BARS ───
    const EQ_BARS = 32
    const eqValues = Array.from({ length: EQ_BARS }, () => Math.random())

    function drawEQ(t) {
      const barW = 4
      const gap = 2
      const totalW = EQ_BARS * (barW + gap)
      const startX = W - totalW - 30
      const baseY = H - 55

      for (let i = 0; i < EQ_BARS; i++) {
        // Smooth random animation
        eqValues[i] += (Math.random() - 0.5) * 0.15
        eqValues[i] = Math.max(0.05, Math.min(1, eqValues[i]))
        // Add some wave pattern
        const wave = Math.sin(t * 0.003 + i * 0.3) * 0.3 + 0.5
        const h = eqValues[i] * wave * 35

        const x = startX + i * (barW + gap)
        const alpha = 0.1 + (h / 35) * 0.15

        ctx.fillStyle = `rgba(220, 38, 38, ${alpha})`
        ctx.fillRect(x, baseY - h, barW, h)

        // Reflection
        ctx.fillStyle = `rgba(220, 38, 38, ${alpha * 0.3})`
        ctx.fillRect(x, baseY + 2, barW, h * 0.3)
      }
    }

    // ─── MAIN LOOP ───
    function frame(t) {
      ctx.clearRect(0, 0, W, H)

      drawHexGrid(t)
      drawStars(t)
      drawMatrix(t)
      drawRings(t)
      drawWaveform(t)
      drawRadar(t)
      drawTrail(t)
      drawEQ(t)
      drawHUD(t)

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
      {/* CSS overlay effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Scanlines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)',
            backgroundSize: '100% 2px',
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
          }}
        />
        {/* Red ambient glow from top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]"
          style={{
            background: 'radial-gradient(ellipse, rgba(220,38,38,0.04) 0%, transparent 70%)',
          }}
        />
      </div>
    </>
  )
}
