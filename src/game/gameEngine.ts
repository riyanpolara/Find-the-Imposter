import type { Card, Game, Player, SetupConfig } from '@/types/game'
import { assignCard, findCard, generateCards } from './cardManager'
import { makeId, type Rng } from './rng'
import { generateRoles } from './roleManager'
import { startingIndexForRound } from './roundManager'
import { isValidConfig, normaliseName } from './setupRules'
import { pickSecretWord } from './wordManager'

/**
 * Everything a game needs is computed here, up front, in one synchronous pass.
 * There is no async work anywhere in the engine — the UI must never show a
 * spinner for local arithmetic.
 */
export function createGame(config: SetupConfig, rng?: Rng): Game {
  const { playerCount, mrWhiteCount, names } = config

  if (!isValidConfig(playerCount, mrWhiteCount)) {
    throw new Error(`createGame: invalid config ${playerCount}/${mrWhiteCount}`)
  }
  if (names.length !== playerCount) {
    throw new Error(`createGame: expected ${playerCount} names, got ${names.length}`)
  }

  const roles = generateRoles(playerCount, mrWhiteCount, rng)
  const cards = generateCards(roles, rng)
  const { category, word } = pickSecretWord(rng)

  const players: Player[] = names.map((name) => ({
    id: makeId('player'),
    name: normaliseName(name),
    role: null,
    eliminated: false,
  }))

  return {
    id: makeId('game'),
    players,
    cards,
    secretWord: word,
    category,
    currentRound: 0,
    currentPlayerIndex: 0,
    votes: [],
  }
}

export function currentPlayer(game: Game): Player {
  return game.players[game.currentPlayerIndex]
}

/**
 * Binds the chosen card to the current player and copies its role across.
 * This is the moment a player's role is actually decided.
 */
export function selectCard(game: Game, cardId: string): Game {
  const card = findCard(game.cards, cardId)
  if (!card) throw new Error(`selectCard: unknown card ${cardId}`)

  const player = currentPlayer(game)
  if (player.cardId) throw new Error(`selectCard: ${player.name} already holds a card`)

  return {
    ...game,
    cards: assignCard(game.cards, cardId, player.id),
    players: game.players.map((p, i) =>
      i === game.currentPlayerIndex ? { ...p, role: card.role, cardId: card.id } : p,
    ),
  }
}

/** The card the current player just picked, for the reveal screen. */
export function currentCard(game: Game): Card | undefined {
  const player = currentPlayer(game)
  return player.cardId ? findCard(game.cards, player.cardId) : undefined
}

export function dealingComplete(game: Game): boolean {
  return game.players.every((player) => player.role !== null)
}

/** Hands the phone to the next player who still needs a card. */
export function advanceToNextPlayer(game: Game): Game {
  const next = game.players.findIndex((player) => player.role === null)
  return { ...game, currentPlayerIndex: next === -1 ? game.currentPlayerIndex : next }
}

/** Kicks off round `n`, putting the phone on that round's starting player. */
export function startRound(game: Game): Game {
  const round = game.currentRound + 1
  const withRound = { ...game, currentRound: round }
  return { ...withRound, currentPlayerIndex: startingIndexForRound(withRound, round) }
}

/** Fresh roles, word and cards; same people. Used by "Play Again". */
export function replayGame(game: Game, config: SetupConfig, rng?: Rng): Game {
  return createGame({ ...config, names: game.players.map((p) => p.name) }, rng)
}
