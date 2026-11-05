// Pure wave / enemy definitions. No DOM.
import { crateValue } from './scoring.js'
import { clamp } from './collision.js'

export const CRATE = { w: 74, h: 48, gapX: 80, gapY: 54 }

// Used when the API fails or returns nothing. Same shape as /api/backlog.
export const SAMPLE_BACKLOG = [
  { id: 's1', order_id: 'SAMPLE-1', item_sku: 'FLT-405', item_name: 'Oil Filter Cartridge', quantity_needed: 1200, quantity_available: 850, days_delayed: 3, priority: 'medium' },
  { id: 's2', order_id: 'SAMPLE-2', item_sku: 'MTR-304', item_name: 'Electric Motor 5HP', quantity_needed: 45, quantity_available: 35, days_delayed: 2, priority: 'high' },
  { id: 's3', order_id: 'SAMPLE-3', item_sku: 'BRG-210', item_name: 'Ball Bearing Set', quantity_needed: 400, quantity_available: 225, days_delayed: 5, priority: 'high' },
  { id: 's4', order_id: 'SAMPLE-4', item_sku: 'VLV-118', item_name: 'Pressure Valve', quantity_needed: 90, quantity_available: 10, days_delayed: 1, priority: 'low' }
]

/** Backlog items -> enemy types. `translate` maps an item name to the display label. */
export function makeTypes(backlog, translate = (s) => s) {
  const list = Array.isArray(backlog) ? backlog : []
  const types = []
  for (const item of list) {
    if (!item || !item.item_sku) continue
    const shortage = Math.max(0, Number(item.quantity_needed) - Number(item.quantity_available)) || 0
    const days = clamp(Number(item.days_delayed) || 0, 0, 10)
    const hp = clamp(Math.round(shortage / 40), 2, 12)
    types.push({
      id: String(item.id ?? item.item_sku),
      sku: String(item.item_sku),
      name: String(item.item_name || item.item_sku), // untranslated, so the label can be refreshed on locale change
      shortage,
      label: translate(String(item.item_name || item.item_sku)),
      hp,
      days,
      drift: days * 0.004, // extra px/tick of descent: long-delayed items sag faster
      priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'low',
      value: crateValue(hp)
    })
  }
  return types
}

export const BONUS = {
  email: { w: 32, h: 20, hp: 1, vx: 3.4, value: 300 },
  invite: { w: 38, h: 32, hp: 2, vx: 1.5, value: 500 },
  inviteSmall: { w: 24, h: 22, hp: 1, vx: 2.1, value: 200 }, // spawned when an invite splits
  forecast: { w: 40, h: 28, hp: 3, vx: 1.3, value: 800 }
}

// hpMul scales crate hp; sway = px/tick sideways; descend = px/tick down; fire = chance/tick an enemy shoots.
export const WAVES = [
  { id: 'monday', rows: 2, cols: 4, hpMul: 0.35, sway: 0.45, descend: 0.07, fire: 0, bonus: [], drop: 0.25 },
  { id: 'monthEnd', rows: 3, cols: 5, hpMul: 0.6, sway: 0.7, descend: 0.1, fire: 0.0025, bonus: [{ kind: 'email', every: 420 }], drop: 0.15 },
  { id: 'quiet', rows: 4, cols: 5, gaps: true, hpMul: 0.8, sway: 0.8, descend: 0.11, fire: 0.004, bonus: [{ kind: 'invite', every: 500 }], drop: 0.17 },
  { id: 'blackFriday', rows: 4, cols: 5, hpMul: 0.9, sway: 1.0, descend: 0.12, fire: 0.006, bonus: [{ kind: 'email', every: 260 }, { kind: 'forecast', every: 600 }], drop: 0.15 },
  { id: 'yearEnd', rows: 5, cols: 5, hpMul: 1.0, sway: 1.1, descend: 0.13, fire: 0.007, bonus: [{ kind: 'email', every: 320 }, { kind: 'invite', every: 480 }, { kind: 'forecast', every: 520 }], drop: 0.14 }
]
export const BOSS = { id: 'auditor', hp: 70, w: 124, h: 104, value: 50000 }
export const TOTAL_WAVES = WAVES.length + 1

export const POWERUPS = {
  coffee: { dur: 480, weight: 3 },
  jack: { dur: 600, weight: 2 },
  intern: { dur: 600, weight: 2 },
  shield: { charges: 2, weight: 2 }
}

/** Formation cell specs for a wave: [{ type, hx, hy, hp }], offsets relative to formation centre. */
export function buildFormation(wave, types, rng) {
  const cells = []
  if (!types.length) return cells
  for (let r = 0; r < wave.rows; r++) {
    for (let c = 0; c < wave.cols; c++) {
      if (wave.gaps && (c + r) % 2 === 1) continue // "went quiet": checkerboard of missing crates
      const type = types[Math.floor(rng() * types.length)]
      cells.push({
        type,
        hx: (c - (wave.cols - 1) / 2) * CRATE.gapX,
        hy: r * CRATE.gapY,
        hp: Math.max(1, Math.round(type.hp * wave.hpMul))
      })
    }
  }
  return cells
}
