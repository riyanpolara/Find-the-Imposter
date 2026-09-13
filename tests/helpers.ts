import { availableCards } from '@/game/cardManager'
import { activePlayers } from '@/game/roundManager'
import { type Action, type AppState, initialState, reducer } from '@/game/store'
import { eligibleTargets, voters } from '@/game/voteManager'
import type { Game, Player } from '@/types/game'

/** Apply a sequence of actions. */
export function drive(state: AppState, ...actions: Action[]): AppState {
  return actions.reduce(reducer, state)
}

export function names(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `Player${i + 1}`)
}

/** Walk the real setup screens to a generated game sitting on PASS_PHONE. */
export function setupGame(
  playerCount: number,
  mrWhiteCount: number,
  roster: string[] = names(playerCount),
): AppState {
  let s = drive(initialState, { type: 'START_SETUP' })
  s = drive(s, { type: 'STEP_PLAYER_COUNT', delta: playerCount - s.setup.playerCount })
  s = drive(s, { type: 'NEXT' })
  s = drive(s, { type: 'STEP_MR_WHITE_COUNT', delta: mrWhiteCount - s.setup.mrWhiteCount })
  s = drive(s, { type: 'NEXT' })
  roster.forEach((value, index) => {
    s = drive(s, { type: 'SET_NAME', index, value })
  })
  return drive(s, { type: 'GENERATE_GAME' })
}

/** Every player takes a card, through the real handoff -> pick -> reveal loop. */
export function dealAll(state: AppState, pick: (n: number) => number = () => 0): AppState {
  let s = state
  for (let i = 0; i < s.game!.players.length; i++) {
    const free = availableCards(s.game!.cards)
    s = drive(
      s,
      { type: 'PLAYER_READY' },
      { type: 'SELECT_CARD', cardId: free[pick(free.length) % free.length].id },
      { type: 'HIDE_CARD' },
    )
  }
  return s
}

export function dealtGame(playerCount: number, mrWhiteCount: number): AppState {
  return dealAll(setupGame(playerCount, mrWhiteCount))
}

export const mrWhites = (g: Game): Player[] => g.players.filter((p) => p.role === 'MR_WHITE')
export const civilians = (g: Game): Player[] => g.players.filter((p) => p.role === 'CIVILIAN')
export const nameOf = (g: Game, id: string) => g.players.find((p) => p.id === id)!.name

/** Run one full ballot where everyone able to vote picks `targetId`. */
export function voteOut(state: AppState, targetId: string): AppState {
  let s = drive(state, { type: 'START_VOTING' })
  const ballotSize = voters(s.game!).length
  for (let i = 0; i < ballotSize; i++) {
    const voter = voters(s.game!)[s.votingIndex]
    const options = eligibleTargets(s.game!, voter.id)
    const target = options.find((p) => p.id === targetId) ?? options[0]
    s = drive(s, { type: 'SUBMIT_VOTE', targetId: target.id })
  }
  return s
}

/** Resolve a vote and clear the elimination / guess screens that follow. */
export function settle(state: AppState, guess = 'definitely-not-the-word'): AppState {
  let s = drive(state, { type: 'RESOLVE_VOTE' })
  if (s.phase === 'ELIMINATION') s = drive(s, { type: 'CONTINUE_AFTER_ELIMINATION' })
  if (s.phase === 'MR_WHITE_GUESS') {
    s = drive(s, { type: 'SUBMIT_GUESS', guess }, { type: 'CONTINUE_AFTER_GUESS' })
  }
  return s
}

export type PlayResult = {
  state: AppState
  rounds: number
  steps: number
}

/**
 * Plays a dealt game to its end.
 *
 * `chooseTarget` decides who the table votes out each round, which is what
 * separates "civilians win" runs from "Mr. White wins" runs in the matrix.
 */
export function playToEnd(
  start: AppState,
  chooseTarget: (alive: Player[], game: Game) => Player,
  maxSteps = 300,
): PlayResult {
  let s = drive(start, { type: 'START_ROUND' })
  let steps = 0

  while (s.phase !== 'GAME_OVER' && steps < maxSteps) {
    steps++
    const alive = activePlayers(s.game!)
    if (alive.length < 2) break
    s = voteOut(s, chooseTarget(alive, s.game!).id)
    s = settle(s)
  }

  return { state: s, rounds: s.game!.currentRound, steps }
}
