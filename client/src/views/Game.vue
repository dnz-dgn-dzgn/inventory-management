<template>
  <div class="game-page">
    <div class="page-header">
      <h2>{{ t('game.title') }}</h2>
      <p>{{ t('game.subtitle') }}</p>
    </div>

    <div class="layout">
      <div class="stage-col">
        <div class="stage" ref="stageEl">
          <canvas
            ref="canvasEl"
            class="canvas"
            role="img"
            :aria-label="t('game.canvasLabel')"
          ></canvas>

          <!-- Start screen: briefing plus the real backlog as the enemy roster -->
          <div v-if="mode === 'menu'" class="overlay overlay-start">
            <h3 class="ov-title">{{ t('game.start.heading') }}</h3>
            <p class="ov-lead">{{ t('game.start.lead') }}</p>
            <button ref="startBtn" class="btn-arcade" type="button" @click="startGame">
              {{ t('game.start.button') }}
            </button>
            <div class="roster">
              <h4>{{ t('game.start.roster') }}</h4>
              <p v-if="loading" class="roster-note">{{ t(loadingJoke) }}</p>
              <ul v-else class="roster-list">
                <li v-for="ty in types" :key="ty.id" class="roster-item">
                  <span class="dot" :class="'p-' + ty.priority" aria-hidden="true"></span>
                  <span class="r-name">{{ ty.label }}</span>
                  <span class="r-meta">
                    {{ ty.sku }} / {{ t('game.start.shortage', { n: fmtNum(ty.shortage) }) }} /
                    {{ t('game.start.delayed', { n: ty.days }) }} / {{ t('game.start.priority.' + ty.priority) }}
                  </span>
                </li>
              </ul>
              <p class="roster-hint">{{ t('game.start.rosterHint') }}</p>
              <p v-if="usingFallback && !loading" class="roster-note">{{ t('game.fallbackNote') }}</p>
            </div>
          </div>

          <!-- Game over: mock HR screen -->
          <div v-else-if="mode === 'over'" class="overlay overlay-over" role="dialog" aria-modal="false" :aria-label="t('game.over.title')">
            <p class="hr-kicker">{{ t('game.over.subtitle') }}</p>
            <h3 class="ov-title">{{ t('game.over.title') }}</h3>
            <p class="hr-joke">{{ t(overJoke) }}</p>
            <p class="hr-kicker">{{ t('game.over.wave', { n: result.wave }) }}</p>
            <dl class="sheet">
              <div><dt>{{ t('game.over.score') }}</dt><dd>{{ fmtMoney(result.score) }}</dd></div>
              <div><dt>{{ t('game.stats.highScore') }}</dt><dd>{{ fmtMoney(highScore) }}</dd></div>
              <div><dt>{{ t('game.over.rank') }}</dt><dd>{{ t('game.ranks.' + result.rank) }}</dd></div>
              <div><dt>{{ t('game.win.saved') }}</dt><dd>{{ result.saved }}</dd></div>
            </dl>
            <p v-if="newHigh" class="new-high">{{ t('game.over.newHigh') }}</p>
            <div class="ov-actions">
              <button ref="retryBtn" class="btn-arcade" type="button" @click="startGame">{{ t('game.buttons.retry') }}</button>
              <router-link class="btn-plain" to="/">{{ t('game.buttons.back') }}</router-link>
            </div>
          </div>

          <!-- Victory: Employee of the Month certificate -->
          <div v-else-if="mode === 'win'" class="overlay overlay-win" role="dialog" aria-modal="false" :aria-label="t('game.win.certTitle')">
            <p class="hr-kicker">{{ t('game.win.title') }}</p>
            <div class="cert">
              <h3 class="cert-title">{{ t('game.win.certTitle') }}</h3>
              <p class="cert-line">{{ t('game.win.certLine') }}</p>
              <p class="cert-cite">{{ t(winJoke) }}</p>
              <dl class="sheet">
                <div><dt>{{ t('game.win.waves') }}</dt><dd>{{ result.wavesCleared }}</dd></div>
                <div><dt>{{ t('game.win.accuracy') }}</dt><dd>{{ result.accuracy }}%</dd></div>
                <div><dt>{{ t('game.win.saved') }}</dt><dd>{{ result.saved }}</dd></div>
                <div><dt>{{ t('game.win.revenue') }}</dt><dd>{{ fmtMoney(result.score) }}</dd></div>
                <div><dt>{{ t('game.win.combo') }}</dt><dd>x{{ result.bestCombo }}</dd></div>
                <div><dt>{{ t('game.win.rank') }}</dt><dd>{{ t('game.ranks.' + result.rank) }}</dd></div>
              </dl>
              <p class="cert-sign">{{ t('game.win.signed') }}</p>
            </div>
            <p v-if="newHigh" class="new-high">{{ t('game.over.newHigh') }}</p>
            <div class="ov-actions">
              <button ref="retryBtn" class="btn-arcade" type="button" @click="startGame">{{ t('game.buttons.playAgain') }}</button>
              <router-link class="btn-plain" to="/">{{ t('game.buttons.back') }}</router-link>
            </div>
          </div>
        </div>

        <!-- On-screen controls: touch and mouse -->
        <div class="touch" role="group" :aria-label="t('game.touch.group')">
          <button
            v-for="b in touchButtons"
            :key="b.key"
            class="touch-btn"
            :class="'touch-' + b.key"
            type="button"
            @pointerdown.prevent="touchDown($event, b.code)"
            @pointerup.prevent="touchUp($event, b.code)"
            @pointercancel="touchUp($event, b.code)"
            @lostpointercapture="touchUp($event, b.code)"
            @contextmenu.prevent
          >
            {{ t('game.touch.' + b.key) }}
          </button>
        </div>

        <div class="toolbar">
          <button type="button" class="btn-plain" :disabled="mode !== 'play' && mode !== 'pause'" @click="pauseToggle">
            {{ mode === 'pause' ? t('game.buttons.resume') : t('game.buttons.pause') }}
          </button>
          <button type="button" class="btn-plain" :aria-pressed="!muted" @click="toggleMute">
            {{ muted ? t('game.buttons.unmute') : t('game.buttons.mute') }}
          </button>
        </div>
      </div>

      <aside class="side">
        <div class="card">
          <div class="stat-row">
            <span>{{ t('game.stats.highScore') }}</span>
            <strong>{{ fmtMoney(highScore) }}</strong>
          </div>
          <div class="stat-row">
            <span>{{ t('game.stats.revenue') }}</span>
            <strong>{{ fmtMoney(liveScore) }}</strong>
          </div>
        </div>

        <div class="card">
          <h3 class="side-h">{{ t('game.controls.title') }}</h3>
          <ul class="plain-list">
            <li>{{ t('game.controls.move') }}</li>
            <li>{{ t('game.controls.fire') }}</li>
            <li>{{ t('game.controls.pause') }}</li>
            <li>{{ t('game.controls.touch') }}</li>
          </ul>
        </div>

        <div class="card">
          <h3 class="side-h">{{ t('game.controls.legend') }}</h3>
          <ul class="plain-list">
            <li v-for="k in enemyKinds" :key="k">
              <strong>{{ t('game.enemies.' + k + '.name') }}</strong>
              <span class="dim">{{ t('game.enemies.' + k + '.desc') }}</span>
            </li>
          </ul>
          <h3 class="side-h gap">{{ t('game.controls.powers') }}</h3>
          <ul class="plain-list">
            <li v-for="k in powerKinds" :key="k">
              <strong>{{ t('game.power.' + k + '.name') }}</strong>
              <span class="dim">{{ t('game.power.' + k + '.desc') }}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- Polite announcements: only on wave, life, power, end events (never per frame) -->
    <div class="sr-only" role="status" aria-live="polite">{{ liveMsg }}</div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { api } from '../api'
