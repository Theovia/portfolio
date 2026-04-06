/**
 * Level 1: Organelle View (10x magnification)
 *
 * Five organelles representing Raul's real production systems, laid out
 * organically inside a large cell boundary. Each has unique biological
 * internals: DNA helix in nucleus, cristae in mitochondria, ribosome
 * subunits, ER cisternae channels, golgi cisternae stacks + vesicles.
 * Hover detection returns the Project data for the detail panel.
 */

import { state } from '../engine/state'
import { lerp, clamp, rand, dist, fbm, applyMouseForce } from '../utils/math'
import { PROJECTS, type Project } from '../content/projects'

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

// ── Organelle layout definition ──────────────────────────────────────
// Positions are in normalized viewport coordinates (0-1), slightly
// offset from grid alignment for organic feel.
interface OrganelleLayout {
  id: string
  x: number; y: number  // normalized position
  radius: number         // normalized radius (fraction of minDim)
  label: string
  sublabel: string
  color: [number, number, number]
  project: Project
}

function getOrganelleLayouts(): OrganelleLayout[] {
  // Map each project to its organelle layout
  const farmacia = PROJECTS.find(p => p.id === 'farmacia-erp')!
  const eigen = PROJECTS.find(p => p.id === 'eigen-medical')!
  const openclaw = PROJECTS.find(p => p.id === 'openclaw')!
  const leadforge = PROJECTS.find(p => p.id === 'leadforge')!
  const method = PROJECTS.find(p => p.id === 'the-method')!

  return [
    {
      id: 'nucleus', x: 0.50, y: 0.44,
      radius: 0.10,
      label: 'NUCLEUS', sublabel: farmacia.oneLiner,
      color: farmacia.color as [number, number, number],
      project: farmacia,
    },
    {
      id: 'mitochondria', x: 0.73, y: 0.37,
      radius: 0.065,
      label: 'MITOCHONDRIA', sublabel: eigen.oneLiner,
      color: eigen.color as [number, number, number],
      project: eigen,
    },
    {
      id: 'ribosome', x: 0.30, y: 0.36,
      radius: 0.052,
      label: 'RIBOSOMES', sublabel: openclaw.oneLiner,
      color: openclaw.color as [number, number, number],
      project: openclaw,
    },
    {
      id: 'er', x: 0.29, y: 0.61,
      radius: 0.068,
      label: 'ENDOPLASMIC\nRETICULUM', sublabel: leadforge.oneLiner,
      color: leadforge.color as [number, number, number],
      project: leadforge,
    },
    {
      id: 'golgi', x: 0.69, y: 0.63,
      radius: 0.058,
      label: 'GOLGI\nAPPARATUS', sublabel: method.oneLiner,
      color: method.color as [number, number, number],
      project: method,
    },
  ]
}

// ── Cytoplasm particle type ──────────────────────────────────────────
interface CytoParticle {
  x: number; y: number
  r: number
  vx: number; vy: number
  opacity: number
  phase: number
}

// ── Module state (lazy init) ─────────────────────────────────────────
let layouts: OrganelleLayout[] | null = null
let cytoParticles: CytoParticle[] | null = null
let _hoveredOrganelle: Project | null = null

function initCytoParticles(): CytoParticle[] {
  const count = state.qualityTier === 'low' ? 25
    : state.qualityTier === 'medium' ? 40 : 60
  const arr: CytoParticle[] = []
  for (let i = 0; i < count; i++) {
    arr.push({
      x: rand(0.1, 0.9), y: rand(0.1, 0.9),
      r: rand(1, 3),
      vx: rand(-0.0003, 0.0003), vy: rand(-0.0003, 0.0003),
      opacity: rand(0.05, 0.2),
      phase: rand(0, Math.PI * 2),
    })
  }
  return arr
}

// ── DNA double helix (reused for nucleus) ────────────────────────────
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
    [[0, 212, 170], [68, 255, 136]],
    [[196, 164, 74], [255, 68, 102]],
  ]

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

    ctx.beginPath()
    ctx.arc(px, py, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(0, 212, 170, alpha * 0.2)
    ctx.fill()
  }
}

