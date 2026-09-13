/** Every player is one of these. Mr. Whites never learn the secret word. */
export type Role = 'CIVILIAN' | 'MR_WHITE'

export type Winner = 'CIVILIANS' | 'MR_WHITE'

/**
 * The single value that drives the whole UI.
 *
 * Deviation from the original sketch: `phase` lives on the app store rather
 * than on `Game`, because the pre-game screens (HOME, setup, names) exist
 * before a `Game` does. One enum, one source of truth, no booleans.
 */
export type Phase =
  | 'INTRO'
  | 'HOME'
  | 'SETUP_PLAYERS'
  | 'SETUP_MR_WHITES'
  | 'PLAYER_NAMES'
  | 'PASS_PHONE'
  | 'CARD_DISTRIBUTION'
  | 'CARD_REVEAL'
  | 'GAME_READY'
  | 'ROUND'
  | 'VOTING'
  | 'VOTE_RESULTS'
  | 'ELIMINATION'
  | 'MR_WHITE_GUESS'
  | 'GAME_OVER'

export type Player = {
  id: string
  name: string
  /** null until this player has picked a card — they have no role before then. */
  role: Role | null
  eliminated: boolean
  cardId?: string
}

/**
 * A face-down card. The role is dealt onto the card *before* anyone picks, so
 * choosing a card genuinely decides your role rather than the app pretending it
 * did. `role` is never written to the DOM until its owner reveals it.
 */
export type Card = {
  id: string
  role: Role
  selected: boolean
  assignedPlayerId?: string
}

export type Vote = {
  voterId: string
  targetId: string
  round: number
}

export type Game = {
  id: string
  players: Player[]
  cards: Card[]
  secretWord: string
  category: string
  currentRound: number
  /** Whose turn it is: to pick a card during dealing, to start during a round. */
  currentPlayerIndex: number
  votes: Vote[]
  winner?: Winner
}

/** Survives "Play Again" so nobody retypes names. */
export type SetupConfig = {
  playerCount: number
  mrWhiteCount: number
  names: string[]
}
