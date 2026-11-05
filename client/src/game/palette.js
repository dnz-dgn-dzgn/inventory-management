// Canvas palette: a fixed arcade palette, tinted by the active theme tokens.
// This is the only place hex colours are allowed.
const FALLBACK = {
  '--ink': '#0f172a', '--muted': '#64748b', '--line': '#e2e8f0', '--surface': '#ffffff',
  '--surface-subtle': '#f8fafc', '--accent': '#3b82f6', '--danger': '#ef4444', '--success': '#10b981', '--warning': '#f59e0b'
}

const ARCADE = {
  cardboard: '#c98f45', cardboardDark: '#8a5a24', cardboardLight: '#e5b46c', tape: '#f2e3b3',
  forklift: '#ffc21a', forkliftDark: '#c78a00', black: '#14110f', white: '#fbf6e9', steel: '#8b95a1', steelDark: '#4d5560',
  skin: '#f0b98d', paper: '#fbf6e9', shield: '#3a8f5c'
}

export function parseColor(str) {
  const s = String(str || '').trim()
  let m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s)
  if (m) {
    let h = m[1]
    if (h.length === 3) h = h.split('').map((c) => c + c).join('')
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
  }
  m = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/i.exec(s)
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])]
  return null
}

const lum = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
const hex = (rgb) => '#' + rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t)

/** Read tokens from :root (safe to call without a DOM: returns fallbacks). */
export function readPalette(root) {
  const read = (name) => {
    let v = ''
    try {
      if (root && typeof getComputedStyle === 'function') v = getComputedStyle(root).getPropertyValue(name)
    } catch { /* ignore */ }
    return parseColor(v) ? v.trim() : FALLBACK[name]
  }
  const ink = parseColor(read('--ink'))
  const surface = parseColor(read('--surface'))
  // The playfield is always dark: take whichever of ink/surface is darker, then deepen it.
  const dark = lum(ink) < lum(surface) ? ink : surface
  const light = lum(ink) < lum(surface) ? surface : ink
  const bg = mix(dark, [8, 8, 12], 0.45)
  return {
    ...ARCADE,
    bg: hex(bg),
    bgMid: hex(mix(bg, light, 0.1)),
    rack: hex(mix(bg, light, 0.2)),
    rack2: hex(mix(bg, light, 0.3)),
    floor: hex(mix(bg, [255, 194, 26], 0.12)),
    hazard: ARCADE.forklift,
    text: hex(mix(light, [255, 255, 255], 0.5)),
    textDim: hex(mix(bg, light, 0.7)),
    high: read('--danger'),
    medium: read('--warning'),
    low: read('--accent'),
    good: read('--success'),
    accent: read('--accent'),
    danger: read('--danger')
  }
}
