import type { Game, Player } from '@/types/game'

/** Players still in the game, in seating order. */
export function activePlayers(game: Game): Player[] {
  return game.players.filter((player) => !player.eliminated)
}

export function playerAt(game: Game, index: number): Player | undefined {
  return game.players[index]
}

/**
 * Next player in seating order who is still in the game, wrapping around.
 * Returns -1 if nobody is left.
 */
export function nextActiveIndex(game: Game, from: number): number {
  const total = game.players.length
  for (let step = 1; step <= total; step++) {
    const index = (from + step) % total
    if (!game.players[index].eliminated) return index
  }
  return -1
}

export function firstActiveIndex(game: Game): number {
  const index = game.players.findIndex((player) => !player.eliminated)
  return index
}

/**
 * Who opens the round. The starter rotates each round so the same person
 * isn't always forced to give the first (hardest) clue.
 */
export function startingIndexForRound(game: Game, round: number): number {
  const active = activePlayers(game)
  if (active.length === 0) return -1
  const starter = active[(round - 1) % active.length]
  return game.players.findIndex((player) => player.id === starter.id)
}

/** Clue order for the round: starter first, then seating order, wrapping. */
export function turnOrder(game: Game, startIndex: number): Player[] {
  const total = game.players.length
  const order: Player[] = []
  for (let step = 0; step < total; step++) {
    const player = game.players[(startIndex + step) % total]
    if (!player.eliminated) order.push(player)
  }
  return order
}
