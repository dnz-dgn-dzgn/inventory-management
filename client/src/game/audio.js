// Tiny WebAudio blips. No files. The AudioContext is created lazily after a user gesture.
const SOUNDS = {
  shoot: { type: 'square', f: [620, 300], d: 0.07, v: 0.05 },
  hit: { type: 'square', f: [220, 160], d: 0.05, v: 0.06 },
  boom: { type: 'sawtooth', f: [180, 40], d: 0.28, v: 0.09 },
  hurt: { type: 'sawtooth', f: [300, 60], d: 0.4, v: 0.1 },
  power: { type: 'square', seq: [440, 660, 880], d: 0.09, v: 0.06 },
  wave: { type: 'triangle', seq: [330, 330, 495], d: 0.12, v: 0.08 },
  lose: { type: 'triangle', seq: [330, 262, 196, 130], d: 0.2, v: 0.09 },
  win: { type: 'square', seq: [523, 659, 784, 1047], d: 0.15, v: 0.07 }
}

export function createAudio() {
  let ctx = null
  let muted = true // sound is OFF by default
  let lastShoot = 0

  const ensure = () => {
    if (ctx || typeof window === 'undefined') return ctx
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    try { ctx = new AC() } catch { ctx = null }
    return ctx
  }

  function tone(type, f0, f1, start, dur, vol) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.setValueAtTime(f0, start)
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), start + dur)
    g.gain.setValueAtTime(vol, start)
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
    o.connect(g).connect(ctx.destination)
    o.start(start)
    o.stop(start + dur + 0.02)
  }

  return {
    /** Call from a click/keydown handler. */
    unlock() {
      if (muted) return
      const c = ensure()
      if (c && c.state === 'suspended') c.resume()
    },
    setMuted(m) {
      muted = m
      if (!m) this.unlock()
    },
    isMuted: () => muted,
    play(name) {
      if (muted) return
      const c = ensure()
      const snd = SOUNDS[name]
      if (!c || !snd || c.state !== 'running') return
      if (name === 'shoot') { // rapid fire would otherwise stack dozens of oscillators
        if (c.currentTime - lastShoot < 0.06) return
        lastShoot = c.currentTime
      }
      const t0 = c.currentTime
      if (snd.seq) snd.seq.forEach((f, i) => tone(snd.type, f, f, t0 + i * snd.d, snd.d, snd.v))
      else tone(snd.type, snd.f[0], snd.f[1], t0, snd.d, snd.v)
    },
    close() {
      if (ctx) { try { ctx.close() } catch { /* already closed */ } }
      ctx = null
    }
  }
}
