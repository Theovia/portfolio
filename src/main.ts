// ═══════════════════════════════════════════════════════════════════
//  MAIN.TS — Scene Orchestrator
//  The brain of the microscope portfolio. Initializes canvas, manages
//  the render loop, handles all input, orchestrates GSAP transitions
//  between 5 zoom levels, and wires UI panels.
// ═══════════════════════════════════════════════════════════════════

import './styles/main.css'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import {
  state,
  updateDimensions,
  ZOOM_LABELS,
  SCALE_LABELS,
  MAG_FILLS,
  TRANSITION_DURATIONS,
} from './engine/state'
import { detectQuality } from './engine/QualityDetector'
import { easeInOutCubic } from './utils/math'

// ── Level draw functions (created by other agents) ──────────────
import { drawLevel0 } from './levels/Level0Macro'
import { drawLevel1, getHoveredOrganelle } from './levels/Level1Organelles'
import { drawLevel2 } from './levels/Level2Timeline'
import { drawLevel3, getHoveredAtom } from './levels/Level3Atomic'
import { drawLevel4, getHoveredContact } from './levels/Level4Quantum'

// ── Case study renderers ────────────────────────────────────────
import { renderFarmaciaCaseStudy } from './case-studies/farmacia'
import { renderEigenMedicalCaseStudy } from './case-studies/eigen-medical'

gsap.registerPlugin(ScrollTrigger)

// ═══════════════════════════════════════════════════════════════════
//  1. CANVAS SETUP
// ═══════════════════════════════════════════════════════════════════

const canvas = document.getElementById('bio-canvas') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!

function resize(): void {
  const dpr = state.dpr
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  updateDimensions()
}

resize()
window.addEventListener('resize', resize)

// ═══════════════════════════════════════════════════════════════════
//  2. LOADING SCREEN
// ═══════════════════════════════════════════════════════════════════

const loadingScreen = document.getElementById('loading-screen')

document.fonts.ready.then(() => {
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden')
      setTimeout(() => {
        loadingScreen.style.display = 'none'
      }, 800)
    }
  }, 600)
})

// ═══════════════════════════════════════════════════════════════════
//  3. CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════════════

const cursorEl = document.getElementById('cursor-svg') as HTMLElement | null

let prevMouseX = 0
let prevMouseY = 0
let cursorRotation = 0

function updateCursorTransform(x: number, y: number): void {
  if (!cursorEl) return

  // Velocity-based rotation for physical feel
  const dx = x - prevMouseX
  const dy = y - prevMouseY
  const velocity = Math.sqrt(dx * dx + dy * dy)

  if (velocity > 0.5) {
    const targetRotation = Math.atan2(dy, dx) * (180 / Math.PI)
    // Smooth interpolation toward velocity direction, damped
    cursorRotation += (targetRotation - cursorRotation) * 0.08
  }

  cursorEl.style.left = `${x}px`
  cursorEl.style.top = `${y}px`
  cursorEl.style.transform = `translate(-50%, -50%) rotate(${cursorRotation}deg)`

  prevMouseX = x
  prevMouseY = y
}

document.addEventListener('mousemove', (e: MouseEvent) => {
  state.mouseX = e.clientX
  state.mouseY = e.clientY
  updateCursorTransform(e.clientX, e.clientY)
  if (cursorEl) cursorEl.classList.remove('hidden')
})

document.addEventListener('mouseleave', () => {
  if (cursorEl) cursorEl.classList.add('hidden')
  state.mouseX = -999
  state.mouseY = -999
})

// Touch: update mouse position for level interactions
window.addEventListener('touchstart', (e: TouchEvent) => {
  state.mouseX = e.touches[0].clientX
  state.mouseY = e.touches[0].clientY
}, { passive: true })

window.addEventListener('touchmove', (e: TouchEvent) => {
  state.mouseX = e.touches[0].clientX
  state.mouseY = e.touches[0].clientY
}, { passive: true })

// ═══════════════════════════════════════════════════════════════════
//  4. ZOOM NAVIGATION
// ═══════════════════════════════════════════════════════════════════

const transFlash = document.getElementById('transition-flash')
let targetLevel = 0

