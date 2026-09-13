import type { Game, Phase, SetupConfig, Winner } from '@/types/game'
import {
  advanceToNextPlayer,
  createGame,
  dealingComplete,
  selectCard,
  startRound,
} from './gameEngine'
import { activePlayers } from './roundManager'
import {
  clampMrWhiteCount,
  clampPlayerCount,
  NAME_MAX_LENGTH,
  namesAreValid,
  resizeNames,
} from './setupRules'
import { clearRoundVotes, recordVote, resolveVote, voters } from './voteManager'
import { guessMatches } from './wordManager'
import { checkWinCondition } from './winManager'

export type AppState = {
  phase: Phase
  /** 1 = moving forward, -1 = going back. Drives the screen transition. */
  direction: 1 | -1
  /** Kept across games so "Play Again" never asks for names twice. */
  setup: SetupConfig
  game: Game | null
  /** Which of the active players is holding the phone to vote. */
  votingIndex: number
  /** Who the vote removed — needed by the elimination and guess screens. */
  eliminatedId: string | null
  /** Outcome of the caught Mr. White's one guess. */
  guessOutcome: 'CORRECT' | 'WRONG' | null
  /** Id of the last game logged to Supabase. Persisted, so a refresh on the
   *  game-over screen doesn't log the same game a second time. */
  recordedGameId: string | null
}

const DEFAULT_PLAYERS = 8
const DEFAULT_MR_WHITES = 2

export const initialState: AppState = {
  phase: 'INTRO',
  direction: 1,
  setup: {
    playerCount: DEFAULT_PLAYERS,
    mrWhiteCount: DEFAULT_MR_WHITES,
    names: Array.from({ length: DEFAULT_PLAYERS }, () => ''),
  },
  game: null,
  votingIndex: 0,
  eliminatedId: null,
  guessOutcome: null,
  recordedGameId: null,
}

export type Action =
  | { type: 'COMPLETE_INTRO' }
  | { type: 'REPLAY_INTRO' }
  | { type: 'START_SETUP' }
  | { type: 'STEP_PLAYER_COUNT'; delta: number }
  | { type: 'STEP_MR_WHITE_COUNT'; delta: number }
  | { type: 'SET_NAME'; index: number; value: string }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'GO_HOME' }
  | { type: 'GENERATE_GAME' }
  | { type: 'PLAYER_READY' }
  | { type: 'SELECT_CARD'; cardId: string }
  | { type: 'HIDE_CARD' }
  | { type: 'START_ROUND' }
  | { type: 'START_VOTING' }
  | { type: 'SUBMIT_VOTE'; targetId: string }
  | { type: 'RESOLVE_VOTE' }
  | { type: 'CONTINUE_AFTER_ELIMINATION' }
  | { type: 'SUBMIT_GUESS'; guess: string }
  | { type: 'CONTINUE_AFTER_GUESS' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'MARK_RECORDED'; gameId: string }
  | { type: 'RESTORE'; state: AppState }

/** Back only exists before the game is generated — you cannot un-see a role. */
const BACK_TO: Partial<Record<Phase, Phase>> = {
  SETUP_PLAYERS: 'HOME',
  SETUP_MR_WHITES: 'SETUP_PLAYERS',
  PLAYER_NAMES: 'SETUP_MR_WHITES',
}

const NEXT_FROM: Partial<Record<Phase, Phase>> = {
  SETUP_PLAYERS: 'SETUP_MR_WHITES',
  SETUP_MR_WHITES: 'PLAYER_NAMES',
}

function forward(state: AppState, phase: Phase, patch: Partial<AppState> = {}): AppState {
  return { ...state, ...patch, phase, direction: 1 }
}

