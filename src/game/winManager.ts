import type { Game, Winner } from '@/types/game'
import { activePlayers } from './roundManager'

export type Standing = { civilians: number; mrWhites: number }

export function remaining(game: Game): Standing {
  const alive = activePlayers(game)
  return {
    civilians: alive.filter((p) => p.role === 'CIVILIAN').length,
    mrWhites: alive.filter((p) => p.role === 'MR_WHITE').length,
  }
}

/**
 * The whole win rulebook, in one place so it can be tuned without touching the
 * rest of the engine.
 *
 *   1. No Mr. Whites left            -> Civilians win.
 *   2. Mr. Whites >= Civilians       -> Mr. White wins. Without this the game
 *                                       drags on after it has become unwinnable
 *                                       for the Civilians.
 *
 * A correct Mr. White guess also wins, but that is decided at the guess itself
 * (see `applyGuess` in the store) rather than from the board state.
 */
export function checkWinCondition(game: Game): Winner | null {
  const { civilians, mrWhites } = remaining(game)
  if (mrWhites === 0) return 'CIVILIANS'
  if (mrWhites >= civilians) return 'MR_WHITE'
  return null
}
