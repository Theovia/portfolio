// ═══════════════════════════════════════════════════════════════════
//  LEVEL 3: ATOMIC DETAIL — TECHNOLOGY STACK (1000x)
//  Each technology is an atom: nucleus (symbol), electron shells
//  orbiting at different speeds/eccentricities based on electron
//  count. Core technologies are large and central, supporting
//  form a middle ring, specialists at the periphery. Atoms that
//  share projects are linked by faint bonds with travelling
//  electron pairs. Hover magnifies the atom and speeds its orbits.
// ═══════════════════════════════════════════════════════════════════

import { state } from '../engine/state'
import { clamp, dist, lerp } from '../utils/math'
import { TECH_STACK, type TechAtom } from '../content/stack'

// --------------- color helper ---------------

function illumColor(r: number, g: number, b: number, a: number): string {
  if (state.lightMode) {
    const brightness = (r + g + b) / 3
    if (brightness > 200) {
      r = 30; g = 30; b = 50
    } else if (brightness > 5) {
      r = Math.round(r * 0.7)
      g = Math.round(g * 0.7)
      b = Math.round(b * 0.7)
    }
    a = Math.min(a * 1.3, 1)
  }
  let f = state.illumination / 100
  if (state.lightMode) f = Math.max(f, 0.7)
  return `rgba(${Math.round(r * f)},${Math.round(g * f)},${Math.round(b * f)},${a})`
}

// --------------- layout types ---------------

interface AtomLayout {
  atom: TechAtom
  /** Normalised 0-1 position — resolved to pixels each frame */
  nx: number
  ny: number
  /** Base radius of the outermost shell (pixels, computed per frame from minDim) */
  nucleusR: number
  /** Per-atom random phase offset so orbits don't synchronise */
  phaseOffset: number
  /** Per-atom slight eccentricity so orbits aren't perfect circles */
  eccentricity: number
}

// --------------- pre-compute stable layout positions ---------------
// Positions are in normalised viewport coords [0-1].
// We scatter them with intentional asymmetry (NOT a grid, NOT a circle).
// Core atoms cluster in the centre with generous spacing.
// Supporting atoms form a loose middle ring.
// Specialist atoms occupy the outer ring.

const LAYOUT_POSITIONS: { nx: number; ny: number }[] = [
  // Core (6) — scattered across centre
  { nx: 0.38, ny: 0.32 }, // React
  { nx: 0.62, ny: 0.28 }, // TypeScript
  { nx: 0.30, ny: 0.52 }, // Supabase
  { nx: 0.54, ny: 0.50 }, // Claude API
  { nx: 0.72, ny: 0.48 }, // PostgreSQL
  { nx: 0.48, ny: 0.68 }, // Cloudflare

  // Supporting (4) — middle ring, asymmetric
  { nx: 0.18, ny: 0.34 }, // Python
  { nx: 0.82, ny: 0.36 }, // Vite
  { nx: 0.15, ny: 0.68 }, // Tailwind
  { nx: 0.84, ny: 0.62 }, // Deno

  // Specialist (6) — outer ring, scattered
  { nx: 0.22, ny: 0.18 }, // Drizzle
  { nx: 0.78, ny: 0.16 }, // Fuse.js
  { nx: 0.92, ny: 0.80 }, // Resend
  { nx: 0.08, ny: 0.84 }, // TanStack Query
  { nx: 0.64, ny: 0.84 }, // Sentry
  { nx: 0.38, ny: 0.86 }, // PostHog
]

// Build stable layout data once (enriched at module load)
const atomLayouts: AtomLayout[] = TECH_STACK.map((atom, i) => {
  const pos = LAYOUT_POSITIONS[i] || { nx: 0.5, ny: 0.5 }
  return {
    atom,
    nx: pos.nx,
    ny: pos.ny,
    nucleusR: 0, // computed each frame
    phaseOffset: i * 1.37 + (i * i * 0.23), // golden-ratio-ish spread
    eccentricity: 0.15 + (i % 3) * 0.08, // slight variation, never 0
  }
})

// --------------- shared-project bond map ---------------
// Pre-compute which atom pairs share at least one project.

interface Bond {
  a: number // index into atomLayouts
  b: number // index into atomLayouts
}

const bonds: Bond[] = []
{
  for (let i = 0; i < atomLayouts.length; i++) {
    for (let j = i + 1; j < atomLayouts.length; j++) {
      const proI = atomLayouts[i].atom.projects
      const proJ = atomLayouts[j].atom.projects
      const shared = proI.some((p) => proJ.includes(p))
      if (shared) bonds.push({ a: i, b: j })
    }
  }
}

