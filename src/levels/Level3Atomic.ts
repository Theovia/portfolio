// ═══════════════════════════════════════════════════════════════════
//  LEVEL 3: GEL ELECTROPHORESIS — TECHNOLOGY STACK (1000x)
//  Technologies separated by "molecular weight" (proficiency/complexity)
//  into lanes by domain. Fluorescence-stained bands glow in each
//  technology's color. Hover reveals details. Band edges are fuzzy
//  with Gaussian intensity profiles — like a real agarose gel image.
// ═══════════════════════════════════════════════════════════════════

import { state } from '../engine/state'
import { clamp, smoothNoise } from '../utils/math'
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

// --------------- lane / band data types ---------------

type LaneId = 'FRONTEND' | 'BACKEND' | 'AI_ML' | 'OPS'

interface Lane {
  id: LaneId
  label: string
  symbols: string[]
}

interface BandData {
  atom: TechAtom
  laneIndex: number
  /** Molecular weight — higher MW = closer to wells (less migration) */
  mw: number
  /** Band thickness in pixels (base, scaled per frame) */
  thickness: number
  /** Intensity 0-1 (proficiency proxy) */
  intensity: number
  /** Deterministic noise seed for edge irregularity */
  noiseSeed: number
  /** Slight random horizontal jitter within lane (hand-poured gel) */
  xJitter: number
}

// --------------- lane definitions ---------------

const LANES: Lane[] = [
  { id: 'FRONTEND', label: 'FRONTEND', symbols: ['Re', 'Ts', 'Vt', 'Tw', 'Tq'] },
  { id: 'BACKEND',  label: 'BACKEND',  symbols: ['Sb', 'Pg', 'Cf', 'Dn', 'Dz'] },
  { id: 'AI_ML',    label: 'AI / ML',  symbols: ['Cl', 'Py', 'Fz'] },
  { id: 'OPS',      label: 'OPS',      symbols: ['Sn', 'Ph', 'Rs'] },
]

// Molecular weight ladder values (kDa) — standard protein markers
const MW_LADDER = [250, 150, 100, 75, 50, 37, 25, 15]

// MW range for mapping band positions
const MW_MAX = 260
const MW_MIN = 10

// --------------- assign MW by category + order within lane ---------------

function assignMW(category: TechAtom['category'], indexInLane: number): number {
  // Core = heavy proteins (high MW, near top), specialist = light (low MW, migrates far)
  switch (category) {
    case 'core':       return 200 - indexInLane * 30
    case 'supporting': return 90 - indexInLane * 15
    case 'specialist': return 40 - indexInLane * 8
  }
}

// --------------- pre-compute band data ---------------

const bands: BandData[] = []

for (let li = 0; li < LANES.length; li++) {
  const lane = LANES[li]
  let coreIdx = 0, suppIdx = 0, specIdx = 0

  for (const sym of lane.symbols) {
    const atom = TECH_STACK.find(a => a.symbol === sym)
    if (!atom) continue

    let orderIdx = 0
    if (atom.category === 'core') orderIdx = coreIdx++
    else if (atom.category === 'supporting') orderIdx = suppIdx++
    else orderIdx = specIdx++

    const mw = assignMW(atom.category, orderIdx)
    const projectCount = atom.projects.length

    bands.push({
      atom,
      laneIndex: li,
      mw: clamp(mw, MW_MIN, MW_MAX),
      thickness: atom.category === 'core' ? 9 : atom.category === 'supporting' ? 6 : 4,
      intensity: clamp(0.5 + projectCount * 0.15, 0.5, 1.0),
      noiseSeed: li * 100 + bands.length * 17.3,
      xJitter: Math.sin(li * 3.7 + bands.length * 2.1) * 0.015,
    })
  }
}

// --------------- hover state ---------------

let _hoveredAtom: TechAtom | null = null
let _hoveredBandRect: { x: number; y: number; w: number; h: number } | null = null

/** Returns the currently hovered TechAtom, or null */
export function getHoveredAtom(): TechAtom | null {
  return _hoveredAtom
}

// --------------- gel geometry helpers ---------------

interface GelGeometry {
  gelX: number
  gelY: number
  gelW: number
  gelH: number
  laneW: number
  bandW: number
  wellH: number
  ladderX: number
  ladderW: number
}

