/**
 * Randomness is injected everywhere so every engine function is deterministic
 * under test. Production callers just omit the argument.
 */
export type Rng = () => number

export const defaultRng: Rng = Math.random

/** Fisher-Yates. Returns a new array; never mutates the input. */
export function shuffle<T>(items: readonly T[], rng: Rng = defaultRng): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function pickOne<T>(items: readonly T[], rng: Rng = defaultRng): T {
  if (items.length === 0) throw new Error('pickOne: empty list')
  return items[Math.floor(rng() * items.length)]
}

/** Seeded generator (mulberry32) — used by the engine's test harness. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let counter = 0
/** Stable, collision-free ids without pulling in a uuid dependency. */
export function makeId(prefix: string): string {
  counter += 1
  return `${prefix}_${counter.toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`
}
