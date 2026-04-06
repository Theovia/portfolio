// ═══════════════════════════════════════════════════════════════════
//  LEVEL 2: GENOMIC TIMELINE — DNA DOUBLE HELIX (100x)
//  Career milestones encoded as base pairs along a vertical helix.
//  Two backbone strands weave sinusoidally, connected by hydrogen-
//  bonded rungs. Events branch off alternating left/right as gene
//  annotations. The helix rotates slowly, as if being sequenced.
// ═══════════════════════════════════════════════════════════════════

import { state } from '../engine/state'
import { clamp, dist, lerp } from '../utils/math'
import { TIMELINE_EVENTS } from '../content/timeline'

// --------------- color helper ---------------

/** Build an rgba() string adjusted for illumination knob and light mode */
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

// --------------- constants ---------------

// Base pair colour palette — A-T and G-C complementary pairs
const BP_COLORS: [number, number, number][] = [
  [0, 212, 170],   // A  — cyan
  [196, 164, 74],   // T  — gold
  [68, 136, 255],   // G  — blue
  [255, 68, 102],   // C  — red
]
// Complement indices: A<->T, G<->C
const COMP_IDX = [1, 0, 3, 2]

// Nucleotide grid letters
const BASES = ['A', 'T', 'G', 'C'] as const

// --------------- pre-computed helix geometry ---------------

interface HelixPoint {
  x: number
  y: number
  angle: number
  depth: number   // sin of angle — used for pseudo-3D alpha
}

// --------------- main draw function ---------------

/**
 * Draw Level 2 — Genomic Timeline.
 * @param ctx  Canvas 2D context
 * @param alpha  0-1 opacity for transitions between levels
 */
export function drawLevel2(ctx: CanvasRenderingContext2D, alpha: number): void {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha

  const { width: W, height: H, cx: CX, time, mouseX, mouseY } = state
  const minDim = Math.min(W, H)

  // ── Background ──────────────────────────────────────────────────
  ctx.fillStyle = state.lightMode ? 'rgb(248,245,238)' : illumColor(6, 8, 16, 1)
  ctx.fillRect(0, 0, W, H)

  // Subtle nucleotide grid — very low-opacity A/T/G/C characters
  drawNucleotideGrid(ctx, W, H, time)

  // ── Title ───────────────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const titleSize = clamp(minDim * 0.025, 14, 24)
  ctx.font = `600 ${titleSize}px "Space Grotesk", sans-serif`
  ctx.fillStyle = illumColor(232, 232, 240, 0.8)
  ctx.fillText('GENOMIC TIMELINE', CX, H * 0.06)

  const subSize = clamp(minDim * 0.013, 9, 13)
  ctx.font = `400 ${subSize}px "JetBrains Mono", monospace`
  ctx.fillStyle = illumColor(0, 212, 170, 0.5)
  ctx.fillText('DNA DOUBLE HELIX  //  CAREER ENCODED IN BASE PAIRS', CX, H * 0.06 + 22)

  // ── Helix geometry ──────────────────────────────────────────────
  const helixCenterX = CX
  const helixTop = H * 0.14
  const helixBottom = H * 0.78
  const helixHeight = helixBottom - helixTop
  const helixRadius = minDim * 0.12
  const helixTurns = 4
  const helixSteps = 200

  // Build strand points with time-dependent rotation
  const strand1: HelixPoint[] = []
  const strand2: HelixPoint[] = []

  for (let i = 0; i <= helixSteps; i++) {
    const t = i / helixSteps
    const y = helixTop + t * helixHeight
    const angle = t * helixTurns * Math.PI * 2 + time * 0.3
    strand1.push({
      x: helixCenterX + Math.cos(angle) * helixRadius,
      y,
      angle,
      depth: Math.sin(angle),
    })
    strand2.push({
      x: helixCenterX + Math.cos(angle + Math.PI) * helixRadius,
      y,
      angle: angle + Math.PI,
      depth: Math.sin(angle + Math.PI),
    })
  }

  // ── Base pair rungs ─────────────────────────────────────────────
  drawBasePairs(ctx, strand1, strand2, helixSteps, time)

  // ── Backbone strands ────────────────────────────────────────────
  // Draw the further strand first (back), then the closer one (front)
  drawBackboneStrand(ctx, strand2, helixSteps, 0.3, 2.0)
  drawBackboneStrand(ctx, strand1, helixSteps, 0.6, 2.5)

  // ── Timeline event annotations ──────────────────────────────────
  drawTimelineEvents(
    ctx, strand1, helixSteps, helixCenterX, helixRadius,
    minDim, W, H, time, mouseX, mouseY,
  )

  // ── Base pair legend ────────────────────────────────────────────
  drawLegend(ctx, CX, H, minDim)

  ctx.restore()
}

