// Centre-based axis-aligned boxes: { x, y, w, h } where x/y is the centre.
export function aabb(a, b) {
  return Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