// --------------- hover state ---------------

let _hoveredAtom: TechAtom | null = null

/** Returns the currently hovered TechAtom, or null */
export function getHoveredAtom(): TechAtom | null {
  return _hoveredAtom
}

// --------------- size constants by category ---------------

function nucleusRadius(category: TechAtom['category'], minDim: number): number {
  switch (category) {
    case 'core': return clamp(minDim * 0.028, 18, 28)
    case 'supporting': return clamp(minDim * 0.020, 14, 22)
    case 'specialist': return clamp(minDim * 0.015, 10, 17)
  }
}

function shellSpacing(category: TechAtom['category'], minDim: number): number {
  switch (category) {
    case 'core': return clamp(minDim * 0.038, 24, 36)
    case 'supporting': return clamp(minDim * 0.030, 20, 30)
    case 'specialist': return clamp(minDim * 0.024, 16, 24)
  }
}

/** Distribute electrons across shells (simple Aufbau-ish rule) */
function electronDistribution(electrons: number): number[] {
  const shells: number[] = []
  let remaining = electrons
  // Shell 1: max 2
  shells.push(Math.min(remaining, 2))
  remaining -= shells[0]
  if (remaining <= 0) return shells
  // Shell 2: max 4
  shells.push(Math.min(remaining, 4))
  remaining -= shells[1]
  if (remaining <= 0) return shells
  // Shell 3: the rest
  shells.push(remaining)
  return shells
}

// --------------- main draw function ---------------

/**
 * Draw Level 3 — Atomic Detail (tech stack).
 * @param ctx  Canvas 2D context
 * @param alpha  0-1 opacity for transitions
 */