import { useI18n } from '../composables/useI18n'
import {
  createGame, startRun, step, stepN, press, release, releaseAll, togglePause,
  drainEvents, setSeed, summary, W, H
} from '../game/engine'
import { makeTypes, SAMPLE_BACKLOG } from '../game/waves'
import { formatMoney } from '../game/scoring'
import { pickJoke } from '../game/jokes'
import { readPalette } from '../game/palette'
import { draw } from '../game/sprites'
import { createAudio } from '../game/audio'

const STEP_MS = 1000 / 60
const HS_KEY = 'game-highscore'
const numFmt = new Intl.NumberFormat('en-US')

export default {
  name: 'Game',
  setup() {
    const { t, currentLocale, translateProductName } = useI18n()

    const stageEl = ref(null)
    const canvasEl = ref(null)
    const startBtn = ref(null)
    const retryBtn = ref(null)

    const mode = ref('menu')
    const loading = ref(true)
    const usingFallback = ref(false)
    const types = ref([])
    const liveScore = ref(0)
    const highScore = ref(0)
    const newHigh = ref(false)
    const muted = ref(true)
    const liveMsg = ref('')
    const result = ref({ score: 0, wave: 1, wavesCleared: 0, accuracy: 0, saved: 0, bestCombo: 0, rank: 'intern' })
    const overJoke = ref('game.jokes.over.1')
    const winJoke = ref('game.jokes.cert.1')
    const loadingJoke = ref('game.jokes.loading.1')

    const enemyKinds = ['crate', 'email', 'invite', 'forecast']
    const powerKinds = ['coffee', 'jack', 'intern', 'shield']
    const touchButtons = [
      { key: 'left', code: 'arrowleft' },
      { key: 'fire', code: ' ' },
      { key: 'right', code: 'arrowright' }
    ]

    const fmtMoney = (n) => formatMoney(n)
    const fmtNum = (n) => numFmt.format(Math.round(n))

    // Non-reactive runtime objects
    const reduced = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
    const game = createGame({ seed: (Date.now() & 0xffffff) || 1, reducedMotion: reduced })
    const audio = createAudio()
    let ctx = null
    let pal = readPalette(null)
    let raf = 0
    let last = 0
    let acc = 0
    let scale = 0
    let resizeObs = null
    let themeObs = null
    let lastScoreAnnounce = 0

    // ---------- data ----------
    const loadBacklog = async () => {
      loading.value = true
      loadingJoke.value = pickJoke(game.rng, 'loading')
      let list = []
      try {
        const data = await api.getBacklog()
        list = Array.isArray(data) ? data : []
      } catch (err) {
        console.error('Backlog Blaster: could not load backlog', err)
      }
      usingFallback.value = list.length === 0
      if (usingFallback.value) list = SAMPLE_BACKLOG
      types.value = makeTypes(list, translateProductName)
      game.types = types.value // the engine shares the same objects
      loading.value = false
    }

    // Keep enemy labels in the active language without rebuilding the roster.
    watch(currentLocale, () => {
      for (const ty of types.value) ty.label = translateProductName(ty.name)
      refreshPalette()
    })

    // ---------- high score ----------
    const loadHigh = () => {
      try {
        const v = Number(localStorage.getItem(HS_KEY))
        highScore.value = Number.isFinite(v) && v > 0 ? v : 0
      } catch { highScore.value = 0 }
    }
    const saveHigh = (score) => {
      newHigh.value = score > highScore.value && score > 0
      if (newHigh.value) {
        highScore.value = score
        try { localStorage.setItem(HS_KEY, String(score)) } catch { /* storage unavailable */ }
      }
    }

    // ---------- canvas ----------
    const refreshPalette = () => { pal = readPalette(document.documentElement) }

    // Backing store is an integer multiple of the logical size so pixels stay crisp.
    const resize = () => {
      const canvas = canvasEl.value
      if (!canvas) return
      const cssW = canvas.clientWidth || W
      const dpr = window.devicePixelRatio || 1
      const k = Math.max(1, Math.round((cssW * dpr) / W))
      if (k === scale) return
      scale = k
      canvas.width = W * k
      canvas.height = H * k
      ctx = canvas.getContext('2d')
      ctx.setTransform(k, 0, 0, k, 0, 0)
    }

    const render = () => {
      if (!ctx) return
      draw(ctx, game, pal, t)
    }

    // ---------- game flow ----------
    const announce = (msg) => { liveMsg.value = msg }

    const handleEvents = () => {
      for (const e of drainEvents(game)) {
        if (e.type === 'sfx') audio.play(e.name)
        else if (e.type === 'wave') {
          announce(t('game.live.wave', { n: e.n, title: t(`game.waves.${e.id}.title`) }))
        } else if (e.type === 'life') {
          announce(t('game.live.lives', { n: e.lives }))
        } else if (e.type === 'clear') {
          announce(t('game.live.score', { n: fmtMoney(e.score) }))
        } else if (e.type === 'power') {
          announce(t(`game.power.${e.kind}.name`))
        } else if (e.type === 'over') {
          result.value = e
          saveHigh(e.score)
          overJoke.value = game.overJoke
          announce(t('game.live.over', { n: fmtMoney(e.score) }))
        } else if (e.type === 'win') {
          result.value = e
          saveHigh(e.score)
          winJoke.value = game.winJoke
          announce(t('game.live.win', { n: fmtMoney(e.score) }))
        }
      }
    }

    const syncUi = () => {
      if (mode.value !== game.mode) {
        const prev = mode.value
        mode.value = game.mode
        if (game.mode === 'over' || game.mode === 'win') {
          nextTick(() => retryBtn.value && retryBtn.value.focus())
        }
        if (prev === 'play' && game.mode === 'pause') announce(t('game.live.paused'))
        if (prev === 'pause' && game.mode === 'play') announce(t('game.live.resumed'))
      }
      const sc = Math.round(game.score)
      if (sc !== liveScore.value) liveScore.value = sc
    }

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(100, now - (last || now)) // clamp after tab switches
      last = now
      acc += dt
      while (acc >= STEP_MS) {
        step(game)
        acc -= STEP_MS
      }
      handleEvents()
      syncUi()
      render()
    }

    const startGame = () => {
      audio.unlock()
      releaseAll(game)
      startRun(game)
      newHigh.value = false
      announce(t('game.live.started', { n: 1 }))
      syncUi()
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur()
    }

    const pauseToggle = () => {
      togglePause(game)
      syncUi()
    }

    const toggleMute = () => {
      muted.value = !muted.value
      audio.setMuted(muted.value)
    }

    // ---------- input ----------
    const GAME_KEYS = new Set(['arrowleft', 'arrowright', 'arrowup', 'a', 'd', 'w', ' '])
    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'p' || k === 'escape') {
        if (game.mode === 'play' || game.mode === 'pause') {
          e.preventDefault()
          pauseToggle()
        }
        return
      }
      if (!GAME_KEYS.has(k)) return
      if (game.mode === 'play') {
        e.preventDefault() // stop the page scrolling and focused buttons firing on Space
        press(game, k)
      }
    }
    const onKeyUp = (e) => release(game, e.key.toLowerCase())
    const onBlur = () => {
      releaseAll(game)
      if (game.mode === 'play') pauseToggle() // never lose a life to an unfocused tab
    }
    const onVisibility = () => { if (document.hidden) onBlur() }

    const touchDown = (e, code) => {
      audio.unlock()
      if (e.currentTarget.setPointerCapture) {
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* ignore */ }
      }
      press(game, code)
    }
    const touchUp = (e, code) => release(game, code)

    // ---------- lifecycle ----------
    onMounted(() => {
      loadHigh()
      refreshPalette()
      resize()
      resizeObs = new ResizeObserver(resize)
      resizeObs.observe(stageEl.value)
      // Re-read tokens when the theme switcher changes classes/attributes/inline vars on <html>.
      themeObs = new MutationObserver(refreshPalette)
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] })
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      window.addEventListener('blur', onBlur)
      document.addEventListener('visibilitychange', onVisibility)
      raf = requestAnimationFrame(frame)
      loadBacklog()

      if (import.meta.env.DEV) {
        // Console hook for headless verification: window.__game.start(); __game.press('arrowleft'); __game.step(600)
        window.__game = {
          state: game,
          start: startGame,
          step: (n = 1) => { stepN(game, n); handleEvents(); syncUi(); render() },
          press: (k) => press(game, k),
          release: (k) => release(game, k),
          setSeed: (n) => setSeed(game, n),
          summary: () => summary(game)
        }
      }
    })

    onBeforeUnmount(() => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
      if (resizeObs) resizeObs.disconnect()
      if (themeObs) themeObs.disconnect()
      audio.close()
      if (import.meta.env.DEV && window.__game && window.__game.state === game) delete window.__game
    })

    return {
      t, stageEl, canvasEl, startBtn, retryBtn,
      mode, loading, usingFallback, types, liveScore, highScore, newHigh, muted, liveMsg, result,
      overJoke, winJoke, loadingJoke, enemyKinds, powerKinds, touchButtons,
      fmtMoney, fmtNum, startGame, pauseToggle, toggleMute, touchDown, touchUp
    }
  }
}
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 1.25rem;
  align-items: start;
}

