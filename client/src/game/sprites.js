// Canvas renderer: everything is drawn procedurally with chunky rectangles.
// draw(ctx, s, pal, t) where t(key, params) is the i18n function. No DOM access here.
import { W, H, FLOOR, PLAYER_Y } from './engine.js'
import { formatMoney } from './scoring.js'
import { TOTAL_WAVES } from './waves.js'

const FONT = '"Courier New", ui-monospace, monospace'
const px = Math.round
const rect = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(px(x), px(y), px(w), px(h)) }
// Outlined rect: dark border then fill, gives the 1-bit sticker look.
const block = (c, pal, col, x, y, w, h) => { rect(c, pal.black, x - 2, y - 2, w + 4, h + 4); rect(c, col, x, y, w, h) }

function text(c, str, x, y, size, col, align = 'left', bold = true, shadow = null) {
  c.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`
  c.textAlign = align
  c.textBaseline = 'middle'
  if (shadow) { c.fillStyle = shadow; c.fillText(str, px(x) + 1, px(y) + 1) }
  c.fillStyle = col
  c.fillText(str, px(x), px(y))
}

// Shorten a label to a pixel width (CJK-safe: measures instead of counting characters).
function fit(c, str, maxW, size, bold = true) {
  c.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`
  if (c.measureText(str).width <= maxW) return str
  let s = str
  while (s.length > 1 && c.measureText(s + '..').width > maxW) s = s.slice(0, -1)
  return s + '..'
}

// ---------- background ----------

function drawBackground(c, s, pal) {
  rect(c, pal.bg, 0, 0, W, H)
  // Three parallax layers of rack silhouettes scrolling down; far layers are slower and dimmer.
  const layers = [
    { speed: 0.15, col: pal.bgMid, w: 52, gap: 26, h: 110 },
    { speed: 0.35, col: pal.rack, w: 64, gap: 52, h: 150 },
    { speed: 0.7, col: pal.rack2, w: 30, gap: 170, h: 220 }
  ]
  for (const L of layers) {
    const period = L.h + 40
    const off = (s.tick * L.speed) % period
    for (let row = -1; row < H / period + 1; row++) {
      const y = row * period + off
      for (let x = L.gap / 2; x < W; x += L.w + L.gap) {
        rect(c, L.col, x, y, L.w, L.h)
        for (let sh = 1; sh < 4; sh++) rect(c, pal.bg, x + 3, y + (L.h / 4) * sh, L.w - 6, 3) // shelf gaps
        rect(c, L.col, x - 3, y - 4, 4, L.h + 8)
        rect(c, L.col, x + L.w - 1, y - 4, 4, L.h + 8)
      }
    }
  }
  // Dock floor with hazard stripe
  rect(c, pal.floor, 0, FLOOR, W, H - FLOOR)
  for (let x = -20 + ((s.tick * 0.3) % 24); x < W; x += 24) {
    c.fillStyle = pal.hazard
    c.beginPath()
    c.moveTo(x, FLOOR)
    c.lineTo(x + 12, FLOOR)
    c.lineTo(x + 4, FLOOR + 8)
    c.lineTo(x - 8, FLOOR + 8)
    c.fill()
  }
  rect(c, pal.black, 0, FLOOR + 8, W, 2)
}

// ---------- sprites ----------

function drawForklift(c, s, pal, t) {
  const p = s.player
  if (p.inv > 0 && Math.floor(p.inv / 5) % 2 === 0) return // blink while invulnerable
  const shake = p.coffee > 0 && !s.reducedMotion ? (s.tick % 2 ? 1 : -1) * 1.5 : 0
  const x = px(p.x + shake)
  const y = PLAYER_Y
  // mast + fork
  block(c, pal, pal.steel, x - 3, y - 36, 6, 30)
  rect(c, pal.steelDark, x - 12, y - 8, 24, 4)
  // body
  block(c, pal, pal.forklift, x - 20, y - 8, 34, 16)
  rect(c, pal.forkliftDark, x - 20, y + 4, 34, 4)
  block(c, pal, pal.forklift, x + 4, y - 18, 14, 12) // cab
  rect(c, pal.white, x + 8, y - 15, 6, 5) // window
  rect(c, pal.black, x + 18, y - 20, 2, 6) // roll cage post
  // wheels
  block(c, pal, pal.black, x - 16, y + 7, 9, 9)
  block(c, pal, pal.black, x + 6, y + 7, 9, 9)
  rect(c, pal.steel, x - 13, y + 10, 3, 3)
  rect(c, pal.steel, x + 9, y + 10, 3, 3)
  // shield: a stack of Do Not Stack boxes above
  if (p.shield > 0) {
    for (let i = 0; i < p.shield; i++) {
      const by = y - 52 - i * 14
      block(c, pal, pal.cardboard, x - 14, by, 28, 12)
      text(c, t('game.power.shield.decal'), x, by + 6, 6, pal.black, 'center')
    }
  }
}

