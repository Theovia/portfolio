/**
 * Level 4: Quantum Manifesto (10000x magnification)
 *
 * The deepest zoom — the quantum realm. Dense particle field with
 * probabilistic positioning (uncertainty principle), wave functions,
 * Schrodinger equation fragments, and orbital shapes that collapse
 * on cursor proximity. The manifesto materializes from the quantum
 * field line by line. Contacts orbit as quantum observables that
 * collapse on hover. Hidden easter egg: 周 (Zhou) drifts faintly
 * in the particle field.
 *
 * This is the emotional climax: vast, quiet, contemplative.
 */

import { state } from '../engine/state'
import { clamp, dist, rand, lerp, smoothNoise } from '../utils/math'
import { MANIFESTO_LINES, MANIFESTO_AUTHOR, CONTACTS } from '../content/manifesto'

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

// ── Types ────────────────────────────────────────────────────────────

interface QuantumParticle {
  x: number       // normalized 0-1
  y: number       // normalized 0-1
  vx: number
  vy: number
  r: number
  opacity: number
  phase: number
  waveFreq: number
  cr: number
  cg: number
  cb: number
  // Probability cloud: each frame we offset position by a small random amount
  // then blend back — this creates the quantum shimmer/teleport effect
  uncertaintyRadius: number
}

interface WaveFunction {
  yOffset: number    // normalized vertical position
  angle: number      // rotation in radians
  frequency: number
  amplitude: number
  speed: number
  phase: number
}

interface EquationFragment {
  text: string
  x: number   // normalized 0-1
  y: number   // normalized 0-1
  vx: number
  vy: number
  baseAlpha: number
}

interface ContactObservable {
  angle: number     // current orbital angle
  orbitRadius: number
  orbitSpeed: number
  orbitCenterX: number  // normalized
  orbitCenterY: number  // normalized
  collapseProgress: number  // 0 = superposition, 1 = collapsed
  typewriterChars: number   // how many chars of value to show
  fuzzRadius: number
}

// ── Constants ────────────────────────────────────────────────────────

const PARTICLE_COUNT_BASE = 2200
const WAVE_COUNT = 5
const EQUATION_FRAGMENTS = [
  'iℏ∂ψ/∂t = Hψ',
  '|ψ|² = P(x)',
  'Δx·Δp ≥ ℏ/2',
  'Ĥ|n⟩ = Eₙ|n⟩',
  '⟨x|p⟩ = eⁱᵖˣ/ℏ',
  'ψ = Σ cₙφₙ',
]

// Orbital shapes: positions (normalized) and type
const ORBITAL_SHAPES = [
  { x: 0.14, y: 0.22, type: 's' as const, color: [0, 212, 170] as [number, number, number] },
  { x: 0.86, y: 0.19, type: 'p' as const, color: [170, 102, 255] as [number, number, number] },
  { x: 0.12, y: 0.58, type: 'd' as const, color: [196, 164, 74] as [number, number, number] },
  { x: 0.88, y: 0.55, type: 'p' as const, color: [68, 136, 255] as [number, number, number] },
]

// ── State (lazy init) ────────────────────────────────────────────────

let particles: QuantumParticle[] | null = null
let waves: WaveFunction[] | null = null
let equations: EquationFragment[] | null = null
let contactStates: ContactObservable[] | null = null
let manifestoRevealTime = 0
let lastDrawTime = -1
let hoveredContactIdx = -1

// Easter egg: 周 character
const ZHOU_CHAR = '周'
let zhouX = 0.62
let zhouY = 0.37
let zhouVx = 0.00003
let zhouVy = -0.00002

// ── Initialization ───────────────────────────────────────────────────