// ═══════════════════════════════════════════════════════════════════
//  DRAWING SUB-ROUTINES
// ═══════════════════════════════════════════════════════════════════

/** Faint A/T/G/C grid across the entire viewport */
function drawNucleotideGrid(
  ctx: CanvasRenderingContext2D, W: number, H: number, time: number,
): void {
  ctx.font = '400 8px "JetBrains Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const spacing = 55
  for (let gx = 0; gx < W; gx += spacing) {
    for (let gy = 0; gy < H; gy += spacing) {
      const bi = Math.floor((gx * 7 + gy * 13) % 4)
      const baseAlpha = 0.03 + 0.02 * Math.sin(time * 0.3 + gx * 0.01 + gy * 0.01)
      const c = BP_COLORS[bi]
      ctx.fillStyle = illumColor(c[0], c[1], c[2], baseAlpha)
      ctx.fillText(BASES[bi], gx, gy)
    }
  }
}

/** Draw the horizontal rungs (base pairs) connecting the two backbone strands */
function drawBasePairs(
  ctx: CanvasRenderingContext2D,
  strand1: HelixPoint[],
  strand2: HelixPoint[],
  helixSteps: number,
  time: number,
): void {
  const interval = Math.floor(helixSteps / 40)

  for (let i = 0; i < helixSteps; i += interval) {
    const s1 = strand1[i]
    const s2 = strand2[i]
    const depthAbs = Math.abs(s1.depth)
    if (depthAbs < 0.2) continue // skip rungs that are "behind" in the rotation

    const bpType = (i / interval) % 4
    const midX = (s1.x + s2.x) / 2
    const midY = (s1.y + s2.y) / 2

    // Left half — base colour
    const bc = BP_COLORS[bpType]
    ctx.beginPath()
    ctx.moveTo(s1.x, s1.y)
    ctx.lineTo(midX, midY)
    ctx.strokeStyle = illumColor(bc[0], bc[1], bc[2], 0.35 * depthAbs)
    ctx.lineWidth = 2
    ctx.stroke()

    // Right half — complementary colour
    const cc = BP_COLORS[COMP_IDX[bpType]]
    ctx.beginPath()
    ctx.moveTo(midX, midY)
    ctx.lineTo(s2.x, s2.y)
    ctx.strokeStyle = illumColor(cc[0], cc[1], cc[2], 0.35 * depthAbs)
    ctx.lineWidth = 2
    ctx.stroke()

    // Hydrogen bond dots in the center region
    // A-T has 2 bonds, G-C has 3
    const numBonds = (bpType === 0 || bpType === 1) ? 2 : 3
    for (let h = 0; h < numBonds; h++) {
      const ht = 0.4 + (h / (numBonds - 1 || 1)) * 0.2
      const hx = lerp(s1.x, s2.x, ht)
      const hy = lerp(s1.y, s2.y, ht)
      // Tiny pulsing dot
      const pulse = 1 + 0.3 * Math.sin(time * 2 + i * 0.1 + h)
      ctx.beginPath()
      ctx.arc(hx, hy, 1.5 * pulse, 0, Math.PI * 2)
      ctx.fillStyle = illumColor(232, 232, 240, 0.3 * depthAbs)
      ctx.fill()
    }
  }
}

