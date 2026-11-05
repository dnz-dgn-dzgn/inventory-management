// Backlog Blaster engine: pure state + fixed-step update (60 Hz). No DOM, no window.
// The view drives it with step(s), feeds input with press/release and drains s.events.
import { mulberry32, randRange, pickOne } from './rng.js'
import { aabb, clamp } from './collision.js'
import { comboMultiplier, rankFor, accuracy } from './scoring.js'
import { pickJoke } from './jokes.js'
import { addShake, burst, popup, updateFx } from './fx.js'
import { WAVES, BOSS, BONUS, CRATE, POWERUPS, SAMPLE_BACKLOG, makeTypes, buildFormation, TOTAL_WAVES } from './waves.js'

export const W = 480
export const H = 640
export const FLOOR = 552 // crates crossing this line breach the dock
export const PLAYER_Y = 596
const PLAYER = { w: 44, h: 34, speed: 4.2 }

// Raw key (lowercased e.key) -> action. Space is ' '.
const KEYMAP = {
  arrowleft: 'left', a: 'left', arrowright: 'right', d: 'right',
  ' ': 'fire', w: 'fire', arrowup: 'fire'
}

export function createGame({ seed = 1, types, reducedMotion = false } = {}) {
  const s = {
    mode: 'menu', // menu | play | pause | over | win
    seed,
    rng: mulberry32(seed),
    reducedMotion,
    types: types && types.length ? types : makeTypes(SAMPLE_BACKLOG),
    down: new Set(),
    events: [],
    tick: 0
  }
  resetRun(s)
  return s
}

export function setSeed(s, seed) {
  s.seed = seed
  s.rng = mulberry32(seed)
}

export function setTypes(s, types) {
  if (types && types.length) s.types = types
}

function resetRun(s) {
  Object.assign(s, {
    tick: 0, wave: -1, phase: 'none', phaseT: 0, waveT: 0,
    enemies: [], bullets: [], ebullets: [], drops: [], particles: [], popups: [],
    form: { x: W / 2, y: 70, dir: 1, entering: false }, wd: WAVES[0], boss: null,
    banner: null, toast: null, speech: null, shake: 0, hurtFlash: 0, overJoke: null, winJoke: null,
    score: 0, combo: 0, bestCombo: 0, shots: 0, hits: 0, saved: 0, wavesCleared: 0, rank: 'intern',
    player: { x: W / 2, cd: 0, lives: 3, inv: 0, shield: 0, coffee: 0, jack: 0, intern: 0, helperX: W / 2, helperCd: 30 }
  })
}

export function startRun(s) {
  resetRun(s)
  s.mode = 'play'
  startWave(s, 0)
  emit(s, 'sfx', { name: 'wave' })
}

export function togglePause(s) {
  if (s.mode === 'play') {
    s.mode = 'pause'
    s.pauseJoke = pickJoke(s.rng, 'pause')
  } else if (s.mode === 'pause') s.mode = 'play'
}

export function press(s, key) {
  s.down.add(String(key).toLowerCase())
}
export function release(s, key) {
  s.down.delete(String(key).toLowerCase())
}
export function releaseAll(s) {
  s.down.clear()
}
const held = (s, action) => {
  for (const k of s.down) if (KEYMAP[k] === action) return true
  return false
}

function emit(s, type, data = {}) {
  if (s.events.length > 200) s.events.shift()
  s.events.push({ type, ...data })
}
export function drainEvents(s) {
  const e = s.events
  s.events = []
  return e
}

function toast(s, key, params) {
  s.toast = { key, params, life: 170 }
}

// ---------- waves ----------