function setZoomLevel(level: number): void {
  if (level < 0 || level > 4 || level === state.currentLevel || state.isTransitioning) return

  targetLevel = level
  state.targetLevel = level
  state.isTransitioning = true
  state.transitionProgress = 0

  // Subtle flash on transition
  if (transFlash) {
    gsap.fromTo(transFlash, { opacity: 0.15 }, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  // Close detail panel on transition start
  closeDetailPanel()

  // GSAP transition — durations decrease as you go deeper (building momentum)
  const duration = TRANSITION_DURATIONS[level] || 0.8
  const ease = level <= 2 ? 'power2.inOut' : 'power3.in'

  gsap.to(state, {
    transitionProgress: 1,
    duration,
    ease,
    onComplete: () => {
      state.currentLevel = targetLevel
      state.targetLevel = targetLevel
      state.isTransitioning = false
      state.transitionProgress = 0
      updateUI()
    },
  })
}

// ── Scroll (wheel) handler with accumulator ─────────────────────

const SCROLL_THRESHOLD = 120
let scrollAccum = 0

window.addEventListener('wheel', (e: WheelEvent) => {
  e.preventDefault()
  if (state.isTransitioning) return

  scrollAccum += e.deltaY
  if (Math.abs(scrollAccum) > SCROLL_THRESHOLD) {
    if (scrollAccum > 0 && state.currentLevel < 4) {
      setZoomLevel(state.currentLevel + 1)
    } else if (scrollAccum < 0 && state.currentLevel > 0) {
      setZoomLevel(state.currentLevel - 1)
    }
    scrollAccum = 0
  }
}, { passive: false })

// ── Touch handler: swipe up = zoom in, swipe down = zoom out ────

let touchStartY = 0
let touchStartX = 0
let touchStartTime = 0

window.addEventListener('touchstart', (e: TouchEvent) => {
  touchStartY = e.touches[0].clientY
  touchStartX = e.touches[0].clientX
  touchStartTime = Date.now()
}, { passive: true })

window.addEventListener('touchend', (e: TouchEvent) => {
  const dy = touchStartY - e.changedTouches[0].clientY
  const dx = touchStartX - e.changedTouches[0].clientX
  const dt = Date.now() - touchStartTime

  // Tap detection (for clicks on levels with interactive elements)
  if (dt < 300 && Math.abs(dy) < 15 && Math.abs(dx) < 15) {
    state.mouseX = e.changedTouches[0].clientX
    state.mouseY = e.changedTouches[0].clientY
    handleCanvasClick()
    return
  }

  // Swipe threshold: 40px vertical, vertical dominant
  if (Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx)) {
    if (dy > 0 && state.currentLevel < 4) setZoomLevel(state.currentLevel + 1)
    else if (dy < 0 && state.currentLevel > 0) setZoomLevel(state.currentLevel - 1)
  }
}, { passive: true })

// ── Keyboard navigation ─────────────────────────────────────────

window.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
    e.preventDefault()
    if (state.currentLevel < 4) setZoomLevel(state.currentLevel + 1)
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
    e.preventDefault()
    if (state.currentLevel > 0) setZoomLevel(state.currentLevel - 1)
  } else if (e.key >= '1' && e.key <= '5') {
    setZoomLevel(parseInt(e.key) - 1)
  } else if (e.key === 'Escape') {
    if (caseStudyOverlay && caseStudyOverlay.style.display !== 'none') {
      closeCaseStudy()
    } else {
      closeDetailPanel()
    }
  }
})

// ── Zoom dots (created dynamically) ─────────────────────────────

const zoomStepsContainer = document.getElementById('zoom-steps')
const zoomDots: HTMLElement[] = []

if (zoomStepsContainer) {
  for (let i = 0; i < 5; i++) {
    // Connector before each dot (except the first)
    if (i > 0) {
      const connector = document.createElement('div')
      connector.className = 'zoom-connector'
      zoomStepsContainer.appendChild(connector)
    }

    const dot = document.createElement('div')
    dot.className = 'zoom-dot'
    if (i === 0) dot.classList.add('active')
    dot.dataset.level = String(i)

    dot.addEventListener('click', () => {
      // Playful scale animation on click (elastic ease)
      gsap.fromTo(dot, { scale: 0.5 }, {
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)',
      })
      setZoomLevel(i)
    })

    zoomStepsContainer.appendChild(dot)
    zoomDots.push(dot)
  }
}

// ═══════════════════════════════════════════════════════════════════
//  5. UI UPDATES
// ═══════════════════════════════════════════════════════════════════

const magValue = document.getElementById('mag-value')
const magBarFill = document.getElementById('mag-bar-fill')
const scaleText = document.getElementById('scale-text')
const navHint = document.getElementById('nav-hint')

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

