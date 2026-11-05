// Joke pools. The text lives in locales/game.*.js under game.jokes.<pool>.<n> (n starts at 1).
export const JOKE_COUNTS = {
  hit: 6, // player got hurt
  breach: 4, // shortage reached the floor
  po: 5, // crate defeated (takes {item})
  bonusKill: 4, // email / invite / forecast defeated
  over: 6, // HR screen
  loading: 4,
  taunt: 7, // the Auditor speaks
  bossDown: 2,
  cert: 4, // victory certificate citation
  pause: 3,
  clear: 4 // wave cleared
}

export const jokeKey = (pool, n) => `game.jokes.${pool}.${n}`

export function pickJoke(rng, pool) {
  return jokeKey(pool, 1 + Math.floor(rng() * JOKE_COUNTS[pool]))
}

export function allJokeKeys() {
  const keys = []
  for (const [pool, n] of Object.entries(JOKE_COUNTS)) for (let i = 1; i <= n; i++) keys.push(jokeKey(pool, i))
  return keys
}