function startWave(s, i) {
  s.wave = i
  s.waveT = 0
  s.enemies = []
  s.ebullets = []
  const isBoss = i >= WAVES.length
  if (isBoss) {
    s.wd = { id: BOSS.id, bonus: [{ kind: 'email', every: 420 }], drop: 0, fire: 0, sway: 0, descend: 0 }
    s.boss = { x: W / 2, y: -140, w: BOSS.w, h: BOSS.h, hp: BOSS.hp, max: BOSS.hp, dir: 1, fireCd: 150, talkCd: 200, flash: 0, entering: true, half: false }
    s.speech = null
    s.player.lives = 3 // boss fight always starts with a full set of certificates
  } else {
    s.wd = WAVES[i]
    const cells = buildFormation(s.wd, s.types, s.rng)
    s.form = { x: W / 2, y: -s.wd.rows * CRATE.gapY - 30, dir: 1, entering: true }
    for (const c of cells) {
      s.enemies.push({ kind: 'crate', x: W / 2, y: -100, w: CRATE.w, h: CRATE.h, hp: c.hp, maxHp: c.hp, type: c.type, hx: c.hx, hy: c.hy, flash: 0, phase: s.rng() * 6 })
    }
  }
  s.phase = 'intro'
  s.phaseT = 150
  s.banner = { titleKey: `game.waves.${s.wd.id}.title`, subKey: `game.waves.${s.wd.id}.sub`, life: 150, max: 150, n: i + 1 }
  emit(s, 'wave', { n: i + 1, id: s.wd.id, boss: isBoss })
}

function crates(s) {
  return s.enemies.filter((e) => e.kind === 'crate')
}

function spawnBonus(s, kind) {
  const def = BONUS[kind]
  const fromLeft = s.rng() < 0.5
  const y = randRange(s.rng, 40, kind === 'forecast' ? 200 : 260)
  s.enemies.push({
    kind, w: def.w, h: def.h, hp: def.hp, maxHp: def.hp, flash: 0, phase: s.rng() * 6,
    x: fromLeft ? -def.w : W + def.w, y, baseY: y,
    vx: fromLeft ? def.vx : -def.vx, value: def.value
  })
}

function updateWaveFlow(s) {
  s.waveT++
  if (s.banner && --s.banner.life <= 0) s.banner = null
  if (s.phase === 'intro') {
    if (--s.phaseT <= 0) s.phase = 'fight'
  } else if (s.phase === 'clear') {
    if (--s.phaseT <= 0) startWave(s, s.wave + 1)
    return
  }
  // Bonus enemies, only while fighting.
  if (s.phase === 'fight') {
    for (const b of s.wd.bonus) if (s.waveT % b.every === 0) spawnBonus(s, b.kind)
  }
}

function checkWaveClear(s) {
  if (s.phase !== 'fight' || s.boss) return
  if (crates(s).length > 0) return
  s.phase = 'clear'
  s.phaseT = 110
  s.wavesCleared++
  s.score += 1000 * (s.wave + 1)
  s.enemies = [] // stray bonus enemies leave with the last crate
  // Mercy rule: a cleared wave refunds one safety certificate, so a run is about waves, not attrition.
  if (s.player.lives < 3) s.player.lives++
  for (const b of s.ebullets) burst(s, s.rng, b.x, b.y, 3, 'paper', 1.5)
  s.ebullets = []
  toast(s, pickJoke(s.rng, 'clear'))
  emit(s, 'clear', { n: s.wave + 1, score: s.score })
  emit(s, 'sfx', { name: 'power' })
}

// ---------- update ----------

export function step(s) {
  s.tick++
  updateFx(s)
  if (s.toast && --s.toast.life <= 0) s.toast = null
  if (s.speech && --s.speech.life <= 0) s.speech = null
  if (s.mode !== 'play') return
  updateWaveFlow(s)
  updatePlayer(s)
  updateFormation(s)
  updateBonus(s)
  updateBoss(s)
  updateBullets(s)
  updateDrops(s)
  checkWaveClear(s)
  s.rank = rankFor(s.score)
}