function updateUI(): void {
  const level = state.currentLevel

  if (magValue) magValue.textContent = ZOOM_LABELS[level]
  if (magBarFill) magBarFill.style.width = `${MAG_FILLS[level]}%`
  if (scaleText) scaleText.textContent = SCALE_LABELS[level]

  // Zoom dot active states
  for (let i = 0; i < zoomDots.length; i++) {
    zoomDots[i].classList.toggle('active', i === level)
  }

  // Context-aware nav hint
  if (navHint) {
    const action = isTouchDevice ? 'SWIPE' : 'SCROLL'
    if (level === 0) {
      navHint.textContent = `${action} TO ZOOM IN`
    } else if (level === 4) {
      navHint.textContent = `${action} TO ZOOM OUT`
    } else {
      navHint.textContent = `${action} TO CHANGE MAGNIFICATION`
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
//  6. DETAIL PANEL
// ═══════════════════════════════════════════════════════════════════

const detailPanel = document.getElementById('detail-panel')
const detailTitle = document.getElementById('detail-title')
const detailSubtitle = document.getElementById('detail-subtitle')
const detailMetrics = document.getElementById('detail-metrics')
const detailBody = document.getElementById('detail-body')
const detailStack = document.getElementById('detail-stack')
const detailDeepDive = document.getElementById('detail-deepdive') as HTMLButtonElement | null
const detailClose = document.getElementById('detail-close')

interface DetailData {
  title: string
  subtitle: string
  metrics?: { label: string; value: string }[]
  description?: string
  body?: string
  stack?: string[]
  projectId?: string
  tier?: 1 | 2
}

let currentDetailProjectId: string | null = null

function openDetailPanel(data: DetailData): void {
  if (!detailPanel) return

  if (detailTitle) detailTitle.textContent = data.title
  if (detailSubtitle) detailSubtitle.textContent = data.subtitle

  // Metrics grid
  if (detailMetrics) {
    detailMetrics.textContent = ''
    if (data.metrics && data.metrics.length > 0) {
      for (const metric of data.metrics) {
        const card = document.createElement('div')
        card.className = 'metric-card'

        const val = document.createElement('div')
        val.className = 'metric-value'
        val.textContent = metric.value

        const label = document.createElement('div')
        label.className = 'metric-label'
        label.textContent = metric.label

        card.appendChild(val)
        card.appendChild(label)
        detailMetrics.appendChild(card)
      }
    }
  }

  // Body text (safe: uses textContent, never innerHTML)
  if (detailBody) {
    detailBody.textContent = data.description || data.body || ''
  }

  // Stack tags
  if (detailStack) {
    detailStack.textContent = ''
    if (data.stack && data.stack.length > 0) {
      for (const tech of data.stack) {
        const tag = document.createElement('span')
        tag.className = 'stack-tag'
        tag.textContent = tech
        detailStack.appendChild(tag)
      }
    }
  }

  // Deep dive button — only for tier 1 projects
  currentDetailProjectId = data.projectId || null
  if (detailDeepDive) {
    if (data.tier === 1 && data.projectId) {
      detailDeepDive.style.display = 'block'
    } else {
      detailDeepDive.style.display = 'none'
    }
  }

  detailPanel.classList.add('open')
  state.detailPanelOpen = true
}

function closeDetailPanel(): void {
  if (detailPanel) detailPanel.classList.remove('open')
  state.detailPanelOpen = false
  currentDetailProjectId = null
}

if (detailClose) {
  detailClose.addEventListener('click', closeDetailPanel)
}

if (detailDeepDive) {
  detailDeepDive.addEventListener('click', () => {
    const projectId = currentDetailProjectId
    if (projectId) {
      closeDetailPanel()
      openCaseStudy(projectId)
    }
  })
}

// ═══════════════════════════════════════════════════════════════════
//  7. CASE STUDY OVERLAY
// ═══════════════════════════════════════════════════════════════════

const caseStudyOverlay = document.getElementById('case-study-overlay')
const caseStudyContent = document.getElementById('case-study-content')
const caseStudyClose = document.getElementById('case-study-close')

const caseStudyRenderers: Record<string, () => string> = {
  'farmacia-erp': renderFarmaciaCaseStudy,
  'eigen-medical': renderEigenMedicalCaseStudy,
}

function openCaseStudy(projectId: string): void {
  if (!caseStudyOverlay || !caseStudyContent) return

  const renderer = caseStudyRenderers[projectId]
  if (!renderer) return

  // Case study content is authored by us (static strings), not user input.
  // Safe to use DOM parsing here for rich formatting.
  const rendered = renderer()
  const parser = new DOMParser()
  const doc = parser.parseFromString(rendered, 'text/html')
  caseStudyContent.textContent = ''
  while (doc.body.firstChild) {
    caseStudyContent.appendChild(doc.body.firstChild)
  }

  caseStudyOverlay.style.display = 'block'

  // Animate in
  gsap.fromTo(caseStudyOverlay,
    { opacity: 0 },
    { opacity: 1, duration: 0.4, ease: 'power2.out' },
  )
}

function closeCaseStudy(): void {
  if (!caseStudyOverlay) return

  gsap.to(caseStudyOverlay, {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in',
    onComplete: () => {
      caseStudyOverlay.style.display = 'none'
    },
  })
}

if (caseStudyClose) {
  caseStudyClose.addEventListener('click', closeCaseStudy)
}

// ═══════════════════════════════════════════════════════════════════
//  8. CANVAS CLICK HANDLING
// ═══════════════════════════════════════════════════════════════════

function handleCanvasClick(): void {
  if (state.isTransitioning) return

  switch (state.currentLevel) {
    case 1: {
      const hovered = getHoveredOrganelle()
      if (hovered) {
        openDetailPanel({
          title: hovered.detail.title,
          subtitle: hovered.detail.subtitle,
          metrics: hovered.detail.metrics,
          description: hovered.detail.description,
          stack: hovered.detail.stack,
          projectId: hovered.id,
          tier: hovered.tier,
        })
      }
      break
    }
    case 3: {
      const atom = getHoveredAtom()
      if (atom) {
        openDetailPanel({
          title: atom.name,
          subtitle: `${atom.symbol} // ${atom.category.toUpperCase()}`,
          description: atom.description,
          stack: atom.projects,
        })
      }
      break
    }
    case 4: {
      const contact = getHoveredContact()
      if (contact && contact.href) {
        window.open(contact.href, '_blank')
      }
      break
    }
  }
}

canvas.addEventListener('click', (e: MouseEvent) => {
  state.mouseX = e.clientX
  state.mouseY = e.clientY
  handleCanvasClick()
})

// ═══════════════════════════════════════════════════════════════════
//  9. TOOLBAR
// ═══════════════════════════════════════════════════════════════════

// ── Theme toggle ────────────────────────────────────────────────

const themeBtn = document.getElementById('theme-btn')
const vignetteEl = document.getElementById('vignette')

const darkTheme: Record<string, string> = {
  '--bg-void': '#060610',
  '--bg-primary': '#0a0a12',
  '--cyan': '#00d4aa',
  '--cyan-dim': '#00d4aa66',
  '--cyan-glow': '#00d4aa33',
  '--gold': '#c4a44a',
  '--gold-dim': '#c4a44a88',
  '--white': '#e8e8f0',
  '--white-dim': '#e8e8f066',
  '--text-muted': '#5a5a72',
}

const lightTheme: Record<string, string> = {
  '--bg-void': '#f4f1eb',
  '--bg-primary': '#faf8f4',
  '--cyan': '#1a6b5a',
  '--cyan-dim': '#1a6b5a55',
  '--cyan-glow': '#1a6b5a22',
  '--gold': '#8b6914',
  '--gold-dim': '#8b691466',
  '--white': '#1a1a2e',
  '--white-dim': '#1a1a2e88',
  '--text-muted': '#8a8a9a',
}

const darkVignetteStyle =
  'radial-gradient(ellipse 55% 55% at 50% 50%, transparent 0%, transparent 60%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.95) 95%, #000 100%)'
const lightVignetteStyle =
  'radial-gradient(ellipse 55% 55% at 50% 50%, transparent 0%, transparent 55%, rgba(180,170,155,0.05) 62%, rgba(170,160,145,0.12) 68%, rgba(160,150,135,0.2) 73%, rgba(140,130,115,0.32) 78%, rgba(120,112,98,0.46) 83%, rgba(95,88,75,0.6) 88%, rgba(70,65,55,0.76) 93%, rgba(50,46,38,0.9) 97%, #3a3530 100%)'

function applyTheme(isLight: boolean): void {
  state.lightMode = isLight
  const theme = isLight ? lightTheme : darkTheme
  const root = document.documentElement

  for (const key in theme) {
    root.style.setProperty(key, theme[key])
  }
  document.body.style.background = theme['--bg-void']

  // Vignette
  if (vignetteEl) {
    vignetteEl.style.background = isLight ? lightVignetteStyle : darkVignetteStyle
  }

  // Toolbar button backgrounds
  const toolbarBtns = document.querySelectorAll<HTMLElement>('.toolbar-btn')
  const btnBg = isLight ? 'rgba(244,241,235,0.6)' : 'rgba(6,6,16,0.6)'
  toolbarBtns.forEach((btn) => { btn.style.background = btnBg })

  // Detail panel background
  if (detailPanel) {
    detailPanel.style.background = isLight
      ? 'linear-gradient(135deg, rgba(250,248,244,0.97), rgba(244,241,235,0.99))'
      : 'linear-gradient(135deg, rgba(10,10,18,0.97), rgba(6,6,16,0.99))'
  }

  // Cursor SVG color
  if (cursorEl) {
    const cc = isLight ? '#5a4a20' : '#c4a44a'
    cursorEl.querySelectorAll('circle, line').forEach((el) => {
      if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none') {
        el.setAttribute('fill', cc)
      }
      if (el.getAttribute('stroke')) {
        el.setAttribute('stroke', cc)
      }
    })
  }

  // Button label
  if (themeBtn) themeBtn.textContent = isLight ? '\u2600\uFE0F' : '\uD83D\uDD2C'
}

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    applyTheme(!state.lightMode)
  })
}