function computeGelGeometry(W: number, H: number): GelGeometry {
  const gelW = W * 0.58
  const gelH = H * 0.68
  const gelX = (W - gelW) / 2
  const gelY = H * 0.18

  const ladderW = gelW * 0.08
  const ladderX = gelX

  const lanesAreaW = gelW - ladderW
  const laneW = lanesAreaW / LANES.length
  const bandW = laneW * 0.78

  const wellH = clamp(H * 0.018, 8, 16)

  return { gelX, gelY, gelW, gelH, laneW, bandW, wellH, ladderX, ladderW }
}

/** Map molecular weight to Y position within the gel */
function mwToY(mw: number, geo: GelGeometry): number {
  const t = (mw - MW_MIN) / (MW_MAX - MW_MIN)
  const topMargin = geo.wellH + 20
  const bottomMargin = 30
  const usableH = geo.gelH - topMargin - bottomMargin
  return geo.gelY + topMargin + usableH * (1 - t)
}

/** Get the X center of a lane */
function laneCenterX(laneIndex: number, geo: GelGeometry): number {
  const lanesAreaX = geo.gelX + geo.ladderW
  // Per-lane jitter for hand-poured feel
  const jitter = Math.sin(laneIndex * 5.17) * geo.laneW * 0.012
  return lanesAreaX + (laneIndex + 0.5) * geo.laneW + jitter
}

// --------------- main draw function ---------------

/**
 * Draw Level 3 — Gel Electrophoresis (tech stack).
 * @param ctx  Canvas 2D context
 * @param alpha  0-1 opacity for transitions
 */
export function drawLevel3(ctx: CanvasRenderingContext2D, alpha: number): void {
  if (alpha <= 0) return
  ctx.save()
  ctx.globalAlpha = alpha

  const { width: W, height: H, time, mouseX, mouseY } = state
  const minDim = Math.min(W, H)
  const geo = computeGelGeometry(W, H)

  // ── Background ──────────────────────────────────────────────────
  ctx.fillStyle = state.lightMode ? 'rgb(240,238,230)' : illumColor(6, 6, 14, 1)
  ctx.fillRect(0, 0, W, H)

  // ── Title ───────────────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const titleSize = clamp(minDim * 0.024, 13, 24)
  ctx.font = `600 ${titleSize}px "Space Grotesk", sans-serif`
  ctx.fillStyle = illumColor(232, 232, 240, 0.75)
  ctx.fillText('GEL ELECTROPHORESIS', W / 2, H * 0.06)

  const subSize = clamp(minDim * 0.012, 8, 12)
  ctx.font = `400 ${subSize}px "JetBrains Mono", monospace`
  ctx.fillStyle = illumColor(0, 212, 170, 0.45)
  ctx.fillText('TECHNOLOGY STACK  //  SEPARATED BY DOMAIN', W / 2, H * 0.06 + titleSize + 4)

  // ── Gel rectangle ───────────────────────────────────────────────
  drawGelBackground(ctx, geo, time, minDim)

  // ── Polarity markers ────────────────────────────────────────────
  drawPolarityMarkers(ctx, geo, minDim)

  // ── Molecular weight ladder ─────────────────────────────────────
  drawMWLadder(ctx, geo, minDim)

  // ── Lane dividers and labels ────────────────────────────────────
  drawLaneLabels(ctx, geo, minDim)

  // ── Loading wells ───────────────────────────────────────────────
  drawWells(ctx, geo)

  // ── Bands ───────────────────────────────────────────────────────
  _hoveredAtom = null
  _hoveredBandRect = null

  for (const band of bands) {
    drawBand(ctx, band, geo, time, mouseX, mouseY, minDim)
  }

  // ── Tooltip for hovered band ────────────────────────────────────
  if (_hoveredAtom && _hoveredBandRect) {
    drawTooltip(ctx, _hoveredAtom, _hoveredBandRect, geo, minDim, W, H)
  }

  // ── Gel border (crisp) ──────────────────────────────────────────
  ctx.strokeStyle = illumColor(80, 90, 100, 0.3)
  ctx.lineWidth = 1.5
  ctx.strokeRect(geo.gelX, geo.gelY, geo.gelW, geo.gelH)

  // Central Dogma indicator
  ctx.save()
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.font = '400 9px "JetBrains Mono", monospace'
  ctx.fillStyle = illumColor(196, 164, 74, 0.3)
  ctx.fillText('\u25C8 TRANSLATION \u2014 TOOLS SYNTHESIZED', W * 0.97, H * 0.92)
  ctx.restore()

  ctx.restore()
}