function updatePlayer(s) {
  const p = s.player
  const dir = (held(s, 'right') ? 1 : 0) - (held(s, 'left') ? 1 : 0)
  p.x = clamp(p.x + dir * PLAYER.speed, PLAYER.w / 2 + 4, W - PLAYER.w / 2 - 4)
  if (p.inv > 0) p.inv--
  if (p.coffee > 0) p.coffee--
  if (p.jack > 0) p.jack--
  if (p.cd > 0) p.cd--
  if (held(s, 'fire') && p.cd <= 0) {
    p.cd = p.coffee > 0 ? 6 : 14
    const angles = p.jack > 0 ? [-1.8, 0, 1.8] : [0]
    for (const vx of angles) s.bullets.push({ x: p.x, y: PLAYER_Y - 22, vx, vy: -9, w: 10, h: 16, helper: false })
    s.shots++
    burst(s, s.rng, p.x, PLAYER_Y - 24, 2, 'smoke', 1)
    emit(s, 'sfx', { name: 'shoot' })
  }
  // Intern drone: hovers beside the forklift and "aims" with a random wobble.
  if (p.intern > 0) {
    p.intern--
    p.helperX += (p.x + 46 - p.helperX) * 0.08
    if (--p.helperCd <= 0) {
      p.helperCd = 36
      s.bullets.push({ x: p.helperX, y: PLAYER_Y - 40, vx: (s.rng() - 0.5) * 5, vy: -8, w: 8, h: 12, helper: true })
    }
  }
}

function updateFormation(s) {
  const cs = crates(s)
  if (!cs.length) return
  const f = s.form
  const wd = s.wd
  if (f.entering) {
    f.y += 3
    if (f.y >= 64) f.entering = false
  } else {
    f.y += wd.descend
    let left = Infinity
    let right = -Infinity
    for (const c of cs) {
      left = Math.min(left, c.hx - c.w / 2)
      right = Math.max(right, c.hx + c.w / 2)
    }
    f.x += f.dir * wd.sway
    if (f.x + right >= W - 8 && f.dir > 0) { f.dir = -1; f.y += 8 }
    if (f.x + left <= 8 && f.dir < 0) { f.dir = 1; f.y += 8 }
    if (s.phase === 'fight' && s.rng() < wd.fire) {
      const c = pickOne(s.rng, cs)
      s.ebullets.push({ x: c.x, y: c.y + c.h / 2, vx: 0, vy: 2.6, w: 12, h: 12, kind: 'memo' })
    }
  }
  for (const c of cs) {
    if (!f.entering) c.hy += c.type.drift // long-delayed items sag faster
    c.x = f.x + c.hx
    c.y = f.y + c.hy
    if (c.flash > 0) c.flash--
    if (c.y + c.h / 2 >= FLOOR) {
      // Shortage reached the dock: the crate is lost and the driver pays for it.
      c.dead = true
      burst(s, s.rng, c.x, FLOOR, 12, 'card', 3)
      hurtPlayer(s, 'breach')
    }
  }
  s.enemies = s.enemies.filter((e) => !e.dead)
}

function updateBonus(s) {
  for (const e of s.enemies) {
    if (e.kind === 'crate') continue
    e.phase += 0.06
    e.x += e.vx
    if (e.kind === 'forecast') e.y = e.baseY + Math.sin(e.phase * 2.2) * 38 // zig-zag
    else if (e.kind !== 'email') e.y = e.baseY + Math.sin(e.phase) * 10
    if (e.flash > 0) e.flash--
    if (e.x < -80 || e.x > W + 80) e.dead = true
  }
  s.enemies = s.enemies.filter((e) => !e.dead)
}

function updateBoss(s) {
  const b = s.boss
  if (!b || b.hp <= 0) return
  if (b.flash > 0) b.flash--
  if (b.entering) {
    b.y += 2
    if (b.y >= 120) b.entering = false
    return
  }
  const frac = b.hp / b.max
  b.x += b.dir * (1.1 + (1 - frac) * 1.5)
  if (b.x > W - 90) b.dir = -1
  if (b.x < 90) b.dir = 1
  if (--b.fireCd <= 0) {
    b.fireCd = Math.round(130 - 40 * (1 - frac))
    const spread = frac < 0.5 ? [-0.6, -0.3, 0, 0.3, 0.6] : [-0.4, 0, 0.4]
    for (const a of spread) {
      s.ebullets.push({ x: b.x, y: b.y + b.h / 2 - 10, vx: Math.sin(a) * 2.2, vy: Math.cos(a) * 2.2, w: 18, h: 18, kind: 'question' })
    }
    // Plus one aimed at the forklift once he is annoyed.
    if (frac < 0.5) {
      const dx = s.player.x - b.x
      const dy = PLAYER_Y - b.y
      const d = Math.hypot(dx, dy) || 1
      s.ebullets.push({ x: b.x, y: b.y, vx: (dx / d) * 2.8, vy: (dy / d) * 2.8, w: 18, h: 18, kind: 'question' })
    }
  }
  if (--b.talkCd <= 0) {
    b.talkCd = 320
    s.speech = { key: pickJoke(s.rng, 'taunt'), life: 230 }
  }
  if (!b.half && frac < 0.5) {
    b.half = true
    s.speech = { key: 'game.boss.rage', life: 230 }
  }
}

