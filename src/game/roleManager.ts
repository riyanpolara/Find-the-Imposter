import type { Role } from '@/types/game'
import { shuffle, type Rng } from './rng'

/**
 * Builds the role deck: exactly `mrWhiteCount` Mr. Whites and the rest
 * Civilians, then shuffled so no position is predictable.
 */
export function generateRoles(
  playerCount: number,
  mrWhiteCount: number,
  rng?: Rng,
): Role[] {
  if (!Number.isInteger(playerCount) || playerCount < 1) {
    throw new Error(`generateRoles: invalid playerCount ${playerCount}`)
  }
  if (!Number.isInteger(mrWhiteCount) || mrWhiteCount < 1 || mrWhiteCount >= playerCount) {
    throw new Error(`generateRoles: invalid mrWhiteCount ${mrWhiteCount} for ${playerCount} players`)
  }

  const roles: Role[] = [
    ...Array.from({ length: playerCount - mrWhiteCount }, () => 'CIVILIAN' as const),
    ...Array.from({ length: mrWhiteCount }, () => 'MR_WHITE' as const),
  ]

  return shuffle(roles, rng)
}

export function countRole(roles: readonly Role[], role: Role): number {
  return roles.filter((r) => r === role).length
}
