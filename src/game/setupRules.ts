/**
 * Configuration limits and validation. Kept separate from the engine so the
 * setup screens can enforce the same rules the engine assumes.
 */

export const PLAYER_MIN = 3
export const PLAYER_MAX = 20
export const MR_WHITE_MIN = 1
export const NAME_MAX_LENGTH = 20

/**
 * Mr. Whites must stay strictly outnumbered at kick-off.
 *
 * "At least one Civilian" (the original wording) isn't enough: the win rule
 * says Mr. Whites win the moment they equal the Civilians, so a 5v5 game would
 * be over before the first clue. Capping at floor((n-1)/2) guarantees every
 * game starts playable.
 */
export function maxMrWhites(playerCount: number): number {
  return Math.max(MR_WHITE_MIN, Math.floor((playerCount - 1) / 2))
}

export function clampPlayerCount(value: number): number {
  return Math.min(PLAYER_MAX, Math.max(PLAYER_MIN, Math.round(value)))
}

export function clampMrWhiteCount(playerCount: number, value: number): number {
  return Math.min(maxMrWhites(playerCount), Math.max(MR_WHITE_MIN, Math.round(value)))
}

export function civilianCount(playerCount: number, mrWhiteCount: number): number {
  return playerCount - mrWhiteCount
}

export function isValidConfig(playerCount: number, mrWhiteCount: number): boolean {
  return (
    Number.isInteger(playerCount) &&
    Number.isInteger(mrWhiteCount) &&
    playerCount >= PLAYER_MIN &&
    playerCount <= PLAYER_MAX &&
    mrWhiteCount >= MR_WHITE_MIN &&
    mrWhiteCount <= maxMrWhites(playerCount)
  )
}

export type NameIssue = 'EMPTY' | 'DUPLICATE'

export function normaliseName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

/**
 * Returns an issue per index, or null where the name is fine.
 * Duplicates are matched case-insensitively — "Jay" and "jay" would be
 * indistinguishable when the phone is passed around.
 */
export function validateNames(names: string[]): (NameIssue | null)[] {
  const seen = new Map<string, number>()
  const counts = new Map<string, number>()

  for (const raw of names) {
    const key = normaliseName(raw).toLowerCase()
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  seen.clear()

  return names.map((raw) => {
    const clean = normaliseName(raw)
    if (!clean) return 'EMPTY'
    if ((counts.get(clean.toLowerCase()) ?? 0) > 1) return 'DUPLICATE'
    return null
  })
}

export function namesAreValid(names: string[]): boolean {
  return validateNames(names).every((issue) => issue === null)
}

/** Grow/shrink the name list when the player count changes, keeping what's typed. */
export function resizeNames(names: string[], playerCount: number): string[] {
  const next = names.slice(0, playerCount)
  while (next.length < playerCount) next.push('')
  return next
}