// Smooth CSS transitions for theme switching
document.documentElement.style.transition = 'background 0.5s ease, color 0.5s ease'
document.body.style.transition = 'background 0.5s ease, color 0.5s ease'

// ── Sound toggle ────────────────────────────────────────────────

const soundBtn = document.getElementById('sound-btn')

if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled
    if (state.soundEnabled) {
      soundBtn.textContent = '\uD83D\uDD0A'
      soundBtn.classList.remove('muted')
      soundBtn.classList.add('active')
    } else {
      soundBtn.textContent = '\uD83D\uDD07'
      soundBtn.classList.add('muted')
      soundBtn.classList.remove('active')
    }
  })
}

// ── Screenshot ──────────────────────────────────────────────────

const screenshotBtn = document.getElementById('screenshot-btn')

if (screenshotBtn) {
  screenshotBtn.addEventListener('click', () => {
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tCtx = tempCanvas.getContext('2d')!
    tCtx.drawImage(canvas, 0, 0)

    // Watermark
    tCtx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0)
    tCtx.font = '600 14px "Space Grotesk", sans-serif'
    tCtx.fillStyle = 'rgba(196,164,74,0.5)'
    tCtx.textAlign = 'right'
    tCtx.fillText(
      `R. ZHOU \u2014 ${ZOOM_LABELS[state.currentLevel]}`,
      state.width - 16,
      state.height - 16,
    )

    // Download
    const link = document.createElement('a')
    link.download = `raul-zhou-${ZOOM_LABELS[state.currentLevel]}.png`
    link.href = tempCanvas.toDataURL('image/png')
    link.click()
  })
}