/**
 * Draw a single backbone strand as a continuous path plus phosphate nodes.
 * @param alphaBase  overall brightness (back strand dimmer than front)
 * @param lineWidth  line thickness
 */
function drawBackboneStrand(
  ctx: CanvasRenderingContext2D,
  points: HelixPoint[],
  helixSteps: number,
  alphaBase: number,
  lineWidth: number,
): void {
  // Continuous strand curve
  ctx.beginPath()
  for (let i = 0; i < points.length; i++) {
    if (i === 0) ctx.moveTo(points[i].x, points[i].y)
    else ctx.lineTo(points[i].x, points[i].y)
  }
  ctx.strokeStyle = illumColor(0, 212, 170, alphaBase)
  ctx.lineWidth = lineWidth
  ctx.stroke()

  // Sugar-phosphate backbone nodes — small circles at regular intervals
  const nodeInterval = Math.floor(helixSteps / 30)
  for (let i = 0; i < points.length; i += nodeInterval) {
    const p = points[i]
    // Slightly vary node size based on depth for pseudo-3D
    const r = 2.5 + Math.abs(p.depth) * 1.0
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(170, 102, 255, alphaBase * 0.6)
    ctx.fill()
  }
}

/**
 * Draw career events branching off the helix as gene annotations.
 * Alternates left/right. Accent events get a pulsing glow.
 */