// ── Mitochondrial cristae ────────────────────────────────────────────
function drawCristae(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  rx: number, ry: number,
  rotation: number, alpha: number,
) {
  const t = state.time
  const cristaCount = 7
  for (let i = 0; i < cristaCount; i++) {
    const frac = (i + 0.5) / cristaCount
    const localX = (frac - 0.5) * rx * 2.2
    const baseY = ry * 0.5
    const foldDepth = ry * (0.3 + 0.15 * Math.sin(i * 1.3 + t * 0.3))

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rotation)

    // Top fold
    ctx.beginPath()
    ctx.moveTo(localX - 8, -baseY)
    ctx.bezierCurveTo(
      localX - 4, -baseY + foldDepth,
      localX + 4, -baseY + foldDepth,
      localX + 8, -baseY,
    )
    ctx.strokeStyle = illumColor(255, 68, 102, alpha * 0.25)
    ctx.lineWidth = 1
    ctx.stroke()

    // Bottom fold (mirror)
    ctx.beginPath()
    ctx.moveTo(localX - 8, baseY)
    ctx.bezierCurveTo(
      localX - 4, baseY - foldDepth,
      localX + 4, baseY - foldDepth,
      localX + 8, baseY,
    )
    ctx.strokeStyle = illumColor(255, 68, 102, alpha * 0.2)
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()
  }
}

// ── Organelle internal drawing ───────────────────────────────────────

function drawNucleusInternals(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number,
  drawR: number, cr: number, cg: number, cb: number,
  isHov: boolean,
) {
  const t = state.time

  // DNA double helix (clipped to organelle boundary)
  ctx.save()
  ctx.beginPath()
  ctx.arc(ox, oy, drawR * 0.95, 0, Math.PI * 2)
  ctx.clip()
  drawDNAHelix(ctx, ox, oy, drawR * 1.8, drawR * 0.5, 4, t * 0.2,
    isHov ? 0.7 : 0.4, 0.8)
  drawDNAHelix(ctx, ox - drawR * 0.3, oy + drawR * 0.15, drawR * 1.4, drawR * 0.3,
    3, t * 0.15 + 2, isHov ? 0.5 : 0.25, 0.6)
  ctx.restore()

  // Nuclear pores
  drawNuclearPores(ctx, ox, oy, drawR, 12, isHov ? 0.7 : 0.4)

  // Nucleolus
  const nuclR = drawR * 0.22
  const nlx = ox + drawR * 0.2
  const nly = oy - drawR * 0.15
  const nlGrad = ctx.createRadialGradient(nlx, nly, 0, nlx, nly, nuclR)
  nlGrad.addColorStop(0, illumColor(cr, cg, cb, 0.6))
  nlGrad.addColorStop(1, illumColor(cr, cg, cb, 0.15))
  ctx.beginPath()
  ctx.arc(nlx, nly, nuclR, 0, Math.PI * 2)
  ctx.fillStyle = nlGrad
  ctx.fill()
}