/** Either the game ends here, or the next round begins. */
function continueOrEnd(state: AppState, game: Game, winner: Winner | null): AppState {
  if (winner) {
    return forward(state, 'GAME_OVER', { game: { ...game, winner } })
  }
  return forward(state, 'ROUND', { game: startRound(game), votingIndex: 0 })
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'RESTORE':
      return action.state

    case 'MARK_RECORDED':
      return { ...state, recordedGameId: action.gameId }

    case 'COMPLETE_INTRO':
      return forward(state, 'HOME')

    case 'REPLAY_INTRO':
      return { ...state, phase: 'INTRO', direction: -1 }

    case 'START_SETUP':
      return forward(state, 'SETUP_PLAYERS')

    case 'STEP_PLAYER_COUNT': {
      const playerCount = clampPlayerCount(state.setup.playerCount + action.delta)
      return {
        ...state,
        setup: {
          playerCount,
          // Shrinking the table can invalidate the Mr. White count, so re-clamp.
          mrWhiteCount: clampMrWhiteCount(playerCount, state.setup.mrWhiteCount),
          names: resizeNames(state.setup.names, playerCount),
        },
      }
    }

    case 'STEP_MR_WHITE_COUNT':
      return {
        ...state,
        setup: {
          ...state.setup,
          mrWhiteCount: clampMrWhiteCount(
            state.setup.playerCount,
            state.setup.mrWhiteCount + action.delta,
          ),
        },
      }

    case 'SET_NAME': {
      const names = [...state.setup.names]
      // The input's maxLength covers typing and pasting; this covers everything
      // else, so state can never hold a name the layout wasn't designed for.
      names[action.index] = action.value.slice(0, NAME_MAX_LENGTH)
      return { ...state, setup: { ...state.setup, names } }
    }

    case 'NEXT': {
      const next = NEXT_FROM[state.phase]
      return next ? forward(state, next) : state
    }

    case 'BACK': {
      const back = BACK_TO[state.phase]
      return back ? { ...state, phase: back, direction: -1 } : state
    }

    case 'GO_HOME':
      return {
        ...state,
        phase: 'HOME',
        direction: -1,
        game: null,
        votingIndex: 0,
        eliminatedId: null,
        guessOutcome: null,
      }

    case 'GENERATE_GAME': {
      if (state.phase !== 'PLAYER_NAMES') return state
      if (!namesAreValid(state.setup.names)) return state
      // Everything — roles, word, cards, assignments — is computed here, in
      // one synchronous pass. No loading state, because there is no waiting.
      return forward(state, 'PASS_PHONE', {
        game: createGame(state.setup),
        votingIndex: 0,
        eliminatedId: null,
        guessOutcome: null,
      })
    }

    case 'PLAYER_READY':
      if (state.phase !== 'PASS_PHONE') return state
      return forward(state, 'CARD_DISTRIBUTION')

    case 'SELECT_CARD': {
      if (state.phase !== 'CARD_DISTRIBUTION' || !state.game) return state
      return forward(state, 'CARD_REVEAL', { game: selectCard(state.game, action.cardId) })
    }

    case 'HIDE_CARD': {
      if (state.phase !== 'CARD_REVEAL' || !state.game) return state
      if (dealingComplete(state.game)) {
        return forward(state, 'GAME_READY', { game: { ...state.game, currentPlayerIndex: 0 } })
      }
      return forward(state, 'PASS_PHONE', { game: advanceToNextPlayer(state.game) })
    }

    case 'START_ROUND': {
      if (!state.game) return state
      if (state.phase !== 'GAME_READY') return state
      return forward(state, 'ROUND', { game: startRound(state.game), votingIndex: 0 })
    }

    case 'START_VOTING':
      if (state.phase !== 'ROUND') return state
      return forward(state, 'VOTING', { votingIndex: 0 })

    case 'SUBMIT_VOTE': {
      if (state.phase !== 'VOTING' || !state.game) return state
      const ballot = voters(state.game)
      const voter = ballot[state.votingIndex]
      if (!voter) return state

      const game = recordVote(state.game, voter.id, action.targetId)
      const next = state.votingIndex + 1
      // Tallies stay hidden until the last ballot is in.
      if (next >= ballot.length) {
        return forward(state, 'VOTE_RESULTS', { game, votingIndex: next })
      }
      return { ...state, game, votingIndex: next }
    }

    case 'RESOLVE_VOTE': {
      if (state.phase !== 'VOTE_RESULTS' || !state.game) return state
      const outcome = resolveVote(state.game, state.game.currentRound)

      if (outcome.kind === 'TIE') {
        // Nobody goes. Wipe the ballots and run the same round again.
        return forward(state, 'VOTING', {
          game: clearRoundVotes(state.game, state.game.currentRound),
          votingIndex: 0,
        })
      }

      const game: Game = {
        ...state.game,
        players: state.game.players.map((p) =>
          p.id === outcome.playerId ? { ...p, eliminated: true } : p,
        ),
      }
      return forward(state, 'ELIMINATION', { game, eliminatedId: outcome.playerId })
    }

    case 'CONTINUE_AFTER_ELIMINATION': {
      if (state.phase !== 'ELIMINATION' || !state.game) return state
      const eliminated = state.game.players.find((p) => p.id === state.eliminatedId)
      if (!eliminated) return state

      // A caught Mr. White gets one shot at the word before the board is judged.
      if (eliminated.role === 'MR_WHITE') {
        return forward(state, 'MR_WHITE_GUESS')
      }
      return continueOrEnd(state, state.game, checkWinCondition(state.game))
    }

    case 'SUBMIT_GUESS': {
      if (state.phase !== 'MR_WHITE_GUESS' || !state.game) return state
      const correct = guessMatches(action.guess, state.game.secretWord)
      return {
        ...state,
        guessOutcome: correct ? 'CORRECT' : 'WRONG',
      }
    }

    case 'CONTINUE_AFTER_GUESS': {
      if (state.phase !== 'MR_WHITE_GUESS' || !state.game || !state.guessOutcome) return state
      if (state.guessOutcome === 'CORRECT') {
        // Guessing the word steals the win outright, caught or not.
        return forward(state, 'GAME_OVER', { game: { ...state.game, winner: 'MR_WHITE' } })
      }
      return continueOrEnd(state, state.game, checkWinCondition(state.game))
    }

    case 'PLAY_AGAIN': {
      // Same table, same split, brand new roles, word and cards.
      if (!namesAreValid(state.setup.names)) return state
      return forward(state, 'PASS_PHONE', {
        game: createGame(state.setup),
        votingIndex: 0,
        eliminatedId: null,
        guessOutcome: null,
      })
    }

    default:
      return state
  }
}

/** Guard against an impossible board: nobody left to vote. */
export function ballotSize(state: AppState): number {
  return state.game ? activePlayers(state.game).length : 0
}
