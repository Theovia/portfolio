/**
 * Level 0: Macro Cell View (1x magnification)
 *
 * The first thing visitors see. A living biological cell floating in
 * culture medium, breathing and deforming organically. The membrane
 * uses 3-octave fbm noise for natural irregularity. Inside: nucleus
 * with DNA double helix, phospholipid bilayer, cytoskeleton filaments,
 * and 150 medium particles reacting to the cursor.
 */

import { state } from '../engine/state'
import { lerp, clamp, rand, fbm, applyMouseForce } from '../utils/math'

// ── Illumination-aware color helper ──────────────────────────────────
function illumColor(r: number, g: number, b: number, a: number): string {
  let cr = r, cg = g, cb = b, ca = a
  if (state.lightMode) {
    const brightness = (cr + cg + cb) / 3
    if (brightness > 200) {
      cr = 30; cg = 30; cb = 50
    } else if (brightness > 5) {
      cr = Math.round(cr * 0.7)
      cg = Math.round(cg * 0.7)
      cb = Math.round(cb * 0.7)
    }
    ca = Math.min(ca * 1.3, 1)
  }
  let f = state.illumination / 100
  if (state.lightMode) f = Math.max(f, 0.7)
  return `rgba(${Math.round(cr * f)},${Math.round(cg * f)},${Math.round(cb * f)},${ca})`
}

// ── Particle type ────────────────────────────────────────────────────
interface Particle {
  x: number; y: number
  r: number
  vx: number; vy: number
  opacity: number
  phase: number
  hue: number // 0-2 for color variation
}

// ── State (initialized lazily on first draw) ─────────────────────────
let particles: Particle[] | null = null
let cellPulsePhase = 0

function initParticles(): Particle[] {
  const count = state.qualityTier === 'low' ? 60
    : state.qualityTier === 'medium' ? 100 : 150
  const arr: Particle[] = []
  for (let i = 0; i < count; i++) {
    arr.push({
      x: rand(0, 1), y: rand(0, 1),
      r: rand(1, 4.5),
      vx: rand(-0.0002, 0.0002), vy: rand(-0.0002, 0.0002),
      opacity: rand(0.04, 0.22),
      phase: rand(0, Math.PI * 2),
      hue: Math.floor(rand(0, 3)),
    })
  }
  return arr
}

// ── FBM-based membrane radius ────────────────────────────────────────
// Returns a deformation factor (centered around 1.0) for a given angle.
// Uses 3-octave fbm sampled on a ring that slowly drifts with time,
// producing organic, never-repeating irregularity.
function membraneDeform(angle: number, t: number): number {
  // Map the angle onto a ring in noise space
  const nx = Math.cos(angle) * 1.8 + t * 0.12
  const ny = Math.sin(angle) * 1.8 + t * 0.08
  const n = fbm(nx, ny, 3)          // 0..~0.85 range
  return 1.0 + (n - 0.45) * 0.12     // deform -5.4% .. +4.8% approx
}

// ── DNA double helix ─────────────────────────────────────────────────
function drawDNAHelix(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  length: number, radius: number,
  turns: number, phase: number,
  alpha: number, scale: number,
) {
  const steps = Math.floor(turns * 40)
  const basePairEvery = 4
  const bpColors: [number, number, number][][] = [
    [[0, 212, 170], [68, 255, 136]],   // A-T
    [[196, 164, 74], [255, 68, 102]],   // G-C
  ]

  // Backbone strands
  for (let strand = 0; strand < 2; strand++) {
    ctx.beginPath()
    const offset = strand * Math.PI
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const a = t * turns * Math.PI * 2 + phase + offset
      const x = cx + Math.cos(a) * radius * scale
      const y = cy - length / 2 + t * length
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = illumColor(0, 212, 170, alpha * 0.7)
    ctx.lineWidth = 1.5 * scale
    ctx.stroke()

    // Sugar-phosphate backbone nodes
    for (let i = 0; i <= steps; i += basePairEvery) {
      const t = i / steps
      const a = t * turns * Math.PI * 2 + phase + offset
      const x = cx + Math.cos(a) * radius * scale
      const y = cy - length / 2 + t * length
      ctx.beginPath()
      ctx.arc(x, y, 2 * scale, 0, Math.PI * 2)
      ctx.fillStyle = illumColor(170, 102, 255, alpha * 0.5)
      ctx.fill()
    }
  }

  // Base pairs (rungs)
  for (let i = 0; i <= steps; i += basePairEvery) {
    const t = i / steps
    const a1 = t * turns * Math.PI * 2 + phase
    const x1 = cx + Math.cos(a1) * radius * scale
    const y1 = cy - length / 2 + t * length
    const x2 = cx + Math.cos(a1 + Math.PI) * radius * scale
    const depth = Math.sin(a1)

    if (depth > -0.3) {
      const bpType = (i / basePairEvery) % 2
      const colors = bpColors[bpType]
      const midX = (x1 + x2) / 2

      ctx.beginPath()
      ctx.moveTo(x1, y1); ctx.lineTo(midX, y1)
      ctx.strokeStyle = illumColor(colors[0][0], colors[0][1], colors[0][2],
        alpha * 0.5 * (0.5 + depth * 0.5))
      ctx.lineWidth = 1.2 * scale
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(midX, y1); ctx.lineTo(x2, y1)
      ctx.strokeStyle = illumColor(colors[1][0], colors[1][1], colors[1][2],
        alpha * 0.5 * (0.5 + depth * 0.5))
      ctx.lineWidth = 1.2 * scale
      ctx.stroke()

      // Hydrogen bonds (dots)
      const numBonds = bpType === 0 ? 2 : 3
      for (let b = 0; b < numBonds; b++) {
        const bx = midX + (b - (numBonds - 1) / 2) * 3 * scale
        ctx.beginPath()
        ctx.arc(bx, y1, 0.8 * scale, 0, Math.PI * 2)
        ctx.fillStyle = illumColor(232, 232, 240, alpha * 0.4 * (0.5 + depth * 0.5))
        ctx.fill()
      }
    }
  }
}