function updateBullets(s) {
  const p = s.player
  // Player bullets
  for (const b of s.bullets) {
    b.x += b.vx
    b.y += b.vy
    if (b.y < -20 || b.x < -10 || b.x > W + 10) {
      b.dead = true
      if (!b.helper) s.combo = 0 // a miss breaks the streak
      continue
    }
    for (const e of s.enemies) {
      if (!e.dead && aabb(b, e)) {
        b.dead = true
        damageEnemy(s, e, 1)
        registerHit(s, b.helper)
        break
      }
    }
    const boss = s.boss
    if (!b.dead && boss && boss.hp > 0 && !boss.entering && aabb(b, boss)) {
      b.dead = true
      boss.hp--
      boss.flash = 4
      registerHit(s, b.helper)
      s.score += Math.round(60 * comboMultiplier(s.combo))
      burst(s, s.rng, b.x, b.y, 3, 'paper', 2)
      emit(s, 'sfx', { name: 'hit' })
      if (boss.hp <= 0) beatBoss(s)
    }
  }
  s.bullets = s.bullets.filter((b) => !b.dead)
  s.enemies = s.enemies.filter((e) => !e.dead)

  // Enemy bullets
  const pbox = { x: p.x, y: PLAYER_Y, w: PLAYER.w - 10, h: PLAYER.h - 4 }
  for (const b of s.ebullets) {
    b.x += b.vx
    b.y += b.vy
    if (b.y > H + 20 || b.x < -20 || b.x > W + 20) b.dead = true
    else if (aabb(b, pbox)) {
      b.dead = true
      burst(s, s.rng, b.x, b.y, 5, 'paper', 2)
      hurtPlayer(s, 'hit')
    }
  }
  s.ebullets = s.ebullets.filter((b) => !b.dead)
}

function registerHit(s, helper) {
  s.score += 10
  if (helper) return // the intern's lucky hits do not count for accuracy or combo
  s.hits++
  s.combo++
  s.bestCombo = Math.max(s.bestCombo, s.combo)
  if (s.combo % 10 === 0) {
    popup(s, s.player.x, PLAYER_Y - 60, { key: 'game.combo.label', params: { n: s.combo }, kind: 'combo' })
    emit(s, 'combo', { n: s.combo })
  }
}

function damageEnemy(s, e, dmg) {
  e.hp -= dmg
  e.flash = 4
  burst(s, s.rng, e.x, e.y, 3, 'card', 2)
  if (e.hp > 0) {
    emit(s, 'sfx', { name: 'hit' })
    return
  }
  e.dead = true
  const pts = Math.round((e.type ? e.type.value : e.value) * comboMultiplier(s.combo))
  s.score += pts
  popup(s, e.x, e.y, { text: `+${pts}`, kind: 'score' })
  burst(s, s.rng, e.x, e.y, 14, 'card', 4)
  burst(s, s.rng, e.x, e.y, 8, 'paper', 3)
  addShake(s, e.kind === 'crate' ? 3 : 2)
  emit(s, 'sfx', { name: 'boom' })
  if (e.kind === 'crate') {
    s.saved++
    toast(s, pickJoke(s.rng, 'po'), { item: e.type.label })
    popup(s, e.x, e.y - 16, { key: 'game.popups.po', params: { item: e.type.label }, kind: 'po', life: 70 })
  } else if (e.kind === 'invite') {
    // Meeting invites split into two smaller invites.
    for (const dir of [-1, 1]) {
      const d = BONUS.inviteSmall
      s.enemies.push({ kind: 'inviteSmall', w: d.w, h: d.h, hp: d.hp, maxHp: d.hp, flash: 0, phase: s.rng() * 6, x: e.x + dir * 10, y: e.y, baseY: e.y, vx: dir * d.vx, value: d.value })
    }
    popup(s, e.x, e.y - 16, { key: 'game.popups.split', kind: 'po', life: 55 })
  } else if (e.kind === 'email' && s.rng() < 0.35) {
    toast(s, pickJoke(s.rng, 'bonusKill'))
  }
  // Power-up drops: crates use the wave's rate, bonus enemies drop more often.
  const rate = e.kind === 'crate' ? s.wd.drop : e.kind === 'inviteSmall' ? 0 : 0.3
  if (s.rng() < rate) spawnDrop(s, e.x, e.y)
}