.stage-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

/* Keep the 3:4 field fully visible: width is capped by available height too. */
.stage {
  position: relative;
  width: min(100%, calc((100vh - 260px) * 0.75));
  min-width: 260px;
  aspect-ratio: 3 / 4;
  border: 2px solid var(--ink);
  background: var(--ink);
  overflow: hidden;
}

.canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  touch-action: none;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  padding: 1rem;
  overflow-y: auto;
  background: color-mix(in srgb, var(--ink) 88%, transparent);
  color: var(--surface);
  text-align: center;
}

.ov-title {
  font-size: 1.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--warning);
  margin: 0;
}

.ov-lead {
  max-width: 34ch;
  font-size: 0.875rem;
  line-height: 1.45;
  margin: 0;
}

.btn-arcade {
  font: inherit;
  font-weight: 700;
  font-size: 1.125rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.75rem 2rem;
  color: var(--ink);
  background: var(--warning);
  border: 2px solid var(--surface);
  box-shadow: 4px 4px 0 var(--surface);
  cursor: pointer;
  text-decoration: none;
}
.btn-arcade:hover { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 var(--surface); }
.btn-arcade:active { transform: translate(3px, 3px); box-shadow: 1px 1px 0 var(--surface); }
.btn-arcade:focus-visible,
.btn-plain:focus-visible,
.touch-btn:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }

.btn-plain {
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}
.btn-plain:hover:not(:disabled) { background: var(--surface-subtle); }
.btn-plain:disabled { opacity: 0.5; cursor: default; }
.overlay .btn-plain { background: transparent; color: var(--surface); border-color: var(--surface); }

.roster {
  width: 100%;
  margin-top: 0.5rem;
  text-align: left;
}
.roster h4 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--warning);
  margin: 0 0 0.375rem;
}
.roster-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.25rem; }
.roster-item {
  display: grid;
  grid-template-columns: 10px 1fr;
  column-gap: 0.5rem;
  font-size: 0.8125rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid color-mix(in srgb, var(--surface) 25%, transparent);
}
.r-name { font-weight: 700; }
.r-meta { grid-column: 2; font-size: 0.6875rem; opacity: 0.75; }
.dot { width: 10px; height: 10px; margin-top: 0.3rem; background: var(--accent); }
.dot.p-high { background: var(--danger); }
.dot.p-medium { background: var(--warning); }
.dot.p-low { background: var(--accent); }
.roster-hint, .roster-note { font-size: 0.6875rem; opacity: 0.75; margin: 0.375rem 0 0; }

.hr-kicker {
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  opacity: 0.8;
  margin: 0.5rem 0 0;
}
.hr-joke { font-size: 0.9375rem; line-height: 1.45; max-width: 32ch; margin: 0; }
.new-high { color: var(--warning); font-weight: 700; margin: 0; }