function initParticles(): QuantumParticle[] {
  const count = state.qualityTier === 'low' ? Math.floor(PARTICLE_COUNT_BASE * 0.15)
    : state.qualityTier === 'medium' ? Math.floor(PARTICLE_COUNT_BASE * 0.4)
    : PARTICLE_COUNT_BASE

  const arr: QuantumParticle[] = []
  for (let i = 0; i < count; i++) {
    // Color distribution: mostly dim blue-cyan, occasional warm accents
    const colorRoll = Math.random()
    let cr: number, cg: number, cb: number
    if (colorRoll < 0.6) {
      // Deep blue-cyan
      cr = rand(0, 20)
      cg = rand(160, 220)
      cb = rand(180, 230)
    } else if (colorRoll < 0.85) {
      // Teal-green
      cr = rand(0, 40)
      cg = rand(180, 212)
      cb = rand(140, 180)
    } else if (colorRoll < 0.95) {
      // Faint gold
      cr = rand(150, 200)
      cg = rand(130, 170)
      cb = rand(40, 80)
    } else {
      // Rare: violet
      cr = rand(120, 180)
      cg = rand(70, 120)
      cb = rand(200, 255)
    }

    arr.push({
      x: rand(0, 1),
      y: rand(0, 1),
      vx: rand(-0.0004, 0.0004),
      vy: rand(-0.0004, 0.0004),
      r: rand(0.3, 1.8),
      opacity: rand(0.02, 0.25),
      phase: rand(0, Math.PI * 2),
      waveFreq: rand(1.5, 6),
      cr, cg, cb,
      uncertaintyRadius: rand(0.5, 3.5),
    })
  }
  return arr
}

function initWaves(): WaveFunction[] {
  const arr: WaveFunction[] = []
  for (let i = 0; i < WAVE_COUNT; i++) {
    arr.push({
      yOffset: rand(0.15, 0.85),
      angle: rand(-0.3, 0.3),
      frequency: rand(0.008, 0.025),
      amplitude: rand(15, 50),
      speed: rand(0.2, 0.7) * (Math.random() > 0.5 ? 1 : -1),
      phase: rand(0, Math.PI * 2),
    })
  }
  return arr
}

function initEquations(): EquationFragment[] {
  return EQUATION_FRAGMENTS.map((text, i) => ({
    text,
    x: rand(0.08, 0.92),
    y: rand(0.1, 0.9),
    vx: rand(-0.00008, 0.00008),
    vy: rand(-0.00006, 0.00006),
    baseAlpha: rand(0.03, 0.07),
  }))
}

function initContactStates(): ContactObservable[] {
  // Distribute contacts horizontally across the bottom
  const positions = [0.18, 0.39, 0.61, 0.82]
  return CONTACTS.map((_, i) => ({
    angle: rand(0, Math.PI * 2),
    orbitRadius: rand(0.02, 0.04),
    orbitSpeed: rand(0.1, 0.2) * (i % 2 === 0 ? 1 : -1),
    orbitCenterX: positions[i],
    orbitCenterY: 0.78,
    collapseProgress: 0,
    typewriterChars: 0,
    fuzzRadius: rand(6, 12),
  }))
}

// ── Sub-routines ─────────────────────────────────────────────────────