function drawTimelineEvents(
  ctx: CanvasRenderingContext2D,
  strand1: HelixPoint[],
  helixSteps: number,
  helixCenterX: number,
  helixRadius: number,
  minDim: number,
  W: number,
  H: number,
  time: number,
  mouseX: number,
  mouseY: number,
): void {
  const chainLen = TIMELINE_EVENTS.length

  for (let i = 0; i < chainLen; i++) {
    const ev = TIMELINE_EVENTS[i]
    const [cr, cg, cb] = ev.color
    const isAccent = ev.accent === true

    // Position: evenly distribute events along the helix
    const t = (i + 0.5) / chainLen
    const strandIdx = Math.min(Math.floor(t * helixSteps), strand1.length - 1)
    const anchor = strand1[strandIdx]

    // Alternate sides
    const side = i % 2 === 0 ? 1 : -1
    const armLen = helixRadius + minDim * 0.08
    const labelX = helixCenterX + side * armLen
    const labelY = anchor.y

    // Hover detection
    const d = dist(mouseX, mouseY, labelX, labelY)
    const isHov = d < 60

    // ── Connector line (dashed) ──
    ctx.beginPath()
    ctx.setLineDash([2, 4])
    ctx.moveTo(anchor.x, anchor.y)
    ctx.lineTo(labelX, labelY)
    ctx.strokeStyle = illumColor(cr, cg, cb, isHov ? 0.6 : isAccent ? 0.25 : 0.15)
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.setLineDash([])

    // ── Gene marker dot on the helix ──
    const baseMarkerR = isAccent ? 7 : 5
    const markerR = isHov ? baseMarkerR + 3 : baseMarkerR
    ctx.beginPath()
    ctx.arc(anchor.x, anchor.y, markerR, 0, Math.PI * 2)
    const geneGrad = ctx.createRadialGradient(
      anchor.x, anchor.y, 0, anchor.x, anchor.y, markerR,
    )
    geneGrad.addColorStop(0, illumColor(cr, cg, cb, 0.9))
    geneGrad.addColorStop(1, illumColor(cr, cg, cb, 0.3))
    ctx.fillStyle = geneGrad
    ctx.fill()

    // ── Accent glow pulse (for accent events, always; for hovered, always) ──
    if (isAccent || isHov) {
      const pulsePhase = Math.sin(time * 1.8 + i * 0.7) * 0.5 + 0.5
      const glowR = isAccent ? 36 + pulsePhase * 10 : 30
      const glowAlpha = isAccent
        ? 0.15 + pulsePhase * 0.15
        : 0.25
      const glowGrad = ctx.createRadialGradient(
        anchor.x, anchor.y, 0, anchor.x, anchor.y, glowR,
      )
      glowGrad.addColorStop(0, illumColor(cr, cg, cb, glowAlpha))
      glowGrad.addColorStop(1, illumColor(cr, cg, cb, 0))
      ctx.beginPath()
      ctx.arc(anchor.x, anchor.y, glowR, 0, Math.PI * 2)
      ctx.fillStyle = glowGrad
      ctx.fill()
    }

    // ── Text labels ──
    ctx.textAlign = side > 0 ? 'left' : 'right'
    ctx.textBaseline = 'middle'

    // Year (large, coloured) — only show integer years
    const yearStr = ev.year === Math.floor(ev.year) ? ev.year.toString() : ''
    if (yearStr) {
      const yearFontSize = isHov ? 15 : isAccent ? 13 : 10
      ctx.font = `600 ${yearFontSize}px "JetBrains Mono", monospace`
      ctx.fillStyle = illumColor(cr, cg, cb, isHov ? 0.9 : isAccent ? 0.7 : 0.5)
      ctx.fillText(yearStr, labelX, labelY - 16)
    }

    // Event text (bold)
    const textSize = isHov ? 13 : isAccent ? 12 : 11
    const textWeight = isHov ? 600 : isAccent ? 500 : 400
    ctx.font = `${textWeight} ${textSize}px "Space Grotesk", sans-serif`
    ctx.fillStyle = illumColor(232, 232, 240, isHov ? 1 : isAccent ? 0.8 : 0.6)
    ctx.fillText(ev.text, labelX, labelY + 2)

    // Sub-text (small, coloured)
    const subSize = isHov ? 11 : 9
    ctx.font = `400 ${subSize}px "Inter", sans-serif`
    ctx.fillStyle = illumColor(cr, cg, cb, isHov ? 0.7 : isAccent ? 0.45 : 0.35)
    ctx.fillText(ev.sub, labelX, labelY + 18)
  }
}

/** Base pair legend at the bottom of the viewport */
function drawLegend(
  ctx: CanvasRenderingContext2D,
  CX: number,
  H: number,
  minDim: number,
): void {
  const legendY = H * 0.88
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const legendItems = [
    { base: 'A', comp: 'T', bonds: 2, c: BP_COLORS[0], cc: BP_COLORS[1] },
    { base: 'G', comp: 'C', bonds: 3, c: BP_COLORS[2], cc: BP_COLORS[3] },
  ]

  for (let li = 0; li < legendItems.length; li++) {
    const lx = CX + (li - 0.5) * 120
    const item = legendItems[li]

    // Base letter
    ctx.font = '600 12px "JetBrains Mono", monospace'
    ctx.fillStyle = illumColor(item.c[0], item.c[1], item.c[2], 0.6)
    ctx.fillText(item.base, lx - 20, legendY)

    // Hydrogen bond dots
    for (let bd = 0; bd < item.bonds; bd++) {
      ctx.beginPath()
      ctx.arc(lx - 8 + bd * 8, legendY, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = illumColor(232, 232, 240, 0.3)
      ctx.fill()
    }

    // Complement letter
    ctx.fillStyle = illumColor(item.cc[0], item.cc[1], item.cc[2], 0.6)
    ctx.fillText(item.comp, lx + 20, legendY)
  }

  ctx.font = '400 8px "JetBrains Mono", monospace'
  ctx.fillStyle = illumColor(232, 232, 240, 0.2)
  ctx.fillText('HYDROGEN BONDS', CX, legendY + 14)
}