export function drawLevel3(ctx: CanvasRenderingContext2D, alpha: number): void {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha

  const { width: W, height: H, cx: CX, cy: CY, time, mouseX, mouseY } = state
  const minDim = Math.min(W, H)

  // ── Background ──────────────────────────────────────────────────
  ctx.fillStyle = state.lightMode ? 'rgb(245,242,234)' : illumColor(4, 4, 12, 1)
  ctx.fillRect(0, 0, W, H)

  // Faint concentric ripples (subatomic particle trails)
  drawSubatomicBackground(ctx, CX, CY, W, H, time)

  // ── Title ───────────────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const titleSize = clamp(minDim * 0.022, 12, 22)
  ctx.font = `600 ${titleSize}px "Space Grotesk", sans-serif`
  ctx.fillStyle = illumColor(232, 232, 240, 0.7)
  ctx.fillText('ATOMIC DETAIL', CX, H * 0.06)

  const subSize = clamp(minDim * 0.012, 8, 12)
  ctx.font = `400 ${subSize}px "JetBrains Mono", monospace`
  ctx.fillStyle = illumColor(0, 212, 170, 0.4)
  ctx.fillText('TECHNOLOGY STACK  //  ELECTRON CONFIGURATION', CX, H * 0.06 + 20)

  // ── Resolve per-frame layout positions ──────────────────────────
  // Map normalised coords to pixel space, avoiding edges
  const padX = W * 0.06
  const padY = H * 0.12
  const usableW = W - padX * 2
  const usableH = H - padY * 2

  for (const al of atomLayouts) {
    al.nucleusR = nucleusRadius(al.atom.category, minDim)
  }

  // ── Bonds between atoms sharing projects ────────────────────────
  drawBonds(ctx, atomLayouts, bonds, padX, padY, usableW, usableH, time)

  // ── Atoms ───────────────────────────────────────────────────────
  _hoveredAtom = null

  for (let ai = 0; ai < atomLayouts.length; ai++) {
    const al = atomLayouts[ai]
    const atom = al.atom
    const [cr, cg, cb] = atom.color

    const ax = padX + al.nx * usableW
    const ay = padY + al.ny * usableH
    const nR = al.nucleusR
    const shells = electronDistribution(atom.electrons)
    const sSpace = shellSpacing(atom.category, minDim)

    // Hover detection — check distance against outermost shell
    const maxShellR = shells.length * sSpace + nR * 0.5
    const d = dist(mouseX, mouseY, ax, ay)
    const isHov = d < maxShellR
    if (isHov) _hoveredAtom = atom

    // Scale on hover (smooth lerp target)
    const scale = isHov ? 1.12 : 1.0
    const speedMult = isHov ? 1.8 : 1.0

    // ── Electron shells ──
    for (let s = 0; s < shells.length; s++) {
      const shellR = (s + 1) * sSpace * scale + nR * 0.3
      const eCount = shells[s]

      // Orbit ellipse (slightly eccentric — NOT a perfect circle)
      const ecc = al.eccentricity + s * 0.05
      const tilt = al.phaseOffset + s * 0.4 // each shell tilted differently

      // Draw orbit path
      ctx.beginPath()
      ctx.save()
      ctx.translate(ax, ay)
      ctx.rotate(tilt)
      ctx.scale(1, 1 - ecc) // eccentricity squash
      ctx.arc(0, 0, shellR, 0, Math.PI * 2)
      ctx.restore()
      ctx.strokeStyle = illumColor(cr, cg, cb, isHov ? 0.2 : 0.08)
      ctx.lineWidth = 0.8
      ctx.stroke()

      // Draw electrons on orbit
      // Speed varies by shell index and electron count (more electrons = slower)
      const orbitalSpeed = (0.6 + s * 0.25) * speedMult / (1 + atom.electrons * 0.04)
      const direction = s % 2 === 0 ? 1 : -1

      for (let e = 0; e < eCount; e++) {
        const eAngle = (e / eCount) * Math.PI * 2
          + time * orbitalSpeed * direction
          + al.phaseOffset

        // Map angle onto the eccentric ellipse
        const cosA = Math.cos(eAngle)
        const sinA = Math.sin(eAngle)
        // Rotate by tilt, squash by eccentricity, then back
        const rx = cosA * shellR
        const ry = sinA * shellR * (1 - ecc)
        const ex = ax + rx * Math.cos(tilt) - ry * Math.sin(tilt)
        const ey = ay + rx * Math.sin(tilt) + ry * Math.cos(tilt)

        // Electron glow
        const eGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, 8 * scale)
        eGlow.addColorStop(0, illumColor(cr, cg, cb, isHov ? 0.9 : 0.7))
        eGlow.addColorStop(1, illumColor(cr, cg, cb, 0))
        ctx.beginPath()
        ctx.arc(ex, ey, 8 * scale, 0, Math.PI * 2)
        ctx.fillStyle = eGlow
        ctx.fill()

        // Electron core
        ctx.beginPath()
        ctx.arc(ex, ey, 2.5 * scale, 0, Math.PI * 2)
        ctx.fillStyle = illumColor(cr, cg, cb, 0.9)
        ctx.fill()
      }
    }

    // ── Nucleus ──
    const nucR = nR * scale
    // Outer glow on hover
    if (isHov) {
      const hoverGlow = ctx.createRadialGradient(ax, ay, nucR, ax, ay, nucR * 2.5)
      hoverGlow.addColorStop(0, illumColor(cr, cg, cb, 0.15))
      hoverGlow.addColorStop(1, illumColor(cr, cg, cb, 0))
      ctx.beginPath()
      ctx.arc(ax, ay, nucR * 2.5, 0, Math.PI * 2)
      ctx.fillStyle = hoverGlow
      ctx.fill()
    }

    // Nucleus gradient — slight highlight offset for 3D look
    const nucGrad = ctx.createRadialGradient(
      ax - nucR * 0.18, ay - nucR * 0.18, 0,
      ax, ay, nucR,
    )
    nucGrad.addColorStop(0, illumColor(cr, cg, cb, isHov ? 0.8 : 0.5))
    nucGrad.addColorStop(0.7, illumColor(cr, cg, cb, isHov ? 0.4 : 0.2))
    nucGrad.addColorStop(1, illumColor(cr, cg, cb, 0.05))
    ctx.beginPath()
    ctx.arc(ax, ay, nucR, 0, Math.PI * 2)
    ctx.fillStyle = nucGrad
    ctx.fill()
    ctx.strokeStyle = illumColor(cr, cg, cb, isHov ? 0.6 : 0.3)
    ctx.lineWidth = 1
    ctx.stroke()

    // ── Symbol text inside nucleus ──
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const symSize = clamp(nucR * 0.8, 10, 18)
    ctx.font = `700 ${symSize}px "Space Grotesk", sans-serif`
    ctx.fillStyle = illumColor(232, 232, 240, isHov ? 1 : 0.7)
    ctx.fillText(atom.symbol, ax, ay)

    // ── Name label below atom ──
    const labelY = ay + shells.length * sSpace * scale + nucR * 0.5 + 16
    const nameSize = clamp(minDim * 0.012, 8, 12)
    ctx.font = `400 ${nameSize}px "JetBrains Mono", monospace`
    ctx.fillStyle = illumColor(cr, cg, cb, isHov ? 0.9 : 0.5)
    ctx.fillText(atom.name, ax, labelY)

    // ── Description tooltip on hover ──
    if (isHov) {
      const tooltipY = labelY + 16
      const descSize = clamp(minDim * 0.010, 7, 10)
      ctx.font = `400 ${descSize}px "Inter", sans-serif`
      ctx.fillStyle = illumColor(232, 232, 240, 0.5)

      // Word-wrap the description to ~40 chars per line
      const words = atom.description.split(' ')
      let line = ''
      let lineNum = 0
      const maxLineWidth = clamp(minDim * 0.22, 120, 220)

      for (const word of words) {
        const test = line ? `${line} ${word}` : word
        if (ctx.measureText(test).width > maxLineWidth && line) {
          ctx.fillText(line, ax, tooltipY + lineNum * (descSize + 3))
          line = word
          lineNum++
          if (lineNum >= 3) break // max 3 lines
        } else {
          line = test
        }
      }
      if (line && lineNum < 3) {
        ctx.fillText(line, ax, tooltipY + lineNum * (descSize + 3))
      }
    }
  }

  ctx.restore()
}