function drawQuantumParticles(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, t: number,
  mouseX: number, mouseY: number,
): void {
  if (!particles) return

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]

    // Drift
    p.x += p.vx + Math.sin(t * p.waveFreq + p.phase) * 0.00015
    p.y += p.vy + Math.cos(t * p.waveFreq * 0.7 + p.phase) * 0.00015

    // Wrap
    if (p.x < -0.05) p.x = 1.05
    if (p.x > 1.05) p.x = -0.05
    if (p.y < -0.05) p.y = 1.05
    if (p.y > 1.05) p.y = -0.05

    const px = p.x * W
    const py = p.y * H

    // Cursor repulsion
    const dMouse = dist(mouseX, mouseY, px, py)
    if (dMouse < 130 && dMouse > 1) {
      const force = ((130 - dMouse) / 130) * 0.0015
      p.vx += ((px - mouseX) / dMouse) * force * (1 / W)
      p.vy += ((py - mouseY) / dMouse) * force * (1 / H)
    }

    // Drag
    p.vx *= 0.995
    p.vy *= 0.995

    // Quantum uncertainty: probabilistic position offset each frame
    // The particle doesn't just sit in one place — it has a probability cloud
    const uOffsetX = (Math.random() - 0.5) * p.uncertaintyRadius
    const uOffsetY = (Math.random() - 0.5) * p.uncertaintyRadius

    // Near cursor: wave function collapse — uncertainty decreases
    const collapseRadius = 180
    const collapseFactor = dMouse < collapseRadius
      ? Math.pow(1 - dMouse / collapseRadius, 2) : 0
    const effectiveUX = uOffsetX * (1 - collapseFactor * 0.9)
    const effectiveUY = uOffsetY * (1 - collapseFactor * 0.9)

    const drawX = px + effectiveUX
    const drawY = py + effectiveUY

    // Shimmer (amplitude modulation)
    const shimmer = 0.4 + 0.6 * Math.sin(t * 1.5 + p.phase)

    // Draw particle core
    const drawR = p.r + collapseFactor * 2
    const drawOpacity = p.opacity * shimmer + collapseFactor * 0.35

    ctx.beginPath()
    ctx.arc(drawX, drawY, drawR, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(p.cr, p.cg, p.cb, drawOpacity)
    ctx.fill()

    // Probability halo on cursor proximity
    if (collapseFactor > 0.15) {
      const haloR = drawR * 4 * (1 - collapseFactor * 0.5)
      const grad = ctx.createRadialGradient(drawX, drawY, drawR, drawX, drawY, haloR)
      grad.addColorStop(0, illumColor(p.cr, p.cg, p.cb, collapseFactor * 0.12))
      grad.addColorStop(1, illumColor(p.cr, p.cg, p.cb, 0))
      ctx.beginPath()
      ctx.arc(drawX, drawY, haloR, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }
  }
}