function drawHelper(c, s, pal) {
  const p = s.player
  if (p.intern <= 0) return
  const y = PLAYER_Y - 48 + Math.sin(s.tick * 0.1) * 3
  block(c, pal, pal.white, p.helperX - 7, y - 5, 14, 10)
  rect(c, pal.accent, p.helperX - 7, y - 5, 14, 3)
  rect(c, pal.black, p.helperX - 14, y - 7, 6, 2) // rotor
  rect(c, pal.black, p.helperX + 8, y - 7, 6, 2)
}

function drawCrate(c, s, pal, e) {
  const x = px(e.x - e.w / 2)
  const y = px(e.y - e.h / 2)
  const flash = e.flash > 0
  const pr = pal[e.type.priority]
  block(c, pal, flash ? pal.white : pal.cardboard, x, y, e.w, e.h)
  rect(c, flash ? pal.white : pal.cardboardDark, x, y + e.h - 5, e.w, 5)
  rect(c, flash ? pal.white : pal.tape, x + e.w / 2 - 4, y, 8, e.h) // packing tape
  rect(c, pr, x, y, e.w, 5) // priority strip
  // label sticker
  rect(c, pal.paper, x + 4, y + 9, e.w - 8, e.h - 20)
  const name = fit(c, e.type.label, e.w - 12, 8)
  text(c, name, e.x, y + 17, 8, pal.black, 'center')
  text(c, e.type.sku, e.x, y + 28, 8, pr === pal.low ? pal.black : pal.danger, 'center')
  // damage cracks: one zigzag per lost third of hp
  const lost = 1 - e.hp / e.maxHp
  const cracks = Math.floor(lost * 3.2)
  c.strokeStyle = pal.black
  c.lineWidth = 2
  for (let i = 0; i < cracks; i++) {
    const cx = x + 10 + i * 24
    c.beginPath()
    c.moveTo(cx, y + 2)
    c.lineTo(cx + 5, y + 10)
    c.lineTo(cx - 3, y + 18)
    c.lineTo(cx + 4, y + e.h - 2)
    c.stroke()
  }
  // hp bar
  if (e.maxHp > 1) {
    rect(c, pal.black, x, y + e.h + 1, e.w, 4)
    rect(c, pr, x + 1, y + e.h + 2, (e.w - 2) * Math.max(0, e.hp / e.maxHp), 2)
  }
}

function drawBonus(c, s, pal, e) {
  const x = px(e.x - e.w / 2)
  const y = px(e.y - e.h / 2)
  const fl = e.flash > 0 ? pal.white : null
  if (e.kind === 'email') {
    block(c, pal, fl || pal.paper, x, y, e.w, e.h)
    c.strokeStyle = pal.black
    c.lineWidth = 2
    c.beginPath(); c.moveTo(x, y); c.lineTo(e.x, y + e.h * 0.65); c.lineTo(x + e.w, y); c.stroke()
    rect(c, pal.danger, x + e.w - 10, y + e.h - 9, 6, 6) // unread badge
  } else if (e.kind === 'forecast') {
    block(c, pal, fl || pal.paper, x, y, e.w, e.h)
    c.strokeStyle = pal.danger
    c.lineWidth = 2
    c.beginPath(); c.moveTo(x + 3, y + e.h - 5); c.lineTo(x + 12, y + 10); c.lineTo(x + 20, y + 18); c.lineTo(x + 28, y + 5); c.lineTo(x + e.w - 3, y + 12); c.stroke()
  } else {
    // meeting invite (and its smaller halves)
    block(c, pal, fl || pal.paper, x, y, e.w, e.h)
    rect(c, pal.danger, x, y, e.w, 8)
    const n = e.kind === 'invite' ? 3 : 2
    for (let i = 0; i < n; i++) rect(c, pal.black, x + 4 + i * 10, y + 13, 6, 4)
  }
}

