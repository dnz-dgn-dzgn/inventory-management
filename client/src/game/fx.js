// Particles, floating text and screen shake. State-only helpers, no DOM.
const MAX_PARTICLES = 320

export function addShake(s, amount) {
  if (!s.reducedMotion) s.shake = Math.max(s.shake, amount)
}

/** kind: card | paper | spark | smoke. Reduced motion keeps only a quarter of the particles. */
export function burst(s, rng, x, y, n, kind, speed = 3) {
  const count = s.reducedMotion ? Math.ceil(n * 0.25) : n
  for (let i = 0; i < count && s.particles.length < MAX_PARTICLES; i++) {
    const a = rng() * Math.PI * 2
    const v = (0.4 + rng()) * speed
    const life = 25 + Math.floor(rng() * 25)
    s.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 0.8, life, max: life, size: 2 + Math.floor(rng() * 4), kind, c: rng() < 0.5 ? 0 : 1 })
  }
}

/** Floating text. Give either `text` (raw) or `key` + `params` (translated by the renderer). */
export function popup(s, x, y, o) {
  if (s.popups.length > 24) s.popups.shift()
  const life = o.life || 60
  s.popups.push({ x, y, life, max: life, text: o.text, key: o.key, params: o.params, kind: o.kind || 'score' })
}

export function updateFx(s) {
  for (const p of s.particles) {
    p.x += p.vx
    p.y += p.vy
    p.vy += p.kind === 'smoke' ? -0.02 : 0.12
    p.vx *= 0.97
    p.life--
  }
  s.particles = s.particles.filter((p) => p.life > 0)
  for (const t of s.popups) {
    t.y -= 0.45
    t.life--
  }
  s.popups = s.popups.filter((t) => t.life > 0)
  s.shake = s.shake < 0.2 ? 0 : s.shake * 0.86
  if (s.hurtFlash > 0) s.hurtFlash--
}