.sheet {
  width: 100%;
  margin: 0;
  display: grid;
  gap: 0.25rem;
  font-size: 0.875rem;
}
.sheet > div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.25rem 0;
  border-bottom: 1px dashed color-mix(in srgb, currentColor 35%, transparent);
}
.sheet dt { text-align: left; }
.sheet dd { margin: 0; font-weight: 700; text-align: right; }

.ov-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; align-items: center; margin-top: 0.5rem; }

/* The certificate keeps a light "paper" look in every theme via surface/ink tokens */
.cert {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--surface);
  color: var(--ink);
  border: 4px double var(--warning);
}
.cert-title { font-size: 1.375rem; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.375rem; }
.cert-line { font-size: 0.8125rem; margin: 0 0 0.25rem; }
.cert-cite { font-size: 0.75rem; font-style: italic; color: var(--muted); margin: 0 0 0.5rem; }
.cert-sign { font-size: 0.6875rem; color: var(--muted); margin: 0.5rem 0 0; transform: rotate(-1.5deg); }

.touch { display: flex; gap: 0.5rem; width: min(100%, 480px); }
.touch-btn {
  flex: 1;
  min-height: 52px;
  font: inherit;
  font-weight: 700;
  color: var(--ink);
  background: var(--surface);
  border: 2px solid var(--ink);
  box-shadow: 3px 3px 0 var(--ink);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}
.touch-btn:active { transform: translate(2px, 2px); box-shadow: 1px 1px 0 var(--ink); }
.touch-fire { flex: 1.5; background: var(--warning); }

.toolbar { display: flex; gap: 0.5rem; }

.side { display: grid; gap: 1rem; }
.side .card { margin-bottom: 0; }
.side-h { font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin: 0 0 0.5rem; }
.side-h.gap { margin-top: 1rem; }
.stat-row { display: flex; justify-content: space-between; align-items: baseline; padding: 0.25rem 0; font-size: 0.875rem; color: var(--muted); }
.stat-row strong { color: var(--ink); font-size: 1.125rem; }
.plain-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; font-size: 0.8125rem; color: var(--ink); }
.plain-list .dim { display: block; color: var(--muted); font-size: 0.75rem; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 960px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  .stage { width: min(100%, calc((100vh - 220px) * 0.75)); }
}

@media (prefers-reduced-motion: reduce) {
  .btn-arcade, .touch-btn { transition: none; }
  .btn-arcade:hover, .btn-arcade:active, .touch-btn:active { transform: none; }
}
</style>