// ═══════════════════════════════════════════════════════════════════
//  DRAWING SUB-ROUTINES
// ═══════════════════════════════════════════════════════════════════

/** Draw the gel rectangle with subtle translucent texture and noise */
function drawGelBackground(
  ctx: CanvasRenderingContext2D,
  geo: GelGeometry,
  time: number,
  minDim: number,
): void {
  const { gelX, gelY, gelW, gelH } = geo

  // Base gel fill — slightly lighter than background, translucent
  ctx.fillStyle = state.lightMode
    ? 'rgba(200, 200, 210, 0.3)'
    : illumColor(12, 14, 22, 0.85)
  ctx.fillRect(gelX, gelY, gelW, gelH)

  // Subtle gel noise texture — low-res grid to keep performance sane
  const noiseStep = clamp(minDim * 0.012, 6, 14)
  const cols = Math.ceil(gelW / noiseStep)
  const rows = Math.ceil(gelH / noiseStep)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const nx = gelX + c * noiseStep
      const ny = gelY + r * noiseStep
      const n = smoothNoise(c * 0.3 + time * 0.02, r * 0.3 + time * 0.015)
      const noiseAlpha = 0.012 + n * 0.025
      ctx.fillStyle = state.lightMode
        ? `rgba(0,0,0,${noiseAlpha * 0.5})`
        : `rgba(180,190,200,${noiseAlpha})`
      ctx.fillRect(nx, ny, noiseStep, noiseStep)
    }
  }

  // Faint vertical gradient — gel is slightly darker at bottom (denser)
  const vertGrad = ctx.createLinearGradient(gelX, gelY, gelX, gelY + gelH)
  if (state.lightMode) {
    vertGrad.addColorStop(0, 'rgba(0,0,0,0)')
    vertGrad.addColorStop(1, 'rgba(0,0,0,0.04)')
  } else {
    vertGrad.addColorStop(0, 'rgba(0,0,0,0)')
    vertGrad.addColorStop(1, 'rgba(0,0,0,0.15)')
  }
  ctx.fillStyle = vertGrad
  ctx.fillRect(gelX, gelY, gelW, gelH)
}