// ── Cytoskeleton microtubules ────────────────────────────────────────
function drawCytoskeleton(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number, count: number, alpha: number,
) {
  const t = state.time
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + t * 0.02
    const len = radius * (0.5 + 0.4 * Math.sin(i * 2.7 + t * 0.1))
    const endX = cx + Math.cos(angle) * len
    const endY = cy + Math.sin(angle) * len
    const startX = cx + Math.cos(angle) * radius * 0.15
    const startY = cy + Math.sin(angle) * radius * 0.15

    ctx.beginPath()
    ctx.moveTo(startX, startY)
    const cpX = cx + Math.cos(angle + 0.2) * len * 0.6
    const cpY = cy + Math.sin(angle + 0.2) * len * 0.6
    ctx.quadraticCurveTo(cpX, cpY, endX, endY)
    ctx.strokeStyle = illumColor(0, 212, 170, alpha * (0.08 + 0.04 * Math.sin(t * 0.5 + i)))
    ctx.lineWidth = 1
    ctx.stroke()

    // Tubulin subunits
    for (let j = 0; j < 4; j++) {
      const ft = (j + 1) / 5
      const fx = lerp(startX, endX, ft)
      const fy = lerp(startY, endY, ft)
      ctx.beginPath()
      ctx.arc(fx, fy, 1, 0, Math.PI * 2)
      ctx.fillStyle = illumColor(0, 212, 170, alpha * 0.1)
      ctx.fill()
    }
  }
}

