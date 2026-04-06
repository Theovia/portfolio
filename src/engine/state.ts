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
  // Fluorescence channels (real microscopy: DAPI=DNA, GFP=proteins, TRITC=membranes)
  channels: {
    dapi: boolean   // 405nm excitation, blue emission — marks DNA/nuclei
    gfp: boolean    // 488nm excitation, green emission — marks proteins/cytoskeleton
    tritc: boolean  // 561nm excitation, red emission — marks membranes/mitochondria
    bf: boolean     // Brightfield (transmitted light, grayscale)
  }
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
  channels: {
    dapi: true,    // blue — DNA/nuclei ON by default
    gfp: true,     // green — proteins ON by default
    tritc: true,   // red — membranes ON by default
    bf: false,     // brightfield OFF by default
  },
}

// Real microscope objective magnifications
export const ZOOM_LABELS = ['4x', '10x', '40x', '100x', '100x oil']
export const SCALE_LABELS = ['500 \u00b5m', '100 \u00b5m', '25 \u00b5m', '2 \u00b5m', '200 nm']
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