function drawWaveFunctions(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, t: number,
): void {
  if (!waves) return

  for (const w of waves) {
    ctx.save()
    const centerY = w.yOffset * H
    ctx.translate(W / 2, centerY)
    ctx.rotate(w.angle)
    ctx.translate(-W / 2, -centerY)

    ctx.beginPath()
    // Organic non-uniform amplitude: modulate with slow noise
    for (let x = -20; x < W + 20; x += 3) {
      const nx = x / W
      const ampMod = 0.6 + 0.4 * smoothNoise(nx * 3 + t * 0.1, w.phase)
      const y = centerY +
        Math.sin(x * w.frequency + t * w.speed + w.phase) *
        w.amplitude * ampMod *
        Math.sin(x * 0.002 + t * 0.15)  // envelope modulation
      if (x === -20) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = illumColor(0, 212, 170, 0.035)
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()
  }
}

function drawEquationFragments(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, t: number,
  minDim: number,
): void {
  if (!equations) return

  for (const eq of equations) {
    // Slow drift
    eq.x += eq.vx
    eq.y += eq.vy

    // Soft bounce at edges
    if (eq.x < 0.05 || eq.x > 0.95) eq.vx *= -1
    if (eq.y < 0.05 || eq.y > 0.95) eq.vy *= -1

    const ex = eq.x * W
    const ey = eq.y * H

    // Breathing opacity
    const breathe = eq.baseAlpha + 0.02 * Math.sin(t * 0.4 + eq.x * 10)

    const fontSize = clamp(minDim * 0.018, 12, 22)
    ctx.font = `300 ${fontSize}px "Space Grotesk", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = illumColor(0, 212, 170, breathe)
    ctx.fillText(eq.text, ex, ey)
  }
}

function drawOrbitalShapes(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, t: number,
  mouseX: number, mouseY: number,
): void {
  for (const orb of ORBITAL_SHAPES) {
    const ox = orb.x * W
    const oy = orb.y * H
    const d = dist(mouseX, mouseY, ox, oy)

    // Only render orbital when cursor is nearby (wave function collapse metaphor)
    // Far away: faint hint glow. Close: orbital forms
    const proximity = clamp(1 - d / 250, 0, 1)
    if (proximity < 0.01) {
      // Just a subtle hint
      const hintGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, 25)
      hintGrad.addColorStop(0, illumColor(orb.color[0], orb.color[1], orb.color[2], 0.04))
      hintGrad.addColorStop(1, illumColor(orb.color[0], orb.color[1], orb.color[2], 0))
      ctx.beginPath()
      ctx.arc(ox, oy, 25, 0, Math.PI * 2)
      ctx.fillStyle = hintGrad
      ctx.fill()
      continue
    }

    const baseAlpha = proximity * 0.15
    const particleCount = Math.floor(proximity * (orb.type === 'd' ? 120 : 80))

    if (orb.type === 's') {
      // s-orbital: spherical probability cloud
      for (let i = 0; i < particleCount; i++) {
        const angle = rand(0, Math.PI * 2)
        const r = rand(0, 40) * Math.sqrt(rand(0, 1))
        const px = ox + Math.cos(angle) * r
        const py = oy + Math.sin(angle) * r
        const distFromCenter = r / 40
        ctx.beginPath()
        ctx.arc(px, py, rand(0.5, 1.2), 0, Math.PI * 2)
        ctx.fillStyle = illumColor(orb.color[0], orb.color[1], orb.color[2],
          baseAlpha * (1 - distFromCenter * 0.7))
        ctx.fill()
      }
      // Label
      ctx.font = '400 8px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = illumColor(orb.color[0], orb.color[1], orb.color[2], proximity * 0.25)
      ctx.fillText('1s', ox, oy + 50)
    } else if (orb.type === 'p') {
      // p-orbital: dumbbell (two lobes along vertical axis)
      for (let i = 0; i < particleCount; i++) {
        const lobe = i < particleCount / 2 ? -1 : 1
        const angle = rand(0, Math.PI * 2)
        const r = rand(0, 30) * Math.sqrt(rand(0, 1))
        const px = ox + Math.cos(angle) * r * 0.45
        const py = oy + lobe * 32 + Math.sin(angle) * r * 0.7
        ctx.beginPath()
        ctx.arc(px, py, rand(0.5, 1.0), 0, Math.PI * 2)
        ctx.fillStyle = illumColor(orb.color[0], orb.color[1], orb.color[2],
          baseAlpha * (1 - r / 30 * 0.6))
        ctx.fill()
      }
      // Nodal plane (thin line through center)
      ctx.beginPath()
      ctx.moveTo(ox - 20, oy)
      ctx.lineTo(ox + 20, oy)
      ctx.strokeStyle = illumColor(orb.color[0], orb.color[1], orb.color[2], proximity * 0.08)
      ctx.lineWidth = 0.5
      ctx.stroke()
      ctx.font = '400 8px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = illumColor(orb.color[0], orb.color[1], orb.color[2], proximity * 0.25)
      ctx.fillText('2p', ox, oy + 72)
    } else if (orb.type === 'd') {
      // d-orbital: cloverleaf (4 lobes at 45-degree angles)
      for (let i = 0; i < particleCount; i++) {
        const lobeAngle = Math.floor(rand(0, 4)) * Math.PI / 2 + Math.PI / 4
        const r = rand(5, 28) * Math.sqrt(rand(0, 1))
        const spread = rand(-0.3, 0.3)
        const px = ox + Math.cos(lobeAngle + spread) * r
        const py = oy + Math.sin(lobeAngle + spread) * r
        ctx.beginPath()
        ctx.arc(px, py, rand(0.4, 0.9), 0, Math.PI * 2)
        ctx.fillStyle = illumColor(orb.color[0], orb.color[1], orb.color[2],
          baseAlpha * (1 - r / 28 * 0.5))
        ctx.fill()
      }
      ctx.font = '400 8px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = illumColor(orb.color[0], orb.color[1], orb.color[2], proximity * 0.25)
      ctx.fillText('3d', ox, oy + 40)
    }
  }
}

function drawManifesto(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, t: number,
  minDim: number, alpha: number,
): void {
  // Manifesto lines appear one by one, each taking ~1.5s to fade in
  // Total reveal starts after a short delay when arriving at this level
  manifestoRevealTime += 0.016 // approximately per frame

  const lineDelay = 1.2   // seconds between each line starting to appear
  const fadeDuration = 1.5 // seconds for each line to fully appear

  const centerY = H * 0.42
  const lineHeight = clamp(minDim * 0.035, 20, 36)
  const totalHeight = (MANIFESTO_LINES.length - 1) * lineHeight

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < MANIFESTO_LINES.length; i++) {
    const lineStart = i * lineDelay
    const lineProgress = clamp((manifestoRevealTime - lineStart) / fadeDuration, 0, 1)
    if (lineProgress <= 0) continue

    // Ease in with slight upward drift
    const easedAlpha = lineProgress * lineProgress * (3 - 2 * lineProgress) // smoothstep
    const yDrift = (1 - easedAlpha) * 8

    const fontSize = clamp(minDim * 0.022, 14, 24)
    ctx.font = `italic 300 ${fontSize}px "Space Grotesk", sans-serif`
    ctx.fillStyle = illumColor(232, 232, 240, easedAlpha * 0.85)

    const y = centerY - totalHeight / 2 + i * lineHeight + yDrift
    ctx.fillText(MANIFESTO_LINES[i], W / 2, y)
  }

  // Author attribution (appears after all lines)
  const authorStart = MANIFESTO_LINES.length * lineDelay + 0.5
  const authorProgress = clamp((manifestoRevealTime - authorStart) / fadeDuration, 0, 1)
  if (authorProgress > 0) {
    const easedAuthor = authorProgress * authorProgress
    const authorFontSize = clamp(minDim * 0.014, 10, 15)
    ctx.font = `400 ${authorFontSize}px "JetBrains Mono", monospace`
    ctx.fillStyle = illumColor(196, 164, 74, easedAuthor * 0.6)
    const authorY = centerY + totalHeight / 2 + lineHeight * 1.5 + (1 - easedAuthor) * 6
    ctx.fillText(MANIFESTO_AUTHOR, W / 2, authorY)
  }
}

function drawContactObservables(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, t: number,
  minDim: number, mouseX: number, mouseY: number,
): void {
  if (!contactStates) return
  hoveredContactIdx = -1

  for (let i = 0; i < CONTACTS.length; i++) {
    const contact = CONTACTS[i]
    const cs = contactStates[i]

    // Update orbital angle
    cs.angle += cs.orbitSpeed * 0.016

    // Compute position
    const cx = cs.orbitCenterX * W
    const cy = cs.orbitCenterY * H
    // Elliptical orbit: wider horizontal, compressed vertical
    const rawX = cx + Math.cos(cs.angle) * cs.orbitRadius * W * 0.8
    const rawY = cy + Math.sin(cs.angle) * cs.orbitRadius * H * 0.25

    const dMouse = dist(mouseX, mouseY, rawX, rawY)
    const isHovered = dMouse < 90

    if (isHovered) hoveredContactIdx = i

    // Collapse animation: smoothly transition between superposition and collapsed
    const targetCollapse = isHovered ? 1 : 0
    cs.collapseProgress = lerp(cs.collapseProgress, targetCollapse, 0.08)

    // Typewriter reveal of contact value
    if (isHovered && cs.typewriterChars < contact.value.length) {
      cs.typewriterChars += 0.4 // fractional for smooth reveal timing
    } else if (!isHovered) {
      cs.typewriterChars = Math.max(0, cs.typewriterChars - 1.5)
    }

    const collapse = cs.collapseProgress

    // In superposition: fuzzy, multiple ghost copies
    // Collapsed: sharp, single point
    if (collapse < 0.95) {
      // Draw probability ghost copies (superposition)
      const ghostCount = Math.floor((1 - collapse) * 5) + 1
      for (let g = 0; g < ghostCount; g++) {
        const gx = rawX + (Math.random() - 0.5) * cs.fuzzRadius * (1 - collapse)
        const gy = rawY + (Math.random() - 0.5) * cs.fuzzRadius * (1 - collapse)
        const ghostR = 3 + (1 - collapse) * 2
        ctx.beginPath()
        ctx.arc(gx, gy, ghostR, 0, Math.PI * 2)
        ctx.fillStyle = illumColor(0, 212, 170, (0.08 + collapse * 0.12) / ghostCount * 2)
        ctx.fill()
      }
    }

    // Core particle (always drawn, gets sharper with collapse)
    const coreR = 3.5 + collapse * 2
    const coreAlpha = 0.3 + collapse * 0.6

    // Glow
    const glowR = coreR * (4 - collapse * 2)
    const glowGrad = ctx.createRadialGradient(rawX, rawY, coreR * 0.5, rawX, rawY, glowR)
    glowGrad.addColorStop(0, illumColor(0, 212, 170, coreAlpha * 0.3))
    glowGrad.addColorStop(0.5, illumColor(0, 212, 170, coreAlpha * 0.08))
    glowGrad.addColorStop(1, illumColor(0, 212, 170, 0))
    ctx.beginPath()
    ctx.arc(rawX, rawY, glowR, 0, Math.PI * 2)
    ctx.fillStyle = glowGrad
    ctx.fill()

    // Core
    ctx.beginPath()
    ctx.arc(rawX, rawY, coreR, 0, Math.PI * 2)
    ctx.fillStyle = illumColor(0, 212, 170, coreAlpha)
    ctx.fill()

    // Label (always visible, brighter on hover)
    const labelAlpha = 0.35 + collapse * 0.55
    const labelSize = clamp(minDim * 0.014, 10, 14)
    ctx.font = `500 ${labelSize}px "JetBrains Mono", monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = illumColor(196, 164, 74, labelAlpha)
    ctx.fillText(contact.label, rawX, rawY - 24)

    // Value (typewriter reveal on hover/collapse)
    const visibleChars = Math.floor(cs.typewriterChars)
    if (visibleChars > 0) {
      const shown = contact.value.substring(0, visibleChars)
      const valueSize = clamp(minDim * 0.016, 12, 16)
      ctx.font = `500 ${valueSize}px "JetBrains Mono", monospace`
      ctx.fillStyle = illumColor(0, 212, 170, collapse * 0.85)

      // Cursor blink at end of typewriter
      const cursorVisible = Math.sin(t * 6) > 0 && visibleChars < contact.value.length
      const displayText = shown + (cursorVisible ? '|' : '')
      ctx.fillText(displayText, rawX, rawY + 18)

      // Underline if it's a link
      if (contact.href && collapse > 0.5) {
        const tw = ctx.measureText(shown).width
        ctx.beginPath()
        ctx.moveTo(rawX - tw / 2, rawY + 26)
        ctx.lineTo(rawX + tw / 2, rawY + 26)
        ctx.strokeStyle = illumColor(0, 212, 170, collapse * 0.4)
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }
  }
}

function drawZhouEasterEgg(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, t: number,
  minDim: number,
): void {
  // Slowly drift
  zhouX += zhouVx
  zhouY += zhouVy

  // Gentle wraparound in a small region
  if (zhouX < 0.45 || zhouX > 0.8) zhouVx *= -1
  if (zhouY < 0.2 || zhouY > 0.5) zhouVy *= -1

  const ex = zhouX * W
  const ey = zhouY * H

  // Extremely faint — only visible if you're looking
  const breathe = 0.025 + 0.01 * Math.sin(t * 0.25)
  const fontSize = clamp(minDim * 0.05, 28, 60)
  ctx.font = `300 ${fontSize}px "Space Grotesk", serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = illumColor(196, 164, 74, breathe)
  ctx.fillText(ZHOU_CHAR, ex, ey)
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  W: number, H: number, CX: number, minDim: number,
): void {
  ctx.textAlign = 'center'
  const titleSize = clamp(minDim * 0.022, 12, 20)
  ctx.font = `600 ${titleSize}px "Space Grotesk", sans-serif`
  ctx.fillStyle = illumColor(232, 232, 240, 0.45)
  ctx.fillText('QUANTUM LEVEL', CX, H * 0.06)

  const subSize = clamp(minDim * 0.011, 8, 11)
  ctx.font = `400 ${subSize}px "JetBrains Mono", monospace`
  ctx.fillStyle = illumColor(170, 102, 255, 0.35)
  ctx.fillText('OBSERVE TO COLLAPSE  //  HOVER TO REVEAL', CX, H * 0.06 + 18)
}

// ═════════════════════════════════════════════════════════════════════
//  MAIN DRAW FUNCTION
// ═════════════════════════════════════════════════════════════════════

export function drawLevel4(ctx: CanvasRenderingContext2D, alpha: number): void {
  if (alpha <= 0) return

  // Lazy-init all state
  if (!particles) particles = initParticles()
  if (!waves) waves = initWaves()
  if (!equations) equations = initEquations()
  if (!contactStates) contactStates = initContactStates()

  // Reset manifesto timing on level re-entry
  if (lastDrawTime < 0) {
    lastDrawTime = state.time
    manifestoRevealTime = 0
  }

  const { width: W, height: H, cx: CX, cy: CY, time: t, mouseX, mouseY } = state
  const minDim = Math.min(W, H)

  ctx.save()
  ctx.globalAlpha = alpha

  // ── Background: the void ───────────────────────────────────────────
  ctx.fillStyle = state.lightMode ? 'rgb(242,238,230)' : illumColor(2, 2, 8, 1)
  ctx.fillRect(0, 0, W, H)

  // ── Wave functions (lowest layer) ──────────────────────────────────
  drawWaveFunctions(ctx, W, H, t)

  // ── Quantum particle field ─────────────────────────────────────────
  drawQuantumParticles(ctx, W, H, t, mouseX, mouseY)

  // ── Equation fragments (ghosted physics notation) ──────────────────
  drawEquationFragments(ctx, W, H, t, minDim)

  // ── Orbital shapes (form on cursor proximity) ──────────────────────
  drawOrbitalShapes(ctx, W, H, t, mouseX, mouseY)

  // ── Easter egg: 周 ─────────────────────────────────────────────────
  drawZhouEasterEgg(ctx, W, H, t, minDim)

  // ── Manifesto (center, materializing from the field) ───────────────
  drawManifesto(ctx, W, H, t, minDim, alpha)

  // ── Contact observables (orbiting near bottom) ─────────────────────
  drawContactObservables(ctx, W, H, t, minDim, mouseX, mouseY)

  // ── Header ─────────────────────────────────────────────────────────
  drawHeader(ctx, W, H, CX, minDim)

  // Central Dogma indicator
  ctx.save()
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.font = '400 9px "JetBrains Mono", monospace'
  ctx.fillStyle = illumColor(196, 164, 74, 0.3)
  ctx.fillText('◈ PHENOTYPE — OBSERVABLE FUNCTION', W * 0.97, H * 0.92)
  ctx.restore()

  ctx.restore()
}

// ═════════════════════════════════════════════════════════════════════
//  PUBLIC API: hovered contact
// ═════════════════════════════════════════════════════════════════════

export function getHoveredContact(): typeof CONTACTS[number] | null {
  if (hoveredContactIdx < 0 || hoveredContactIdx >= CONTACTS.length) return null
  return CONTACTS[hoveredContactIdx]
}

/**
 * Reset internal animation state.
 * Call this when transitioning TO this level so the manifesto
 * re-materializes from scratch.
 */
export function resetLevel4(): void {
  manifestoRevealTime = 0
  lastDrawTime = -1
  if (contactStates) {
    for (const cs of contactStates) {
      cs.collapseProgress = 0
      cs.typewriterChars = 0
    }
  }
}