function spawnDrop(s, x, y) {
  const kinds = Object.keys(POWERUPS)
  let total = 0
  for (const k of kinds) total += POWERUPS[k].weight
  let r = s.rng() * total
  let kind = kinds[0]
  for (const k of kinds) {
    r -= POWERUPS[k].weight
    if (r <= 0) { kind = k; break }
  }
  s.drops.push({ kind, x: clamp(x, 20, W - 20), y, w: 28, h: 28, vy: 1.5 })
}

function updateDrops(s) {
  const pbox = { x: s.player.x, y: PLAYER_Y, w: PLAYER.w + 6, h: PLAYER.h + 6 }
  for (const d of s.drops) {
    d.y += d.vy
    if (d.y > H + 20) d.dead = true
    else if (aabb(d, pbox)) {
      d.dead = true
      applyPower(s, d.kind)
    }
  }
  s.drops = s.drops.filter((d) => !d.dead)
}

function applyPower(s, kind) {
  const p = s.player
  const def = POWERUPS[kind]
  if (kind === 'coffee') p.coffee = def.dur
  else if (kind === 'jack') p.jack = def.dur
  else if (kind === 'intern') { p.intern = def.dur; p.helperX = p.x }
  else if (kind === 'shield') p.shield = def.charges
  popup(s, p.x, PLAYER_Y - 40, { key: `game.power.${kind}.name`, kind: 'power', life: 80 })
  emit(s, 'power', { kind })
  emit(s, 'sfx', { name: 'power' })
}

function hurtPlayer(s, cause) {
  const p = s.player
  if (p.inv > 0 || s.mode !== 'play') return
  if (p.shield > 0) {
    p.shield--
    p.inv = 45
    popup(s, p.x, PLAYER_Y - 40, { key: 'game.power.shield.block', kind: 'power', life: 70 })
    emit(s, 'sfx', { name: 'hit' })
    return
  }
  p.lives--
  p.inv = 120
  s.combo = 0
  s.hurtFlash = 14
  addShake(s, 8)
  burst(s, s.rng, p.x, PLAYER_Y, 16, 'card', 4)
  toast(s, pickJoke(s.rng, cause === 'breach' ? 'breach' : 'hit'))
  emit(s, 'life', { lives: p.lives })
  emit(s, 'sfx', { name: 'hurt' })
  if (p.lives <= 0) {
    s.mode = 'over'
    s.overJoke = pickJoke(s.rng, 'over')
    emit(s, 'over', summary(s))
    emit(s, 'sfx', { name: 'lose' })
  }
}

function beatBoss(s) {
  const b = s.boss
  s.score += BOSS.value
  s.wavesCleared = TOTAL_WAVES
  burst(s, s.rng, b.x, b.y, 60, 'paper', 6)
  burst(s, s.rng, b.x, b.y, 30, 'card', 5)
  addShake(s, 14)
  s.speech = { key: pickJoke(s.rng, 'bossDown'), life: 200 }
  s.winJoke = pickJoke(s.rng, 'cert')
  s.ebullets = []
  s.enemies = []
  s.rank = rankFor(s.score)
  s.mode = 'win'
  emit(s, 'win', summary(s))
  emit(s, 'sfx', { name: 'win' })
}

export function summary(s) {
  return {
    score: Math.round(s.score),
    wave: Math.max(1, s.wave + 1),
    wavesCleared: s.wavesCleared,
    accuracy: accuracy(s.hits, s.shots),
    saved: s.saved,
    bestCombo: s.bestCombo,
    rank: rankFor(s.score)
  }
}

/** Headless helper: advance n fixed steps. */
export function stepN(s, n) {
  for (let i = 0; i < n; i++) step(s)
}
