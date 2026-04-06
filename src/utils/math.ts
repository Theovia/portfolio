export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

export function easeOutBack(t: number, overshoot = 1.70158): number {
  return 1 + (overshoot + 1) * (t - 1) ** 3 + overshoot * (t - 1) ** 2
}

// Simplex-like noise (fast 2D hash noise for Canvas 2D use)
export function hashNoise(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

// Smooth noise with interpolation
export function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy

  const a = hashNoise(ix, iy)
  const b = hashNoise(ix + 1, iy)
  const c = hashNoise(ix, iy + 1)
  const d = hashNoise(ix + 1, iy + 1)

  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)

  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy)
}

// Fractal Brownian Motion (2 octaves for organic movement)
export function fbm(x: number, y: number, octaves = 3): number {
  let value = 0
  let amplitude = 0.5
  let frequency = 1

  for (let i = 0; i < octaves; i++) {
    value += amplitude * smoothNoise(x * frequency, y * frequency)
    amplitude *= 0.5
    frequency *= 2
  }
  return value
}

/** Apply cursor force to a particle (repulsion close, swirl far) */
export function applyMouseForce(
  px: number, py: number, pvx: number, pvy: number,
  mx: number, my: number,
): { vx: number; vy: number } {
  if (mx < 0) return { vx: pvx, vy: pvy }
  const dx = px - mx
  const dy = py - my
  const d = Math.sqrt(dx * dx + dy * dy)

  if (d < 100 && d > 1) {
    const force = ((100 - d) / 100) * 0.0008
    pvx += (dx / d) * force
    pvy += (dy / d) * force
  } else if (d < 200 && d >= 100) {
    const force = ((200 - d) / 200) * 0.0002
    pvx -= (dy / d) * force
    pvy += (dx / d) * force
  }
  return { vx: pvx, vy: pvy }
}