function drawBoss(c, s, pal) {
  const b = s.boss
  if (!b || b.hp <= 0) return
  const x = px(b.x)
  const y = px(b.y)
  const fl = b.flash > 0
  // suit
  block(c, pal, fl ? pal.white : pal.steelDark, x - 40, y - 10, 80, 56)
  rect(c, pal.white, x - 8, y - 10, 16, 40) // shirt
  rect(c, pal.danger, x - 3, y, 6, 30) // tie
  // head
  block(c, pal, fl ? pal.white : pal.skin, x - 22, y - 52, 44, 38)
  rect(c, pal.black, x - 18, y - 36, 14, 10) // glasses
  rect(c, pal.black, x + 4, y - 36, 14, 10)
  rect(c, pal.white, x - 16, y - 34, 10, 6)
  rect(c, pal.white, x + 6, y - 34, 10, 6)
  rect(c, pal.black, x - 10, y - 22, 20, 3) // flat mouth
  rect(c, pal.black, x - 22, y - 56, 44, 8) // hair
  // clipboard
  const wob = Math.sin(s.tick * 0.1) * 3
  block(c, pal, pal.cardboardLight, x + 38, y + wob - 6, 30, 42)
  rect(c, pal.paper, x + 42, y + wob + 2, 22, 30)
  for (let i = 0; i < 4; i++) rect(c, pal.black, x + 44, y + wob + 6 + i * 6, 18, 2)
  rect(c, pal.steel, x + 47, y + wob - 9, 12, 5)
  // legs
  rect(c, pal.black, x - 30, y + 46, 20, 18)
  rect(c, pal.black, x + 10, y + 46, 20, 18)
}

function drawBullets(c, s, pal) {
  for (const b of s.bullets) {
    // pallet: planks with gaps
    rect(c, pal.black, b.x - b.w / 2 - 1, b.y - b.h / 2 - 1, b.w + 2, b.h + 2)
    rect(c, b.helper ? pal.white : pal.cardboardLight, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h)
    rect(c, pal.black, b.x - b.w / 2, b.y - 2, b.w, 2)
    rect(c, pal.black, b.x - b.w / 2, b.y + b.h / 2 - 4, b.w, 2)
  }
  for (const b of s.ebullets) {
    block(c, pal, pal.paper, b.x - b.w / 2, b.y - b.h / 2, b.w, b.h)
    if (b.kind === 'question') text(c, '?', b.x, b.y + 1, 14, pal.danger, 'center')
    else rect(c, pal.black, b.x - 4, b.y - 3, 8, 2)
  }
}

const DROP_COL = (pal) => ({ coffee: pal.cardboardDark, jack: pal.forklift, intern: pal.accent, shield: pal.shield })
const DROP_LET = { coffee: 'C', jack: 'J', intern: 'I', shield: 'S' }

function drawDrops(c, s, pal) {
  const cols = DROP_COL(pal)
  for (const d of s.drops) {
    const bob = Math.sin((s.tick + d.x) * 0.15) * 2
    block(c, pal, cols[d.kind], d.x - 14, d.y - 14 + bob, 28, 28)
    text(c, DROP_LET[d.kind], d.x, d.y + bob + 1, 16, d.kind === 'jack' ? pal.black : pal.white, 'center')
  }
}

function drawFx(c, s, pal, t) {
  for (const p of s.particles) {
    const a = Math.min(1, p.life / (p.max * 0.5))
    c.globalAlpha = a
    const col = p.kind === 'card' ? (p.c ? pal.cardboard : pal.cardboardDark) : p.kind === 'paper' ? pal.paper : p.kind === 'spark' ? pal.forklift : pal.steel
    rect(c, col, p.x, p.y, p.size, p.size)
  }
  c.globalAlpha = 1
  for (const f of s.popups) {
    const a = Math.min(1, f.life / (f.max * 0.4))
    c.globalAlpha = a
    const str = f.key ? t(f.key, f.params) : f.text
    const col = f.kind === 'combo' ? pal.forklift : f.kind === 'power' ? pal.good : f.kind === 'po' ? pal.paper : pal.white
    const size = f.kind === 'score' ? 12 : 11
    text(c, fit(c, str, 230, size), Math.min(W - 70, Math.max(70, f.x)), f.y, size, col, 'center', true, pal.black)
  }
  c.globalAlpha = 1
}

function drawHud(c, s, pal, t) {
  rect(c, pal.black, 0, 0, W, 26)
  text(c, t('game.hud.score', { n: formatMoney(s.score) }), 8, 13, 12, pal.white)
  // Safety certificates as small yellow badges
  for (let i = 0; i < 3; i++) {
    const on = i < s.player.lives
    rect(c, pal.black, W - 24 - i * 22 - 1, 5, 18, 16)
    rect(c, on ? pal.forklift : pal.steelDark, W - 24 - i * 22, 6, 16, 14)
    if (on) rect(c, pal.black, W - 21 - i * 22, 10, 10, 2), rect(c, pal.black, W - 21 - i * 22, 14, 7, 2)
  }
  text(c, t('game.hud.wave', { n: Math.max(1, s.wave + 1), total: TOTAL_WAVES }), W / 2 - 20, 13, 11, pal.textDim, 'center')
  // combo + powerup timers
  if (s.combo >= 3) text(c, t('game.hud.combo', { n: s.combo }), 8, 40, 11, pal.forklift, 'left', true, pal.black)
  const timers = [['coffee', s.player.coffee], ['jack', s.player.jack], ['intern', s.player.intern]].filter(([, v]) => v > 0)
  timers.forEach(([k, v], i) => {
    const y = 40 + i * 12
    text(c, t(`game.power.${k}.name`), W - 8, y, 9, pal.textDim, 'right')
    rect(c, pal.forklift, W - 130, y + 6, Math.min(120, v / 5), 2)
  })
  if (s.boss && s.boss.hp > 0) {
    rect(c, pal.black, 60, 30, W - 120, 12)
    rect(c, pal.danger, 62, 32, (W - 124) * (s.boss.hp / s.boss.max), 8)
    text(c, t('game.boss.name'), W / 2, 36, 8, pal.white, 'center')
  }
}

