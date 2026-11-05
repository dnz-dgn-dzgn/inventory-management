// Pure scoring helpers (no DOM). Money is always formatted with a fixed en-US formatter.
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
export const formatMoney = (n) => usd.format(Math.round(Number.isFinite(n) ? n : 0))

// +25% per 10 consecutive hits, capped at x2.
export const comboMultiplier = (combo) => 1 + Math.min(Math.floor(combo / 10), 4) * 0.25

export const crateValue = (hp) => 400 + hp * 150

export const RANKS = [
  { id: 'intern', min: 0 },
  { id: 'associate', min: 25000 },
  { id: 'lead', min: 70000 },
  { id: 'manager', min: 120000 },
  { id: 'legend', min: 180000 }
]

export function rankFor(score) {
  let rank = RANKS[0]
  for (const r of RANKS) if (score >= r.min) rank = r
  return rank.id
}

export const accuracy = (hits, shots) => (shots > 0 ? Math.min(100, Math.round((hits / shots) * 100)) : 0)