// ── Phospholipid bilayer texture ─────────────────────────────────────
function drawPhospholipidBilayer(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  baseR: number, alpha: number,
) {
  const t = state.time
  const lipidCount = 48
  for (let i = 0; i < lipidCount; i++) {
    const angle = (i / lipidCount) * Math.PI * 2
    const deform = membraneDeform(angle, t)
    const px = cx + Math.cos(angle) * baseR * deform
    const py = cy + Math.sin(angle) * baseR * deform
    const normalX = Math.cos(angle)
    const normalY = Math.sin(angle)

    // Outer head
    ctx.beginPath()
    ctx.arc(px + normalX * 3, py + normalY * 3, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(0, 212, 170, alpha * 0.3)
    ctx.fill()

    // Inner head
    ctx.beginPath()
    ctx.arc(px - normalX * 3, py - normalY * 3, 2.5, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(0, 212, 170, alpha * 0.3)
    ctx.fill()

    // Fatty acid tails (two wavy lines between heads)
    for (let tail = -1; tail <= 1; tail += 2) {
      ctx.beginPath()
      ctx.moveTo(px + normalX, py + normalY)
      const perpX = -normalY * tail * 1.5
      const perpY = normalX * tail * 1.5
      ctx.quadraticCurveTo(
        px + perpX + Math.sin(t + i + tail) * 0.5,
        py + perpY + Math.cos(t + i + tail) * 0.5,
        px - normalX, py - normalY,
      )
      ctx.strokeStyle = illumColor(196, 164, 74, alpha * 0.15)
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
  }
}

// ── Nuclear pores ────────────────────────────────────────────────────
function drawNuclearPores(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  radius: number, count: number, alpha: number,
) {
  const t = state.time
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + t * 0.03
    const px = cx + Math.cos(angle) * radius
    const py = cy + Math.sin(angle) * radius

    // Pore complex (octagonal)
    ctx.beginPath()
    for (let j = 0; j < 8; j++) {
      const pa = (j / 8) * Math.PI * 2
      const ppx = px + Math.cos(pa) * 4
      const ppy = py + Math.sin(pa) * 4
      if (j === 0) ctx.moveTo(ppx, ppy); else ctx.lineTo(ppx, ppy)
    }
    ctx.closePath()
    ctx.strokeStyle = illumColor(0, 212, 170, alpha * 0.3)
    ctx.lineWidth = 0.7
    ctx.stroke()

    // Central transport channel
    ctx.beginPath()
    ctx.arc(px, py, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(0, 212, 170, alpha * 0.2)
    ctx.fill()
  }
}

// ═════════════════════════════════════════════════════════════════════
//  MAIN DRAW FUNCTION
// ═════════════════════════════════════════════════════════════════════

export function drawLevel0(ctx: CanvasRenderingContext2D, alpha: number): void {
  if (alpha <= 0) return

  // Lazy-init particles
  if (!particles) particles = initParticles()

  const { width: W, height: H, cx: CX, cy: CY, time: t, mouseX, mouseY } = state
  const minDim = Math.min(W, H)

  ctx.globalAlpha = alpha

  // ── Background ─────────────────────────────────────────────────────
  ctx.fillStyle = state.lightMode ? 'rgb(244,241,235)' : illumColor(8, 12, 22, 1)
  ctx.fillRect(0, 0, W, H)

  // ── Medium particles ───────────────────────────────────────────────
  // Culture medium is alive with drifting debris, each reacting to cursor
  const particleColors: [number, number, number][] = [
    [0, 212, 170],   // cyan-teal (dominant)
    [68, 136, 255],   // blue accent
    [170, 102, 255],  // purple accent
  ]

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]

    // Random Brownian jitter (no two frames identical)
    p.vx += rand(-0.00005, 0.00005)
    p.vy += rand(-0.00005, 0.00005)

    // Cursor interaction
    const mf = applyMouseForce(p.x * W, p.y * H, p.vx, p.vy, mouseX, mouseY)
    p.vx = mf.vx
    p.vy = mf.vy

    // Drag
    p.vx *= 0.99
    p.vy *= 0.99

    // Integrate
    p.x += p.vx
    p.y += p.vy

    // Wrap around edges
    if (p.x < -0.05) p.x = 1.05
    if (p.x > 1.05) p.x = -0.05
    if (p.y < -0.05) p.y = 1.05
    if (p.y > 1.05) p.y = -0.05

    const flicker = 0.7 + 0.3 * Math.sin(t * 0.5 + p.phase)
    const c = particleColors[p.hue]
    ctx.beginPath()
    ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(c[0], c[1], c[2], p.opacity * flicker)
    ctx.fill()
  }

  // ── Main cell ──────────────────────────────────────────────────────
  const baseR = 0.22 * minDim
  cellPulsePhase += 0.015
  const pulse = 1 + 0.025 * Math.sin(cellPulsePhase)
  const r = baseR * pulse

  // FBM-deformed membrane (3 octaves for organic irregularity)
  ctx.beginPath()
  const segments = 80
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const deform = membraneDeform(angle, t)
    const px = CX + Math.cos(angle) * r * deform
    const py = CY + Math.sin(angle) * r * deform
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  }
  ctx.closePath()

  // Cell body gradient (off-center for 3D depth)
  const cellGrad = ctx.createRadialGradient(
    CX - r * 0.2, CY - r * 0.2, 0,
    CX, CY, r * 1.1,
  )
  cellGrad.addColorStop(0, illumColor(20, 60, 55, 0.35))
  cellGrad.addColorStop(0.5, illumColor(10, 45, 42, 0.25))
  cellGrad.addColorStop(1, illumColor(5, 30, 28, 0.15))
  ctx.fillStyle = cellGrad
  ctx.fill()

  // Membrane stroke (inner glow + outer line)
  ctx.strokeStyle = illumColor(0, 212, 170, 0.6)
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.strokeStyle = illumColor(0, 212, 170, 0.12)
  ctx.lineWidth = 10
  ctx.stroke()

  // ── Cytoskeleton filaments ─────────────────────────────────────────
  drawCytoskeleton(ctx, CX, CY, r, 20, alpha)

  // ── Phospholipid bilayer ───────────────────────────────────────────
  drawPhospholipidBilayer(ctx, CX, CY, r, alpha)

  // ── Small organelle hints floating in cytoplasm ────────────────────
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2 + t * 0.05 + 0.5
    const ox = CX + Math.cos(ang) * r * 0.55
    const oy = CY + Math.sin(ang) * r * 0.55
    ctx.beginPath()
    ctx.ellipse(ox, oy, 12, 6, ang, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(0, 180, 140, 0.15)
    ctx.fill()
    ctx.strokeStyle = illumColor(0, 212, 170, 0.25)
    ctx.lineWidth = 0.8
    ctx.stroke()
    // Mini cristae
    for (let c = -1; c <= 1; c++) {
      const mcx = ox + Math.cos(ang) * c * 4
      const mcy = oy + Math.sin(ang) * c * 4
      ctx.beginPath()
      ctx.moveTo(mcx - 3, mcy - 2)
      ctx.bezierCurveTo(mcx - 1, mcy + 2, mcx + 1, mcy + 2, mcx + 3, mcy - 2)
      ctx.strokeStyle = illumColor(255, 100, 130, 0.15)
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
  }

  // ── Nucleus ────────────────────────────────────────────────────────
  const nR = 0.045 * minDim * pulse

  // Subtle breathing glow around nucleus
  const glowPulse = 0.5 + 0.5 * Math.sin(t * 0.4)
  const nucleusGlow = ctx.createRadialGradient(CX, CY, nR * 0.8, CX, CY, nR * 2.2)
  nucleusGlow.addColorStop(0, illumColor(0, 212, 170, 0.08 * glowPulse))
  nucleusGlow.addColorStop(0.5, illumColor(0, 212, 170, 0.04 * glowPulse))
  nucleusGlow.addColorStop(1, illumColor(0, 212, 170, 0))
  ctx.beginPath()
  ctx.arc(CX, CY, nR * 2.2, 0, Math.PI * 2)
  ctx.fillStyle = nucleusGlow
  ctx.fill()

  // Nucleus body
  const nucGrad = ctx.createRadialGradient(CX + 5, CY - 5, 0, CX, CY, nR)
  nucGrad.addColorStop(0, illumColor(40, 90, 85, 0.6))
  nucGrad.addColorStop(0.7, illumColor(20, 60, 55, 0.4))
  nucGrad.addColorStop(1, illumColor(10, 40, 38, 0.2))
  ctx.beginPath()
  ctx.arc(CX, CY, nR, 0, Math.PI * 2)
  ctx.fillStyle = nucGrad
  ctx.fill()

  // Nuclear pores
  drawNuclearPores(ctx, CX, CY, nR, 8, alpha)

  // Nuclear envelope stroke
  ctx.strokeStyle = illumColor(0, 212, 170, 0.4)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(CX, CY, nR, 0, Math.PI * 2)
  ctx.stroke()

  // DNA double helix (clipped to nucleus)
  ctx.save()
  ctx.beginPath()
  ctx.arc(CX, CY, nR - 2, 0, Math.PI * 2)
  ctx.clip()
  drawDNAHelix(ctx, CX, CY, nR * 1.6, nR * 0.4, 3, t * 0.3, alpha * 0.8, 0.7)
  drawDNAHelix(ctx, CX - nR * 0.3, CY + nR * 0.1, nR * 1.2, nR * 0.25, 2, t * 0.2 + 1, alpha * 0.4, 0.5)
  ctx.restore()

  // Nucleolus (dense body inside nucleus)
  const nuclR = nR * 0.25
  const nuclOx = CX + nR * 0.15
  const nuclOy = CY - nR * 0.1
  const nuclGrad = ctx.createRadialGradient(nuclOx, nuclOy, 0, nuclOx, nuclOy, nuclR)
  nuclGrad.addColorStop(0, illumColor(60, 120, 110, 0.5))
  nuclGrad.addColorStop(1, illumColor(30, 70, 65, 0.2))
  ctx.beginPath()
  ctx.arc(nuclOx, nuclOy, nuclR, 0, Math.PI * 2)
  ctx.fillStyle = nuclGrad
  ctx.fill()

  // ── Name + tagline ─────────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const titleSize = clamp(minDim * 0.08, 40, 96)
  ctx.font = `700 ${titleSize}px "Space Grotesk", sans-serif`
  ctx.fillStyle = illumColor(232, 232, 240, 0.95)
  ctx.shadowColor = 'rgba(0,212,170,0.3)'
  ctx.shadowBlur = 40
  ctx.fillText('RAUL ZHOU', CX, CY - minDim * 0.32)
  ctx.shadowBlur = 0

  const tagSize = clamp(minDim * 0.02, 13, 22)
  ctx.font = `400 ${tagSize}px "JetBrains Mono", monospace`
  ctx.fillStyle = illumColor(0, 212, 170, 0.8)
  ctx.letterSpacing = '0.08em'
  ctx.fillText('One engineer. Production systems. AI-native.', CX, CY - minDim * 0.265)

  ctx.globalAlpha = 1
}
