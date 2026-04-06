import { state } from './state'

const frameTimes: number[] = []
let detected = false

export function detectQuality(dt: number): void {
  if (detected) return
  frameTimes.push(dt)

  if (frameTimes.length >= 20) {
    const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
    const badge = document.getElementById('quality-badge')

    if (avg > 0.033) {
      // <30fps — low tier
      state.qualityTier = 'low'
      if (badge) {
        badge.textContent = '\u26a1 STATIC MODE'
        badge.classList.add('visible')
      }
    } else if (avg > 0.020) {
      // 30-50fps — medium tier
      state.qualityTier = 'medium'
    } else {
      state.qualityTier = 'high'
    }

    detected = true
  }
}

export function getParticleCount(base: number): number {
  switch (state.qualityTier) {
    case 'high': return base
    case 'medium': return Math.floor(base * 0.4)
    case 'low': return Math.floor(base * 0.1)
  }
}