function drawBanner(c, s, pal, t) {
  const b = s.banner
  if (!b) return
  // Slides in fast, holds, slides out.
  const age = b.max - b.life
  const slide = age < 14 ? 1 - age / 14 : b.life < 14 ? 1 - b.life / 14 : 0
  const off = slide * W * (age < 14 ? -1 : 1)
  rect(c, pal.black, off, 236, W, 88)
  rect(c, pal.forklift, off, 236, W, 4)
  rect(c, pal.forklift, off, 320, W, 4)
  text(c, t('game.banner.wave', { n: b.n }), W / 2 + off, 256, 11, pal.forklift, 'center')
  text(c, fit(c, t(b.titleKey), W - 30, 28), W / 2 + off, 282, 28, pal.white, 'center')
  text(c, fit(c, t(b.subKey), W - 30, 11, false), W / 2 + off, 308, 11, pal.textDim, 'center', false)
}

function wrap(c, str, maxW, size) {
  c.font = `bold ${size}px ${FONT}`
  const out = []
  let line = ''
  // Split on spaces for Latin text, per-character for CJK so both wrap sensibly.
  const tokens = /\s/.test(str) ? str.split(/(?<=\s)/) : Array.from(str)
  for (const tok of tokens) {
    if (c.measureText(line + tok).width > maxW && line) { out.push(line); line = tok } else line += tok
  }
  if (line) out.push(line)
  return out
}

function drawBubble(c, s, pal, t) {
  if (!s.speech || !s.boss) return
  const lines = wrap(c, t(s.speech.key), 190, 10).slice(0, 4)
  const bw = 204
  const bh = lines.length * 13 + 12
  const bx = Math.min(W - bw - 6, Math.max(6, s.boss.x - bw / 2))
  const by = s.boss.y - 70 - bh
  const y = Math.max(46, by)
  block(c, pal, pal.paper, bx, y, bw, bh)
  rect(c, pal.paper, s.boss.x - 4, y + bh, 10, 6)
  lines.forEach((l, i) => text(c, l.trim(), bx + 8, y + 12 + i * 13, 10, pal.black))
}

function drawToast(c, s, pal, t) {
  if (!s.toast || s.mode !== 'play') return
  const str = t(s.toast.key, s.toast.params)
  const lines = wrap(c, str, W - 60, 11).slice(0, 2)
  const h = lines.length * 14 + 10
  const y = FLOOR + 14
  rect(c, pal.black, 12, y, W - 24, h)
  lines.forEach((l, i) => text(c, l.trim(), W / 2, y + 12 + i * 14, 11, pal.white, 'center'))
}

export function draw(c, s, pal, t) {
  c.imageSmoothingEnabled = false
  c.save()
  if (s.shake > 0) c.translate(px((Math.random() - 0.5) * s.shake), px((Math.random() - 0.5) * s.shake))
  drawBackground(c, s, pal)
  for (const e of s.enemies) (e.kind === 'crate' ? drawCrate : drawBonus)(c, s, pal, e)
  drawBoss(c, s, pal)
  drawDrops(c, s, pal)
  drawBullets(c, s, pal)
  drawHelper(c, s, pal)
  drawForklift(c, s, pal, t)
  drawFx(c, s, pal, t)
  c.restore()
  drawHud(c, s, pal, t)
  drawBubble(c, s, pal, t)
  drawBanner(c, s, pal, t)
  drawToast(c, s, pal, t)
  if (s.hurtFlash > 0) {
    c.globalAlpha = s.hurtFlash / 28
    rect(c, pal.danger, 0, 0, W, H)
    c.globalAlpha = 1
  }
  if (s.mode === 'pause') {
    c.globalAlpha = 0.7
    rect(c, pal.black, 0, 0, W, H)
    c.globalAlpha = 1
    text(c, t('game.pause.title'), W / 2, H / 2 - 10, 30, pal.forklift, 'center')
    text(c, t(s.pauseJoke || 'game.pause.hint'), W / 2, H / 2 + 22, 12, pal.white, 'center', false)
  }
}