// ═══════════════════════════════════════════════════════════════════
//  10. LEVEL DRAW DISPATCHER
// ═══════════════════════════════════════════════════════════════════

type DrawFn = (ctx: CanvasRenderingContext2D, alpha: number) => void

const levelDrawers: DrawFn[] = [
  drawLevel0,
  drawLevel1,
  drawLevel2,
  drawLevel3,
  drawLevel4,
]

// ═══════════════════════════════════════════════════════════════════
//  11. RENDER LOOP
// ═══════════════════════════════════════════════════════════════════

let lastTime = 0

function render(timestamp: number): void {
  requestAnimationFrame(render)

  // Delta time in seconds (clamped to avoid spiral-of-death on tab switch)
  const dt = lastTime === 0 ? 0.016 : Math.min((timestamp - lastTime) / 1000, 0.1)
  lastTime = timestamp

  // Advance global time
  state.time += dt

  // Auto-detect quality tier during first 20 frames
  detectQuality(dt)

  // Clear canvas
  ctx.clearRect(0, 0, state.width, state.height)

  if (!state.isTransitioning) {
    // ── Steady state: draw current level at full opacity ──────
    levelDrawers[state.currentLevel](ctx, 1.0)
  } else {
    // ── Transitioning: crossfade between current and target ──
    const rawProgress = state.transitionProgress
    const easedProgress = easeInOutCubic(rawProgress)

    // Draw outgoing level, fading out
    const outAlpha = 1 - easedProgress
    if (outAlpha > 0.01) {
      levelDrawers[state.currentLevel](ctx, outAlpha)
    }

    // Draw incoming level, fading in
    const inAlpha = easedProgress
    if (inAlpha > 0.01) {
      levelDrawers[targetLevel](ctx, inAlpha)
    }
  }
}

// Kick off the loop
requestAnimationFrame(render)

// Initial UI state
updateUI()
