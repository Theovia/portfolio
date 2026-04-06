/** Global application state — single source of truth */

export interface AppState {
  currentLevel: number
  targetLevel: number
  transitionProgress: number
  isTransitioning: boolean
  mouseX: number
  mouseY: number
  time: number
  width: number
  height: number
  cx: number
  cy: number
  dpr: number
  illumination: number
  soundEnabled: boolean
  lightMode: boolean
  qualityTier: 'high' | 'medium' | 'low'
  detailPanelOpen: boolean
}

export const state: AppState = {
  currentLevel: 0,
  targetLevel: 0,
  transitionProgress: 0,
  isTransitioning: false,
  mouseX: -999,
  mouseY: -999,
  time: 0,
  width: window.innerWidth,
  height: window.innerHeight,
  cx: window.innerWidth / 2,
  cy: window.innerHeight / 2,
  dpr: Math.min(window.devicePixelRatio || 1, 2),
  illumination: 100,
  soundEnabled: false,
  lightMode: false,
  qualityTier: 'high',
  detailPanelOpen: false,
}

export const ZOOM_LABELS = ['1x', '10x', '100x', '1000x', '10000x']
export const SCALE_LABELS = ['500 \u00b5m', '50 \u00b5m', '5 \u00b5m', '500 nm', '50 nm']
export const MAG_FILLS = [5, 25, 50, 75, 100]

// Transition durations decrease as you go deeper (accelerating rhythm)
export const TRANSITION_DURATIONS = [0, 1.2, 0.8, 0.6, 0.4]

export function updateDimensions() {
  state.width = window.innerWidth
  state.height = window.innerHeight
  state.cx = state.width / 2
  state.cy = state.height / 2
  state.dpr = Math.min(window.devicePixelRatio || 1, 2)
}