// ═══════════════════════════════════════════════════════════════════
//  DRAWING SUB-ROUTINES
// ═══════════════════════════════════════════════════════════════════

/** Faint concentric ripples and particle trails in the background */
function drawSubatomicBackground(
  ctx: CanvasRenderingContext2D,
  CX: number,
  CY: number,
  W: number,
  H: number,
  time: number,
): void {
  // Concentric ripples expanding outward
  const maxR = Math.max(W, H)
  ctx.lineWidth = 0.5
  for (let r = 50; r < maxR; r += 100) {
    const rippleAlpha = 0.02 + 0.008 * Math.sin(time * 0.4 + r * 0.005)
    ctx.strokeStyle = illumColor(0, 212, 170, rippleAlpha)
    ctx.beginPath()
    ctx.arc(CX, CY, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Faint particle trails — tiny dots drifting through space
  // Deterministic positions based on time so they don't flicker
  const trailCount = 30
  for (let i = 0; i < trailCount; i++) {
    const seed = i * 137.508 // golden angle
    const tx = ((seed * 0.618 + time * 0.01 * (1 + (i % 3) * 0.5)) % 1.2 - 0.1) * W
    const ty = ((seed * 0.381 + time * 0.008 * (1 + (i % 2) * 0.3)) % 1.2 - 0.1) * H
    const tr = 0.8 + (i % 4) * 0.3
    const tAlpha = 0.03 + 0.02 * Math.sin(time * 0.6 + seed)
    ctx.beginPath()
    ctx.arc(tx, ty, tr, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(100, 180, 200, tAlpha)
    ctx.fill()
  }
}

/**
 * Draw faint connecting lines between atoms that share projects.
 * A shared electron pair travels along each bond.
 */
function drawBonds(
  ctx: CanvasRenderingContext2D,
  layouts: AtomLayout[],
  bonds: Bond[],
  padX: number,
  padY: number,
  usableW: number,
  usableH: number,
  time: number,
): void {
  for (let bi = 0; bi < bonds.length; bi++) {
    const bond = bonds[bi]
    const la = layouts[bond.a]
    const lb = layouts[bond.b]

    const ax = padX + la.nx * usableW
    const ay = padY + la.ny * usableH
    const bx = padX + lb.nx * usableW
    const by = padY + lb.ny * usableH

    // Bond line
    const bondAlpha = 0.04 + 0.02 * Math.sin(time * 0.5 + bi)
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(bx, by)
    ctx.strokeStyle = illumColor(232, 232, 240, bondAlpha)
    ctx.lineWidth = 1
    ctx.stroke()

    // Shared electron pair travelling along the bond
    const electronT = (Math.sin(time * 0.8 + bi * 1.3) + 1) / 2
    const elX = lerp(ax, bx, electronT)
    const elY = lerp(ay, by, electronT)

    // Electron glow
    const elGlow = ctx.createRadialGradient(elX, elY, 0, elX, elY, 8)
    elGlow.addColorStop(0, illumColor(232, 232, 240, 0.35))
    elGlow.addColorStop(1, illumColor(232, 232, 240, 0))
    ctx.beginPath()
    ctx.arc(elX, elY, 8, 0, Math.PI * 2)
    ctx.fillStyle = elGlow
    ctx.fill()

    // Electron core
    ctx.beginPath()
    ctx.arc(elX, elY, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(232, 232, 240, 0.5)
    ctx.fill()
  }
}