/** Draw polarity markers on the side: minus at top, plus at bottom, with arrow */
function drawPolarityMarkers(
  ctx: CanvasRenderingContext2D,
  geo: GelGeometry,
  minDim: number,
): void {
  const { gelX, gelY, gelH } = geo
  const markerX = gelX - clamp(minDim * 0.04, 18, 36)
  const markerSize = clamp(minDim * 0.018, 10, 18)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${markerSize}px "Space Grotesk", sans-serif`

  // Cathode (minus) at top
  ctx.fillStyle = illumColor(100, 140, 255, 0.7)
  ctx.fillText('\u2212', markerX, gelY + 14)

  // Anode (plus) at bottom
  ctx.fillStyle = illumColor(255, 100, 100, 0.7)
  ctx.fillText('+', markerX, gelY + gelH - 14)

  // Migration arrow
  const arrowTop = gelY + 32
  const arrowBot = gelY + gelH - 32
  ctx.beginPath()
  ctx.moveTo(markerX, arrowTop)
  ctx.lineTo(markerX, arrowBot)
  ctx.strokeStyle = illumColor(160, 160, 180, 0.2)
  ctx.lineWidth = 1
  ctx.stroke()

  // Arrowhead pointing down
  ctx.beginPath()
  ctx.moveTo(markerX - 4, arrowBot - 8)
  ctx.lineTo(markerX, arrowBot)
  ctx.lineTo(markerX + 4, arrowBot - 8)
  ctx.strokeStyle = illumColor(160, 160, 180, 0.3)
  ctx.lineWidth = 1.2
  ctx.stroke()

  // "MIGRATION" label rotated vertically
  const migSize = clamp(minDim * 0.008, 6, 9)
  ctx.save()
  ctx.translate(markerX - 12, (arrowTop + arrowBot) / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.font = `400 ${migSize}px "JetBrains Mono", monospace`
  ctx.fillStyle = illumColor(140, 140, 160, 0.3)
  ctx.textAlign = 'center'
  ctx.fillText('MIGRATION', 0, 0)
  ctx.restore()
}

/** Draw molecular weight ladder on the left edge of the gel */
function drawMWLadder(
  ctx: CanvasRenderingContext2D,
  geo: GelGeometry,
  minDim: number,
): void {
  const ladderCenterX = geo.ladderX + geo.ladderW * 0.5
  const bw = geo.ladderW * 0.6
  const labelSize = clamp(minDim * 0.008, 6, 9)

  // Loading well for ladder
  ctx.fillStyle = illumColor(20, 22, 30, 0.9)
  ctx.fillRect(
    ladderCenterX - bw * 0.6,
    geo.gelY + 2,
    bw * 1.2,
    geo.wellH,
  )

  for (const mw of MW_LADDER) {
    const y = mwToY(mw, geo)

    // Ladder bands are SHARPER than sample bands (purified standards)
    const thickness = 2.5
    const halfT = thickness / 2

    const bandGrad = ctx.createLinearGradient(
      ladderCenterX - bw / 2, y,
      ladderCenterX + bw / 2, y,
    )
    const ladderColor = state.lightMode ? [40, 50, 120] : [140, 160, 255]
    const [lr, lg, lb] = ladderColor

    // Sharp Gaussian profile for purified standards
    bandGrad.addColorStop(0, illumColor(lr, lg, lb, 0.05))
    bandGrad.addColorStop(0.15, illumColor(lr, lg, lb, 0.6))
    bandGrad.addColorStop(0.5, illumColor(lr, lg, lb, 0.8))
    bandGrad.addColorStop(0.85, illumColor(lr, lg, lb, 0.6))
    bandGrad.addColorStop(1, illumColor(lr, lg, lb, 0.05))

    ctx.fillStyle = bandGrad
    ctx.fillRect(ladderCenterX - bw / 2, y - halfT, bw, thickness)

    // Label to the left of the gel
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    ctx.font = `400 ${labelSize}px "JetBrains Mono", monospace`
    ctx.fillStyle = illumColor(140, 150, 170, 0.5)
    ctx.fillText(`${mw}`, geo.gelX - 6, y)
  }

  // "kDa" label at top
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.font = `400 ${labelSize}px "JetBrains Mono", monospace`
  ctx.fillStyle = illumColor(140, 150, 170, 0.35)
  ctx.fillText('kDa', geo.gelX - 6, geo.gelY - 2)

  // "M" label above the ladder well
  ctx.textAlign = 'center'
  ctx.textBaseline = 'bottom'
  const laneLabel = clamp(minDim * 0.009, 7, 10)
  ctx.font = `600 ${laneLabel}px "JetBrains Mono", monospace`
  ctx.fillStyle = illumColor(140, 160, 255, 0.5)
  ctx.fillText('M', ladderCenterX, geo.gelY - 4)
}

/** Draw lane divider lines and labels at the top */
function drawLaneLabels(
  ctx: CanvasRenderingContext2D,
  geo: GelGeometry,
  minDim: number,
): void {
  const lanesAreaX = geo.gelX + geo.ladderW
  const labelSize = clamp(minDim * 0.009, 7, 10)

  for (let i = 0; i < LANES.length; i++) {
    const cx = laneCenterX(i, geo)

    // Lane label above gel
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.font = `600 ${labelSize}px "JetBrains Mono", monospace`
    ctx.fillStyle = illumColor(200, 205, 215, 0.6)
    ctx.fillText(LANES[i].label, cx, geo.gelY - 4)

    // Faint lane dividers inside gel
    if (i > 0) {
      const divX = lanesAreaX + i * geo.laneW
      ctx.beginPath()
      ctx.moveTo(divX, geo.gelY)
      ctx.lineTo(divX, geo.gelY + geo.gelH)
      ctx.strokeStyle = illumColor(100, 110, 120, 0.06)
      ctx.lineWidth = 0.8
      ctx.setLineDash([4, 6])
      ctx.stroke()
      ctx.setLineDash([])
    }
  }
}

/** Draw loading wells at the top of each lane */
function drawWells(
  ctx: CanvasRenderingContext2D,
  geo: GelGeometry,
): void {
  for (let i = 0; i < LANES.length; i++) {
    const cx = laneCenterX(i, geo)
    const wellW = geo.bandW * 0.85
    const wellX = cx - wellW / 2
    const wellY = geo.gelY + 3

    // Well is a dark rectangle at the top of the lane
    ctx.fillStyle = state.lightMode
      ? 'rgba(40, 45, 60, 0.4)'
      : illumColor(8, 10, 18, 0.95)
    ctx.fillRect(wellX, wellY, wellW, geo.wellH)

    // Subtle well border
    ctx.strokeStyle = illumColor(80, 90, 100, 0.15)
    ctx.lineWidth = 0.6
    ctx.strokeRect(wellX, wellY, wellW, geo.wellH)
  }
}

/** Draw a single technology band with fluorescent glow */
function drawBand(
  ctx: CanvasRenderingContext2D,
  band: BandData,
  geo: GelGeometry,
  time: number,
  mouseX: number,
  mouseY: number,
  minDim: number,
): void {
  const { atom, laneIndex, mw, thickness, intensity, noiseSeed, xJitter } = band
  const [cr, cg, cb] = atom.color

  const cx = laneCenterX(laneIndex, geo) + xJitter * geo.laneW
  const y = mwToY(mw, geo)
  const bw = geo.bandW

  // Subtle breathing pulse — bands are still being stained
  const pulse = 1.0 + 0.06 * Math.sin(time * 0.8 + noiseSeed * 0.1)
  const effectiveIntensity = intensity * pulse

  // Responsive thickness scaling
  const scaledThickness = clamp(thickness * (minDim / 800), 2, 14)
  const halfT = scaledThickness / 2

  // Band bounding rect for hover detection (generous vertical margin)
  const bandLeft = cx - bw / 2
  const bandTop = y - halfT - 4
  const bandRight = cx + bw / 2
  const bandBottom = y + halfT + 4

  const isHovered = mouseX >= bandLeft && mouseX <= bandRight &&
    mouseY >= bandTop && mouseY <= bandBottom

  if (isHovered) {
    _hoveredAtom = atom
    _hoveredBandRect = { x: bandLeft, y: bandTop, w: bw, h: bandBottom - bandTop }
  }

  const hoverBoost = isHovered ? 0.35 : 0

  // ── Fluorescent outer glow (elliptical, wider than band) ──
  const glowR = scaledThickness * (isHovered ? 5 : 3)
  const outerGlow = ctx.createRadialGradient(cx, y, 0, cx, y, glowR)
  outerGlow.addColorStop(0, illumColor(cr, cg, cb, (0.12 + hoverBoost * 0.4) * effectiveIntensity))
  outerGlow.addColorStop(0.4, illumColor(cr, cg, cb, (0.06 + hoverBoost * 0.15) * effectiveIntensity))
  outerGlow.addColorStop(1, illumColor(cr, cg, cb, 0))

  ctx.save()
  ctx.beginPath()
  ctx.ellipse(cx, y, bw / 2 + glowR, glowR, 0, 0, Math.PI * 2)
  ctx.fillStyle = outerGlow
  ctx.fill()
  ctx.restore()

  // ── Band itself — horizontal slices for fuzzy vertical edges + Gaussian ──
  const slices = Math.max(Math.ceil(scaledThickness), 4)
  const sliceH = scaledThickness / slices

  for (let s = 0; s < slices; s++) {
    const sliceY = y - halfT + s * sliceH
    // Vertical Gaussian — peak at center of band
    const distFromCenter = Math.abs((s + 0.5) / slices - 0.5) * 2
    const vertFalloff = Math.exp(-distFromCenter * distFromCenter * 3)

    // Horizontal Gaussian with irregular-edge noise
    const sliceGrad = ctx.createLinearGradient(cx - bw / 2, sliceY, cx + bw / 2, sliceY)
    const baseAlpha = (0.25 + effectiveIntensity * 0.55 + hoverBoost) * vertFalloff

    // Irregular edges — noise varies per slice and slowly over time
    const leftNoise = smoothNoise(noiseSeed + s * 0.7, time * 0.05) * 0.1
    const rightNoise = smoothNoise(noiseSeed + s * 0.7 + 50, time * 0.05) * 0.1

    sliceGrad.addColorStop(0, illumColor(cr, cg, cb, 0))
    sliceGrad.addColorStop(0.08 + leftNoise, illumColor(cr, cg, cb, baseAlpha * 0.15))
    sliceGrad.addColorStop(0.2 + leftNoise * 0.5, illumColor(cr, cg, cb, baseAlpha * 0.7))
    sliceGrad.addColorStop(0.45, illumColor(cr, cg, cb, baseAlpha))
    sliceGrad.addColorStop(0.55, illumColor(cr, cg, cb, baseAlpha))
    sliceGrad.addColorStop(0.8 - rightNoise * 0.5, illumColor(cr, cg, cb, baseAlpha * 0.7))
    sliceGrad.addColorStop(0.92 - rightNoise, illumColor(cr, cg, cb, baseAlpha * 0.15))
    sliceGrad.addColorStop(1, illumColor(cr, cg, cb, 0))

    ctx.fillStyle = sliceGrad
    ctx.fillRect(cx - bw / 2, sliceY, bw, sliceH + 0.5) // +0.5 avoids subpixel gaps
  }

  // ── Symbol label on hovered band ──
  if (isHovered) {
    const symSize = clamp(minDim * 0.013, 8, 13)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = `700 ${symSize}px "Space Grotesk", sans-serif`
    ctx.fillStyle = illumColor(255, 255, 255, 0.95)
    ctx.fillText(atom.symbol, cx, y - halfT - symSize * 0.8)
  }
}

/** Draw tooltip with technology details near the hovered band */
function drawTooltip(
  ctx: CanvasRenderingContext2D,
  atom: TechAtom,
  bandRect: { x: number; y: number; w: number; h: number },
  _geo: GelGeometry,
  minDim: number,
  W: number,
  H: number,
): void {
  const [cr, cg, cb] = atom.color
  const padding = 10
  const nameSize = clamp(minDim * 0.013, 9, 14)
  const descSize = clamp(minDim * 0.010, 7, 11)
  const projSize = clamp(minDim * 0.009, 6, 10)

  // Measure text to size the tooltip
  ctx.font = `700 ${nameSize}px "Space Grotesk", sans-serif`
  const nameWidth = ctx.measureText(atom.name).width

  ctx.font = `400 ${descSize}px "Inter", sans-serif`
  const maxLineWidth = clamp(minDim * 0.22, 140, 260)

  // Word-wrap description
  const words = atom.description.split(' ')
  const descLines: string[] = []
  let currentLine = ''
  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(test).width > maxLineWidth && currentLine) {
      descLines.push(currentLine)
      currentLine = word
      if (descLines.length >= 3) break
    } else {
      currentLine = test
    }
  }
  if (currentLine && descLines.length < 3) descLines.push(currentLine)

  const projText = atom.projects.join(' / ')
  ctx.font = `400 ${projSize}px "JetBrains Mono", monospace`
  const projWidth = ctx.measureText(projText).width

  const tooltipW = Math.max(nameWidth, maxLineWidth, projWidth) + padding * 2
  const tooltipH = padding + nameSize + 6 + descLines.length * (descSize + 3) + 8 + projSize + padding

  // Position tooltip to the right of the band, fall back to left if clipped
  let tx = bandRect.x + bandRect.w + 12
  if (tx + tooltipW > W - 10) {
    tx = bandRect.x - tooltipW - 12
  }
  let ty = bandRect.y - tooltipH / 2
  ty = clamp(ty, 10, H - tooltipH - 10)

  // Background
  ctx.fillStyle = state.lightMode ? 'rgba(30,32,40,0.92)' : 'rgba(12,14,22,0.92)'
  ctx.beginPath()
  roundRect(ctx, tx, ty, tooltipW, tooltipH, 4)
  ctx.fill()

  // Colored accent line on left edge
  ctx.fillStyle = illumColor(cr, cg, cb, 0.8)
  ctx.fillRect(tx, ty + 4, 2.5, tooltipH - 8)

  // Name
  let textY = ty + padding + nameSize * 0.5
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${nameSize}px "Space Grotesk", sans-serif`
  ctx.fillStyle = illumColor(cr, cg, cb, 1)
  ctx.fillText(atom.name, tx + padding + 4, textY)
  textY += nameSize + 4

  // Description lines
  ctx.font = `400 ${descSize}px "Inter", sans-serif`
  ctx.fillStyle = illumColor(210, 212, 220, 0.75)
  for (const line of descLines) {
    ctx.fillText(line, tx + padding + 4, textY)
    textY += descSize + 3
  }
  textY += 4

  // Projects
  ctx.font = `400 ${projSize}px "JetBrains Mono", monospace`
  ctx.fillStyle = illumColor(cr, cg, cb, 0.5)
  ctx.fillText(projText, tx + padding + 4, textY)
}

/** Helper: draw a rounded rectangle path */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}