function drawMitochondriaInternals(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number,
  drawR: number, cr: number, cg: number, cb: number,
  isHov: boolean,
) {
  const t = state.time
  const rotation = 0.3 + Math.sin(t * 0.3) * 0.1

  // Cristae folds
  drawCristae(ctx, ox, oy, drawR * 1.5, drawR * 0.7, rotation, isHov ? 0.8 : 0.5)

  // Matrix granules
  for (let mg = 0; mg < 6; mg++) {
    const mga = (mg / 6) * Math.PI * 2 + t * 0.15
    const mgr = drawR * 0.3
    ctx.beginPath()
    ctx.arc(ox + Math.cos(mga) * mgr, oy + Math.sin(mga) * mgr * 0.4, 2, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(cr, cg, cb, 0.3)
    ctx.fill()
  }

  // Inner membrane outline
  ctx.beginPath()
  ctx.ellipse(ox, oy, drawR * 1.3, drawR * 0.55, rotation, 0, Math.PI * 2)
  ctx.strokeStyle = illumColor(cr, cg, cb, 0.15)
  ctx.lineWidth = 0.8
  ctx.stroke()
}

function drawRibosomeInternals(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number,
  drawR: number, cr: number, cg: number, cb: number,
  _isHov: boolean,
) {
  const t = state.time

  // Ribosome subunit pairs arranged in a spiral
  for (let ri = 0; ri < 10; ri++) {
    const ra = (ri / 10) * Math.PI * 2 + t * 0.2
    const rd = drawR * (0.3 + 0.35 * ((ri % 3) / 3))
    const rbx = ox + Math.cos(ra) * rd
    const rby = oy + Math.sin(ra) * rd

    // Large subunit
    ctx.beginPath()
    ctx.arc(rbx, rby, 5, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(cr, cg, cb, 0.5)
    ctx.fill()

    // Small subunit (offset)
    ctx.beginPath()
    ctx.arc(rbx + 3, rby - 2, 3.5, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(cr, cg, cb, 0.35)
    ctx.fill()

    // mRNA thread connecting ribosomes
    if (ri < 9) {
      const nextA = ((ri + 1) / 10) * Math.PI * 2 + t * 0.2
      const nextD = drawR * (0.3 + 0.35 * (((ri + 1) % 3) / 3))
      ctx.beginPath()
      ctx.moveTo(rbx, rby)
      ctx.lineTo(ox + Math.cos(nextA) * nextD, oy + Math.sin(nextA) * nextD)
      ctx.strokeStyle = illumColor(cr, cg, cb, 0.12)
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
  }
}

function drawERInternals(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number,
  drawR: number, cr: number, cg: number, cb: number,
  _isHov: boolean,
) {
  const t = state.time

  // Membrane-bound ribosomes (rough ER dots)
  for (let ri = 0; ri < 20; ri++) {
    const erAngle = (ri / 20) * Math.PI * 2
    const erR = drawR * (0.85 + 0.1 * Math.sin(erAngle * 6 + t))
    const erx = ox + Math.cos(erAngle) * erR
    const ery = oy + Math.sin(erAngle) * erR * 0.8
    ctx.beginPath()
    ctx.arc(erx, ery, 2, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(68, 136, 255, 0.4)
    ctx.fill()
  }

  // Internal cisternae channels (wavy parallel lines)
  for (let ch = 0; ch < 4; ch++) {
    const chy = oy + (ch - 1.5) * drawR * 0.35
    ctx.beginPath()
    ctx.moveTo(ox - drawR * 0.7, chy)
    for (let cp = 0; cp < 8; cp++) {
      const cpx = ox - drawR * 0.7 + (cp / 7) * drawR * 1.4
      const cpy = chy + Math.sin(cp * 1.5 + t * 0.5 + ch) * 5
      ctx.lineTo(cpx, cpy)
    }
    ctx.strokeStyle = illumColor(cr, cg, cb, 0.15)
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

function drawGolgiInternals(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number,
  drawR: number, cr: number, cg: number, cb: number,
  _isHov: boolean,
) {
  const t = state.time

  // Cisternae stacks (curved parallel membranes)
  for (let j = -3; j <= 3; j++) {
    const cy2 = oy + j * drawR * 0.18
    const cWidth = drawR * (1.1 - Math.abs(j) * 0.08)
    ctx.beginPath()
    ctx.moveTo(ox - cWidth, cy2)
    ctx.bezierCurveTo(
      ox - cWidth * 0.3, cy2 + Math.sin(t + j) * 4,
      ox + cWidth * 0.3, cy2 - Math.sin(t + j) * 4,
      ox + cWidth, cy2,
    )
    ctx.strokeStyle = illumColor(cr, cg, cb, 0.25 - Math.abs(j) * 0.02)
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Transport vesicles budding off edges
  for (let v = 0; v < 5; v++) {
    const vAngle = (v / 5) * Math.PI * 0.8 + Math.PI * 0.6 + t * 0.1
    const vDist = drawR * (1.2 + v * 0.15 + Math.sin(t * 0.5 + v) * 0.1)
    const vx = ox + Math.cos(vAngle) * vDist
    const vy = oy + Math.sin(vAngle) * vDist * 0.5
    ctx.beginPath()
    ctx.arc(vx, vy, 4 - v * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(cr, cg, cb, 0.3 - v * 0.04)
    ctx.fill()
    ctx.strokeStyle = illumColor(cr, cg, cb, 0.2)
    ctx.lineWidth = 0.5
    ctx.stroke()
  }
}

// ═════════════════════════════════════════════════════════════════════
//  PUBLIC API
// ═════════════════════════════════════════════════════════════════════

/** Returns the project being hovered, or null */
export function getHoveredOrganelle(): Project | null {
  return _hoveredOrganelle
}

export function drawLevel1(ctx: CanvasRenderingContext2D, alpha: number): void {
  if (alpha <= 0) return

  // Lazy init
  if (!layouts) layouts = getOrganelleLayouts()
  if (!cytoParticles) cytoParticles = initCytoParticles()

  const { width: W, height: H, cx: CX, cy: CY, time: t, mouseX, mouseY } = state
  const minDim = Math.min(W, H)

  ctx.globalAlpha = alpha

  // ── Background (radial gradient for depth) ─────────────────────────
  const bgGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, minDim * 0.6)
  if (state.lightMode) {
    bgGrad.addColorStop(0, 'rgb(250,248,244)')
    bgGrad.addColorStop(0.7, 'rgb(244,241,235)')
    bgGrad.addColorStop(1, 'rgb(235,230,220)')
  } else {
    bgGrad.addColorStop(0, illumColor(12, 20, 28, 1))
    bgGrad.addColorStop(0.7, illumColor(8, 14, 22, 1))
    bgGrad.addColorStop(1, illumColor(5, 8, 16, 1))
  }
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // ── Outer cell membrane (fbm-deformed) ─────────────────────────────
  ctx.beginPath()
  const memSegs = 120
  for (let i = 0; i <= memSegs; i++) {
    const angle = (i / memSegs) * Math.PI * 2
    // Use fbm for organic deformation instead of simple sine wobble
    const nx = Math.cos(angle) * 2.0 + t * 0.05
    const ny = Math.sin(angle) * 2.0 + t * 0.03
    const deform = 1 + (fbm(nx, ny, 3) - 0.45) * 0.06
    const px = CX + Math.cos(angle) * minDim * 0.55 * deform
    const py = CY + Math.sin(angle) * minDim * 0.55 * deform
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.strokeStyle = illumColor(0, 212, 170, 0.15)
  ctx.lineWidth = 20
  ctx.stroke()
  ctx.strokeStyle = illumColor(0, 212, 170, 0.3)
  ctx.lineWidth = 2
  ctx.stroke()

  // ── Cytoplasm particles ────────────────────────────────────────────
  for (let i = 0; i < cytoParticles.length; i++) {
    const p = cytoParticles[i]
    p.vx += rand(-0.00003, 0.00003)
    p.vy += rand(-0.00003, 0.00003)
    const mf = applyMouseForce(p.x * W, p.y * H, p.vx, p.vy, mouseX, mouseY)
    p.vx = mf.vx
    p.vy = mf.vy
    p.vx *= 0.995
    p.vy *= 0.995
    p.x += p.vx
    p.y += p.vy
    if (p.x < 0.05) p.x = 0.95
    if (p.x > 0.95) p.x = 0.05
    if (p.y < 0.05) p.y = 0.95
    if (p.y > 0.95) p.y = 0.05

    ctx.beginPath()
    ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(0, 212, 170, p.opacity * (0.7 + 0.3 * Math.sin(t + p.phase)))
    ctx.fill()
  }

  // ── ER network (curved lines connecting organelles) ────────────────
  ctx.strokeStyle = illumColor(170, 102, 255, 0.06)
  ctx.lineWidth = 2
  for (let i = 0; i < 12; i++) {
    const sa = (i / 12) * Math.PI * 2 + t * 0.02
    const sx = CX + Math.cos(sa) * minDim * 0.15
    const sy = CY + Math.sin(sa) * minDim * 0.15
    const ea = sa + 1.5
    const ex = CX + Math.cos(ea) * minDim * 0.4
    const ey = CY + Math.sin(ea - 0.3) * minDim * 0.35
    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.bezierCurveTo(
      sx + 30 * Math.sin(i), sy - 20 * Math.cos(i),
      ex - 30 * Math.cos(i), ey + 20 * Math.sin(i),
      ex, ey,
    )
    ctx.stroke()
  }

  // ── Organelles ─────────────────────────────────────────────────────
  _hoveredOrganelle = null

  for (const org of layouts) {
    const ox = org.x * W
    const oy = org.y * H
    const or2 = org.radius * minDim
    const [cr, cg, cb] = org.color

    // Hover detection
    const d = dist(mouseX, mouseY, ox, oy)
    const isHov = d < or2 * 1.3
    if (isHov) _hoveredOrganelle = org.project
    const drawR = or2 * (isHov ? 1.12 : 1)

    // ── Outer glow (expands on hover) ────────────────────────────────
    const glowR = drawR * (isHov ? 2.4 : 2.0)
    const glow = ctx.createRadialGradient(ox, oy, drawR * 0.5, ox, oy, glowR)
    glow.addColorStop(0, illumColor(cr, cg, cb, isHov ? 0.4 : 0.15))
    glow.addColorStop(1, illumColor(cr, cg, cb, 0))
    ctx.beginPath()
    ctx.arc(ox, oy, glowR, 0, Math.PI * 2)
    ctx.fillStyle = glow
    ctx.fill()

    // ── Organelle shape ──────────────────────────────────────────────
    ctx.beginPath()
    if (org.id === 'mitochondria') {
      // Elliptical with slight breathing rotation
      ctx.ellipse(ox, oy, drawR * 1.5, drawR * 0.7,
        0.3 + Math.sin(t * 0.3) * 0.1, 0, Math.PI * 2)
    } else if (org.id === 'er') {
      // Irregular amoeboid shape
      for (let si = 0; si <= 40; si++) {
        const a = (si / 40) * Math.PI * 2
        const w = 1 + 0.15 * Math.sin(a * 6 + t)
        const spx = ox + Math.cos(a) * drawR * w
        const spy = oy + Math.sin(a) * drawR * w * 0.8
        if (si === 0) ctx.moveTo(spx, spy); else ctx.lineTo(spx, spy)
      }
      ctx.closePath()
    } else if (org.id === 'golgi') {
      // Wide and flat, stacked appearance
      for (let si = 0; si <= 40; si++) {
        const a = (si / 40) * Math.PI * 2
        const w = 1 + 0.1 * Math.sin(a * 4 + t * 0.5)
        const spx = ox + Math.cos(a) * drawR * 1.3 * w
        const spy = oy + Math.sin(a) * drawR * 0.7 * w
        if (si === 0) ctx.moveTo(spx, spy); else ctx.lineTo(spx, spy)
      }
      ctx.closePath()
    } else {
      // Circle (nucleus, ribosome)
      ctx.arc(ox, oy, drawR, 0, Math.PI * 2)
    }

    // Body gradient (off-center light source for depth)
    const bodyGrad = ctx.createRadialGradient(
      ox - drawR * 0.2, oy - drawR * 0.2, 0,
      ox, oy, drawR * 1.2,
    )
    bodyGrad.addColorStop(0, illumColor(cr, cg, cb, 0.4))
    bodyGrad.addColorStop(0.6, illumColor(cr, cg, cb, 0.2))
    bodyGrad.addColorStop(1, illumColor(cr, cg, cb, 0.05))
    ctx.fillStyle = bodyGrad
    ctx.fill()
    ctx.strokeStyle = illumColor(cr, cg, cb, isHov ? 0.8 : 0.4)
    ctx.lineWidth = isHov ? 2 : 1
    ctx.stroke()

    // ── Organelle-specific internals ─────────────────────────────────
    if (org.id === 'nucleus') {
      drawNucleusInternals(ctx, ox, oy, drawR, cr, cg, cb, isHov)
    } else if (org.id === 'mitochondria') {
      drawMitochondriaInternals(ctx, ox, oy, drawR, cr, cg, cb, isHov)
    } else if (org.id === 'ribosome') {
      drawRibosomeInternals(ctx, ox, oy, drawR, cr, cg, cb, isHov)
    } else if (org.id === 'er') {
      drawERInternals(ctx, ox, oy, drawR, cr, cg, cb, isHov)
    } else if (org.id === 'golgi') {
      drawGolgiInternals(ctx, ox, oy, drawR, cr, cg, cb, isHov)
    }

    // ── Label + project name ─────────────────────────────────────────
    const labelAlpha = isHov ? 1 : 0.6
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Organelle type label
    const labelFont = isHov ? '600 13' : '600 11'
    ctx.font = `${labelFont}px "JetBrains Mono", monospace`
    ctx.fillStyle = illumColor(cr, cg, cb, labelAlpha)
    const lines = org.label.split('\n')
    const labelY = oy + drawR + 18
    for (let li = 0; li < lines.length; li++) {
      ctx.fillText(lines[li], ox, labelY + li * 15)
    }

    // Project name as sublabel
    ctx.font = '400 9px "Inter", sans-serif'
    ctx.fillStyle = illumColor(232, 232, 240, labelAlpha * 0.6)

    // Truncate sublabel to fit (max ~40 chars for readability)
    let sublabel = org.project.name
    if (org.project.keyMetric) {
      sublabel = org.project.name + ' // ' + org.project.keyMetric
    }
    // Hard limit for canvas text
    if (sublabel.length > 50) sublabel = sublabel.slice(0, 47) + '...'

    ctx.fillText(sublabel, ox, labelY + lines.length * 15 + 4)
  }

  ctx.globalAlpha = 1
}
