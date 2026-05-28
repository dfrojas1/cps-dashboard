import { useEffect, useRef } from 'react'

export default function GameBackground() {
  const canvasRef = useRef(null)
  const mouse = useRef({ x: -1000, y: -1000, click: false })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf, W, H

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const onMouse = (e) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY }
    const onClick = () => { mouse.current.click = true }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('click', onClick)

    // ─── 1. MEGA STARFIELD (300 particles, bright) ───
    const STAR_COUNT = 350
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 4000 - 1000, y: Math.random() * 3000 - 500,
      z: Math.random() * 1000, size: Math.random() * 2.5 + 0.8,
      speed: Math.random() * 0.5 + 0.15, pulse: Math.random() * Math.PI * 2,
      color: Math.random() > 0.7 ? [239, 68, 68] : Math.random() > 0.5 ? [220, 38, 38] : [255, 100, 100],
    }))

    function drawStars(t) {
      const mx = mouse.current.x, my = mouse.current.y
      for (const s of stars) {
        s.z -= s.speed; s.pulse += 0.025
        if (s.z <= 0) { s.z = 1000; s.x = Math.random() * 4000 - 1000; s.y = Math.random() * 3000 - 500 }
        const scale = 800 / (s.z + 800)
        const sx = (s.x - 1500) * scale + W / 2, sy = (s.y - 750) * scale + H / 2, sz = s.size * scale
        const dx = sx - mx, dy = sy - my, dist = Math.hypot(dx, dy)
        const repel = dist < 200 ? (200 - dist) / 200 : 0
        const rx = sx + dx * repel * 0.8, ry = sy + dy * repel * 0.8
        const alpha = (0.4 + Math.sin(s.pulse) * 0.25) * Math.min(scale, 1)
        const [cr, cg, cb] = s.color

        // Glow
        ctx.beginPath(); ctx.arc(rx, ry, sz * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha * 0.15})`; ctx.fill()
        // Core
        ctx.beginPath(); ctx.arc(rx, ry, sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha})`; ctx.fill()

        // Connection lines
        for (let j = stars.indexOf(s) + 1; j < stars.length; j++) {
          const s2 = stars[j]
          const sc2 = 800 / (s2.z + 800)
          const sx2 = (s2.x - 1500) * sc2 + W / 2, sy2 = (s2.y - 750) * sc2 + H / 2
          const d = Math.hypot(sx2 - rx, sy2 - ry)
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(sx2, sy2)
            ctx.strokeStyle = `rgba(220, 38, 38, ${0.15 * (1 - d / 120)})`
            ctx.lineWidth = 0.8; ctx.stroke()
          }
        }
      }
    }

    // ─── 2. TRON GRID FLOOR ───
    function drawTronGrid(t) {
      const horizon = H * 0.55
      const gridLines = 40
      const speed = (t * 0.0005) % 1

      // Horizontal lines (perspective)
      for (let i = 0; i < gridLines; i++) {
        const n = (i + speed) / gridLines
        const y = horizon + (H - horizon) * Math.pow(n, 1.5)
        const alpha = 0.06 + n * 0.12
        const spread = 0.3 + n * 0.7

        ctx.beginPath()
        ctx.moveTo(W * (0.5 - spread), y)
        ctx.lineTo(W * (0.5 + spread), y)
        ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`
        ctx.lineWidth = n > 0.5 ? 1.5 : 0.8
        ctx.stroke()
      }

      // Vertical lines (converge to vanishing point)
      const vx = W / 2 + 50
      for (let i = -15; i <= 15; i++) {
        const x = vx + i * 80
        const alpha = 0.04 + Math.abs(i) * 0.003
        ctx.beginPath()
        ctx.moveTo(vx + i * 3, horizon)
        ctx.lineTo(x, H + 20)
        ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`
        ctx.lineWidth = 0.6
        ctx.stroke()
      }

      // Horizon glow line
      const hGrad = ctx.createLinearGradient(0, horizon - 2, 0, horizon + 30)
      hGrad.addColorStop(0, 'rgba(220, 38, 38, 0.25)')
      hGrad.addColorStop(0.3, 'rgba(220, 38, 38, 0.08)')
      hGrad.addColorStop(1, 'rgba(220, 38, 38, 0)')
      ctx.fillStyle = hGrad
      ctx.fillRect(100, horizon - 2, W - 200, 32)
    }

    // ─── 3. PLASMA / NEBULA CLOUDS ───
    function drawPlasma(t) {
      const imageData = ctx.getImageData(0, 0, W, H)
      // Instead of pixel manipulation (too slow), draw gradient blobs
      const blobs = [
        { x: W * 0.3 + Math.sin(t * 0.0003) * 200, y: H * 0.3 + Math.cos(t * 0.0004) * 150, r: 300, color: [220, 38, 38] },
        { x: W * 0.7 + Math.cos(t * 0.0005) * 250, y: H * 0.6 + Math.sin(t * 0.0003) * 180, r: 250, color: [180, 20, 20] },
        { x: W * 0.5 + Math.sin(t * 0.0004) * 300, y: H * 0.2 + Math.cos(t * 0.0006) * 100, r: 200, color: [255, 60, 60] },
        { x: W * 0.8 + Math.cos(t * 0.0002) * 150, y: H * 0.8 + Math.sin(t * 0.0005) * 100, r: 180, color: [200, 30, 30] },
      ]

      for (const b of blobs) {
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        grad.addColorStop(0, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, 0.06)`)
        grad.addColorStop(0.5, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, 0.02)`)
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = grad
        ctx.fillRect(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2)
      }
    }

    // ─── 4. RADAR (bigger, brighter) ───
    const radarX = 130, radarR = 100
    const contacts = Array.from({ length: 12 }, () => ({
      angle: Math.random() * Math.PI * 2, dist: Math.random() * 0.85 + 0.1, fade: 0,
    }))

    function drawRadar(t) {
      const ry = H - 140
      const sweepAngle = (t * 0.0012) % (Math.PI * 2)

      // Background glow
      const rglow = ctx.createRadialGradient(radarX, ry, 0, radarX, ry, radarR + 20)
      rglow.addColorStop(0, 'rgba(220, 38, 38, 0.04)')
      rglow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = rglow; ctx.fillRect(radarX - radarR - 20, ry - radarR - 20, (radarR + 20) * 2, (radarR + 20) * 2)

      // Circles
      for (let r = 25; r <= radarR; r += 25) {
        ctx.beginPath(); ctx.arc(radarX, ry, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(220, 38, 38, ${r === radarR ? 0.3 : 0.1})`
        ctx.lineWidth = r === radarR ? 1.5 : 0.8; ctx.stroke()
      }
      // Cross
      ctx.beginPath()
      ctx.moveTo(radarX - radarR, ry); ctx.lineTo(radarX + radarR, ry)
      ctx.moveTo(radarX, ry - radarR); ctx.lineTo(radarX, ry + radarR)
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.12)'; ctx.lineWidth = 0.8; ctx.stroke()

      // Sweep with filled arc
      ctx.beginPath(); ctx.moveTo(radarX, ry)
      ctx.arc(radarX, ry, radarR, sweepAngle - 0.6, sweepAngle)
      ctx.closePath()
      const sweepGrad = ctx.createRadialGradient(radarX, ry, 0, radarX, ry, radarR)
      sweepGrad.addColorStop(0, 'rgba(220, 38, 38, 0.15)')
      sweepGrad.addColorStop(1, 'rgba(220, 38, 38, 0.02)')
      ctx.fillStyle = sweepGrad; ctx.fill()

      // Sweep line
      ctx.beginPath(); ctx.moveTo(radarX, ry)
      ctx.lineTo(radarX + Math.cos(sweepAngle) * radarR, ry + Math.sin(sweepAngle) * radarR)
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.5)'; ctx.lineWidth = 2; ctx.stroke()

      // Contacts with big glow
      for (const c of contacts) {
        const diff = ((sweepAngle - c.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
        if (diff < 0.15) c.fade = 1
        c.fade *= 0.992
        if (c.fade > 0.02) {
          const cx = radarX + Math.cos(c.angle) * c.dist * radarR
          const cy = ry + Math.sin(c.angle) * c.dist * radarR
          ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(34, 197, 94, ${c.fade * 0.2})`; ctx.fill()
          ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(34, 197, 94, ${c.fade * 0.9})`; ctx.fill()
        }
      }
    }

    // ─── 5. MATRIX RAIN (brighter, green+red mix) ───
    const COLS = Math.floor(2000 / 16)
    const drops = Array.from({ length: COLS }, () => ({
      y: Math.random() * -500 - 50, speed: Math.random() * 2.5 + 0.8,
      chars: Array.from({ length: 25 }, () => String.fromCharCode(0x30A0 + Math.random() * 96)),
      green: Math.random() > 0.6,
    }))

    function drawMatrix(t) {
      ctx.font = '13px monospace'
      for (let i = 0; i < COLS; i++) {
        const d = drops[i]; const x = i * 16 + 240
        d.y += d.speed
        for (let j = 0; j < d.chars.length; j++) {
          const y = d.y - j * 16; if (y < 0 || y > H) continue
          const head = j === 0
          const alpha = head ? 0.5 : 0.15 * (1 - j / d.chars.length)
          if (d.green) {
            ctx.fillStyle = head ? `rgba(34, 197, 94, ${alpha})` : `rgba(34, 197, 94, ${alpha * 0.5})`
          } else {
            ctx.fillStyle = head ? `rgba(239, 68, 68, ${alpha})` : `rgba(220, 38, 38, ${alpha * 0.6})`
          }
          ctx.fillText(d.chars[j], x, y)
          if (Math.random() < 0.02) d.chars[j] = String.fromCharCode(0x30A0 + Math.random() * 96)
        }
        if (d.y - d.chars.length * 16 > H) { d.y = Math.random() * -300 - 50; d.speed = Math.random() * 2.5 + 0.8 }
      }
    }

    // ─── 6. SONAR RINGS (more frequent, brighter) ───
    const rings = []; let lastRing = 0

    function drawRings(t) {
      if (t - lastRing > 1500) { rings.push({ x: W * 0.55, y: H * 0.4, born: t }); lastRing = t }
      // Click rings
      if (mouse.current.click) {
        rings.push({ x: mouse.current.x, y: mouse.current.y, born: t, bright: true })
        mouse.current.click = false
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i]; const age = (t - r.born) / 1000
        if (age > 3) { rings.splice(i, 1); continue }
        const radius = age * 250; const alpha = (r.bright ? 0.35 : 0.15) * (1 - age / 3)
        ctx.beginPath(); ctx.arc(r.x, r.y, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`
        ctx.lineWidth = r.bright ? 3 : 2; ctx.stroke()
        // Inner glow ring
        ctx.beginPath(); ctx.arc(r.x, r.y, radius * 0.95, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 100, 100, ${alpha * 0.3})`
        ctx.lineWidth = 1; ctx.stroke()
      }
    }

    // ─── 7. MOUSE TRAIL (bigger, more particles) ───
    const trail = []
    function drawTrail(t) {
      const mx = mouse.current.x, my = mouse.current.y
      if (mx > 0 && my > 0) {
        for (let i = 0; i < 5; i++) {
          trail.push({
            x: mx + (Math.random() - 0.5) * 20, y: my + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4 - 2,
            life: 1, size: Math.random() * 4 + 1.5,
            color: Math.random() > 0.3 ? [239, 68, 68] : [255, 160, 50],
          })
        }
      }
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.life -= 0.018
        if (p.life <= 0) { trail.splice(i, 1); continue }
        const [cr, cg, cb] = p.color
        // Glow
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${p.life * 0.15})`; ctx.fill()
        // Core
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${p.life * 0.7})`; ctx.fill()
      }
      if (trail.length > 400) trail.splice(0, trail.length - 400)
    }

    // ─── 8. WAVEFORM (bright, thick, multiple) ───
    function drawWaveform(t) {
      for (let w = 0; w < 3; w++) {
        const y0 = H - 25 - w * 15
        const alpha = 0.25 - w * 0.07
        ctx.beginPath(); ctx.moveTo(240, y0)
        for (let x = 240; x < W; x += 2) {
          const n = (x - 240) / (W - 240)
          const y = y0 + Math.sin(n * (10 + w * 5) + t * (0.003 + w * 0.001)) * (10 - w * 2)
            + Math.sin(n * (20 + w * 8) + t * (0.005 - w * 0.001)) * (5 - w)
            + Math.sin(n * 40 + t * 0.002) * 3
          ctx.lineTo(x, y)
        }
        ctx.strokeStyle = w === 0
          ? `rgba(220, 38, 38, ${alpha})`
          : w === 1
          ? `rgba(239, 68, 68, ${alpha})`
          : `rgba(34, 197, 94, ${alpha * 0.6})`
        ctx.lineWidth = 2 - w * 0.5; ctx.stroke()
      }
    }

    // ─── 9. LIGHTNING BOLTS ───
    const bolts = []
    let lastBolt = 0

    function makeBolt(x1, y1, x2, y2, depth = 0) {
      if (depth > 4) return [{ x1, y1, x2, y2 }]
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 80 / (depth + 1)
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 80 / (depth + 1)
      const segs = [...makeBolt(x1, y1, mx, my, depth + 1), ...makeBolt(mx, my, x2, y2, depth + 1)]
      if (depth < 2 && Math.random() > 0.5) {
        const bx = mx + (Math.random() - 0.5) * 100
        const by = my + (Math.random() - 0.5) * 100
        segs.push(...makeBolt(mx, my, bx, by, depth + 2))
      }
      return segs
    }

    function drawLightning(t) {
      if (t - lastBolt > 4000 + Math.random() * 3000) {
        const x1 = 300 + Math.random() * (W - 400)
        const y1 = Math.random() * H * 0.3
        const x2 = x1 + (Math.random() - 0.5) * 300
        const y2 = y1 + 200 + Math.random() * 300
        bolts.push({ segs: makeBolt(x1, y1, x2, y2), born: t })
        lastBolt = t
      }
      for (let i = bolts.length - 1; i >= 0; i--) {
        const b = bolts[i]; const age = t - b.born
        if (age > 300) { bolts.splice(i, 1); continue }
        const alpha = 0.4 * (1 - age / 300)
        ctx.lineWidth = 2
        for (const s of b.segs) {
          ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2)
          ctx.strokeStyle = `rgba(255, 120, 120, ${alpha})`; ctx.stroke()
        }
        // Flash glow
        if (age < 50) {
          ctx.lineWidth = 6
          for (const s of b.segs) {
            ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2)
            ctx.strokeStyle = `rgba(255, 200, 200, ${0.15 * (1 - age / 50)})`; ctx.stroke()
          }
        }
      }
    }

    // ─── 10. EDGE RUNNERS (glowing dots along borders) ───
    const runners = Array.from({ length: 6 }, () => ({
      pos: Math.random(), speed: 0.0005 + Math.random() * 0.001,
      edge: Math.floor(Math.random() * 4), size: 3 + Math.random() * 3,
    }))

    function drawEdgeRunners(t) {
      for (const r of runners) {
        r.pos = (r.pos + r.speed) % 1
        let x, y
        if (r.edge === 0) { x = 230 + r.pos * (W - 230); y = 0 }         // top
        else if (r.edge === 1) { x = W; y = r.pos * H }                    // right
        else if (r.edge === 2) { x = W - r.pos * (W - 230); y = H }        // bottom
        else { x = 230; y = H - r.pos * H }                                // left

        // Trail
        const trailLen = 60
        for (let i = 0; i < trailLen; i++) {
          const tp = (r.pos - i * r.speed * 3 + 1) % 1
          let tx, ty
          if (r.edge === 0) { tx = 230 + tp * (W - 230); ty = 0 }
          else if (r.edge === 1) { tx = W; ty = tp * H }
          else if (r.edge === 2) { tx = W - tp * (W - 230); ty = H }
          else { tx = 230; ty = H - tp * H }
          const a = 0.3 * (1 - i / trailLen)
          ctx.beginPath(); ctx.arc(tx, ty, r.size * (1 - i / trailLen * 0.7), 0, Math.PI * 2)
          ctx.fillStyle = `rgba(220, 38, 38, ${a})`; ctx.fill()
        }

        // Head glow
        ctx.beginPath(); ctx.arc(x, y, r.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 100, 100, 0.15)'; ctx.fill()
        ctx.beginPath(); ctx.arc(x, y, r.size, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 130, 130, 0.6)'; ctx.fill()
      }
    }

    // ─── 11. FLOATING DATA ORBS ───
    const orbs = Array.from({ length: 8 }, () => ({
      x: 300 + Math.random() * (1200), y: 100 + Math.random() * 600,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      size: 15 + Math.random() * 25, phase: Math.random() * Math.PI * 2,
      label: ['SYS', 'NET', 'CPU', 'MEM', 'GPU', 'I/O', 'SEC', 'API'][Math.floor(Math.random() * 8)],
    }))

    function drawOrbs(t) {
      for (const o of orbs) {
        o.x += o.vx + Math.sin(t * 0.0005 + o.phase) * 0.3
        o.y += o.vy + Math.cos(t * 0.0004 + o.phase) * 0.2
        if (o.x < 250 || o.x > W - 20) o.vx *= -1
        if (o.y < 20 || o.y > H - 20) o.vy *= -1
        o.phase += 0.01

        const pulse = 0.7 + Math.sin(t * 0.003 + o.phase) * 0.3

        // Outer glow
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.size * 2)
        g.addColorStop(0, `rgba(220, 38, 38, ${0.08 * pulse})`)
        g.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = g; ctx.fillRect(o.x - o.size * 2, o.y - o.size * 2, o.size * 4, o.size * 4)

        // Ring
        ctx.beginPath(); ctx.arc(o.x, o.y, o.size * pulse, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(220, 38, 38, ${0.2 * pulse})`; ctx.lineWidth = 1.5; ctx.stroke()

        // Inner ring
        ctx.beginPath(); ctx.arc(o.x, o.y, o.size * 0.5 * pulse, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.15 * pulse})`; ctx.lineWidth = 1; ctx.stroke()

        // Label
        ctx.font = '8px monospace'
        ctx.fillStyle = `rgba(220, 38, 38, ${0.3 * pulse})`
        ctx.textAlign = 'center'
        ctx.fillText(o.label, o.x, o.y + 3)
        ctx.textAlign = 'start'
      }
    }

    // ─── 12. EQ VISUALIZER (bigger, brighter) ───
    const EQ_BARS = 48; const eqValues = Array.from({ length: EQ_BARS }, () => Math.random())

    function drawEQ(t) {
      const barW = 5, gap = 2, totalW = EQ_BARS * (barW + gap)
      const startX = W - totalW - 20, baseY = H - 50
      for (let i = 0; i < EQ_BARS; i++) {
        eqValues[i] += (Math.random() - 0.5) * 0.2
        eqValues[i] = Math.max(0.05, Math.min(1, eqValues[i]))
        const wave = Math.sin(t * 0.004 + i * 0.25) * 0.4 + 0.6
        const h = eqValues[i] * wave * 50
        const x = startX + i * (barW + gap)
        const alpha = 0.2 + (h / 50) * 0.4

        // Gradient bar
        const grad = ctx.createLinearGradient(x, baseY - h, x, baseY)
        grad.addColorStop(0, `rgba(239, 68, 68, ${alpha})`)
        grad.addColorStop(1, `rgba(220, 38, 38, ${alpha * 0.5})`)
        ctx.fillStyle = grad; ctx.fillRect(x, baseY - h, barW, h)

        // Peak dot
        ctx.beginPath(); ctx.arc(x + barW / 2, baseY - h - 3, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 150, 150, ${alpha})`; ctx.fill()

        // Reflection
        ctx.fillStyle = `rgba(220, 38, 38, ${alpha * 0.2})`
        ctx.fillRect(x, baseY + 3, barW, h * 0.25)
      }
    }

    // ─── 13. HUD (brighter) ───
    function drawHUD(t) {
      const pad = 15; const bLen = 40
      const alpha = 0.35 + Math.sin(t * 0.002) * 0.1
      ctx.strokeStyle = `rgba(220, 38, 38, ${alpha})`; ctx.lineWidth = 2

      // Corners
      ctx.beginPath()
      ctx.moveTo(240 + pad, pad + bLen); ctx.lineTo(240 + pad, pad); ctx.lineTo(240 + pad + bLen, pad)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(W - pad - bLen, pad); ctx.lineTo(W - pad, pad); ctx.lineTo(W - pad, pad + bLen)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(W - pad, H - pad - bLen); ctx.lineTo(W - pad, H - pad); ctx.lineTo(W - pad - bLen, H - pad)
      ctx.stroke()

      // Scan line (brighter)
      const scanY = (t * 0.06) % H
      ctx.beginPath(); ctx.moveTo(240, scanY); ctx.lineTo(W, scanY)
      const sg = ctx.createLinearGradient(240, 0, W, 0)
      sg.addColorStop(0, 'rgba(220, 38, 38, 0)'); sg.addColorStop(0.3, 'rgba(220, 38, 38, 0.1)')
      sg.addColorStop(0.7, 'rgba(220, 38, 38, 0.1)'); sg.addColorStop(1, 'rgba(220, 38, 38, 0)')
      ctx.strokeStyle = sg; ctx.lineWidth = 2; ctx.stroke()
      // Glow band
      ctx.fillStyle = `rgba(220, 38, 38, 0.02)`
      ctx.fillRect(240, scanY - 15, W - 240, 30)

      // Data readout
      ctx.font = '10px monospace'
      ctx.fillStyle = `rgba(220, 38, 38, ${0.4 + Math.sin(t * 0.003) * 0.1})`
      ctx.fillText(`SYS.UPTIME ${Math.floor(t / 1000)}s`, 250 + pad, pad + 14)
      ctx.fillText(`PARTICLES ${stars.length + trail.length}`, 250 + pad, pad + 28)
      ctx.fillStyle = `rgba(34, 197, 94, 0.35)`
      ctx.fillText(`STATUS: OPERATIONAL`, 250 + pad, pad + 42)
      ctx.fillStyle = `rgba(220, 38, 38, 0.3)`
      ctx.fillText(`${Math.round(1000 / 16)}fps`, W - pad - 45, pad + 14)

      // Targeting reticle
      const mx = mouse.current.x, my = mouse.current.y
      if (mx > 240 && my > 0) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)'; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.arc(mx, my, 30, 0, Math.PI * 2); ctx.stroke()
        ctx.beginPath(); ctx.arc(mx, my, 18, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)'; ctx.stroke()

        const gap = 10
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)'; ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(mx - 30, my); ctx.lineTo(mx - gap, my)
        ctx.moveTo(mx + gap, my); ctx.lineTo(mx + 30, my)
        ctx.moveTo(mx, my - 30); ctx.lineTo(mx, my - gap)
        ctx.moveTo(mx, my + gap); ctx.lineTo(mx, my + 30)
        ctx.stroke()

        // Rotating dots
        const ra = t * 0.003
        for (let i = 0; i < 4; i++) {
          const a = ra + (Math.PI / 2) * i
          ctx.beginPath(); ctx.arc(mx + Math.cos(a) * 42, my + Math.sin(a) * 42, 3, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; ctx.fill()
        }

        // Coord readout
        ctx.font = '9px monospace'
        ctx.fillStyle = 'rgba(220, 38, 38, 0.3)'
        ctx.fillText(`${mx},${my}`, mx + 35, my - 5)
      }
    }

    // ─── MAIN LOOP ───
    function frame(t) {
      ctx.clearRect(0, 0, W, H)
      drawPlasma(t)
      drawTronGrid(t)
      drawStars(t)
      drawMatrix(t)
      drawOrbs(t)
      drawRings(t)
      drawLightning(t)
      drawEdgeRunners(t)
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
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" style={{ mixBlendMode: 'screen' }} />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* CRT scanlines */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.4) 1px, rgba(0,0,0,0.4) 2px)',
          backgroundSize: '100% 2px',
        }} />
        {/* Vignette */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
        }} />
        {/* Big red ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] animate-pulse" style={{
          background: 'radial-gradient(ellipse, rgba(220,38,38,0.08) 0%, transparent 70%)',
          animationDuration: '4s',
        }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[300px]" style={{
          background: 'radial-gradient(ellipse, rgba(220,38,38,0.06) 0%, transparent 70%)',
        }} />
        <div className="absolute top-1/2 right-0 w-[400px] h-[600px] -translate-y-1/2 animate-pulse" style={{
          background: 'radial-gradient(ellipse, rgba(220,38,38,0.05) 0%, transparent 70%)',
          animationDuration: '6s',
        }} />
      </div>
    </>
  )
}
