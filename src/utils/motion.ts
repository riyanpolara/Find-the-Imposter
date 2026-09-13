import type { Transition, Variants } from 'framer-motion'

/**
 * Shared motion vocabulary.
 *
 * The game must feel instant, so every duration here is deliberate and short.
 * Budget (from the design brief):
 *   button feedback      100–180ms
 *   small UI transition  150–250ms
 *   screen transition    200–350ms
 *   card flip            400–600ms
 *   major reveal         500–800ms
 *
 * Only `transform` and `opacity` are animated so low-end Android stays at 60fps.
 */

export const spring = {
  /** Snappy, no overshoot — taps and toggles. */
  press: { type: 'spring', stiffness: 700, damping: 40, mass: 0.6 },
  /** Default UI spring with a hint of life. */
  soft: { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 },
  /** Screen-level movement. */
  screen: { type: 'spring', stiffness: 300, damping: 32, mass: 1 },
} satisfies Record<string, Transition>

export const duration = {
  fast: 0.15,
  base: 0.25,
  screen: 0.32,
  reveal: 0.6,
} as const

/** Horizontal page transition. `custom` is the direction: 1 forward, -1 back. */
export const pageVariants: Variants = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 28 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -20 }),
}

/** Parent of a staggered entrance. Pair with `riseItem`. */
export const riseGroup: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
}

export const riseItem: Variants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 },
  },
}
