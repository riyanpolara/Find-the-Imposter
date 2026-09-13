import { describe, expect, it } from 'vitest'

import { availableCards } from '@/game/cardManager'
import { activePlayers, turnOrder } from '@/game/roundManager'
import { isValidConfig } from '@/game/setupRules'
import type { AppState } from '@/game/store'
import { eligibleTargets, voters } from '@/game/voteManager'
import { checkWinCondition, remaining } from '@/game/winManager'
import {
  civilians,
  dealAll,
  drive,
  mrWhites,
  playToEnd,
  setupGame,
} from './helpers'

/** The configurations the game has to handle. */
const CONFIGS = [
  { players: 3, whites: 1 },
  { players: 5, whites: 1 },
  { players: 6, whites: 2 },
  { players: 8, whites: 2 },
  { players: 10, whites: 3 },
  { players: 12, whites: 3 },
  { players: 15, whites: 4 },
] as const

describe.each(CONFIGS)('$players players / $whites Mr White(s)', ({ players, whites }) => {
  it('is a legal configuration', () => {
    expect(isValidConfig(players, whites)).toBe(true)
    expect(whites).toBeLessThan(players - whites)
  })

  it('generates the exact split', () => {
    const s = setupGame(players, whites)
    expect(s.phase).toBe('PASS_PHONE')
    expect(s.game!.players).toHaveLength(players)
    expect(s.game!.cards).toHaveLength(players)
    expect(s.game!.players.every((p) => p.role === null)).toBe(true)

    const dealt = dealAll(s)
    expect(mrWhites(dealt.game!)).toHaveLength(whites)
    expect(civilians(dealt.game!)).toHaveLength(players - whites)
  })

  it('deals every card exactly once, shrinking the pool each time', () => {
    let s = setupGame(players, whites)
    const taken = new Set<string>()

    for (let i = 0; i < players; i++) {
      const free = availableCards(s.game!.cards)
      expect(free).toHaveLength(players - i)

      const chosen = free[i % free.length]
      expect(taken.has(chosen.id)).toBe(false)

      s = drive(s, { type: 'PLAYER_READY' }, { type: 'SELECT_CARD', cardId: chosen.id })
      expect(s.game!.players[i].role).toBe(chosen.role)
      taken.add(chosen.id)
      s = drive(s, { type: 'HIDE_CARD' })
    }

    expect(taken.size).toBe(players)
    expect(s.phase).toBe('GAME_READY')
    expect(availableCards(s.game!.cards)).toHaveLength(0)
  })

  it('runs a full ballot with nobody able to vote for themselves', () => {
    const s = drive(dealAll(setupGame(players, whites)), { type: 'START_ROUND' }, { type: 'START_VOTING' })
    expect(voters(s.game!)).toHaveLength(players)
    for (const voter of voters(s.game!)) {
      const options = eligibleTargets(s.game!, voter.id)
      expect(options).toHaveLength(players - 1)
      expect(options.some((p) => p.id === voter.id)).toBe(false)
    }
  })

  it('ends as a Civilian win when the table finds every Mr White', () => {
    const start = dealAll(setupGame(players, whites))
    const { state, rounds } = playToEnd(start, (alive) => alive.find((p) => p.role === 'MR_WHITE')!)

    expect(state.phase).toBe('GAME_OVER')
    expect(state.game!.winner).toBe('CIVILIANS')
    expect(mrWhites(state.game!).every((p) => p.eliminated)).toBe(true)
    expect(rounds).toBe(whites)
  })

  it('ends as a Mr White win when the table keeps voting out Civilians', () => {
    const start = dealAll(setupGame(players, whites))
    const { state } = playToEnd(start, (alive) => alive.find((p) => p.role === 'CIVILIAN')!)

    expect(state.phase).toBe('GAME_OVER')
    expect(state.game!.winner).toBe('MR_WHITE')
    const standing = remaining(state.game!)
    expect(standing.mrWhites).toBeGreaterThanOrEqual(standing.civilians)
  })

  it('always terminates under random voting, and never mid-air', () => {
    for (let seed = 0; seed < 12; seed++) {
      const start = dealAll(setupGame(players, whites))
      let tick = seed
      const { state, steps } = playToEnd(start, (alive) => {
        tick = (tick * 31 + 17) % 9973
        return alive[tick % alive.length]
      })

      expect(steps).toBeLessThan(300)
      expect(state.phase).toBe('GAME_OVER')
      expect(state.game!.winner).toBeDefined()
      // The declared winner must agree with the board, unless a caught
      // Mr. White stole it by guessing the word.
      if (state.guessOutcome !== 'CORRECT') {
        expect(state.game!.winner).toBe(checkWinCondition(state.game!))
      }
    }
  })

  it('holds its invariants at every step of a full game', () => {
    let s: AppState = drive(dealAll(setupGame(players, whites)), { type: 'START_ROUND' })
    let guard = 0

    const check = (state: AppState) => {
      const g = state.game!
      // The split never changes once dealt.
      expect(mrWhites(g)).toHaveLength(whites)
      expect(civilians(g)).toHaveLength(players - whites)
      // One card per player, no card shared.
      expect(new Set(g.players.map((p) => p.cardId)).size).toBe(players)
      // Nobody votes twice in a round.
      const round = g.votes.filter((v) => v.round === g.currentRound)
      expect(new Set(round.map((v) => v.voterId)).size).toBe(round.length)
      // Nobody ever votes for themselves.
      expect(round.some((v) => v.voterId === v.targetId)).toBe(false)
      // While a ballot is open, nobody eliminated may vote or be voted for.
      // (Once it resolves, that round's history rightly still names the person
      // it removed — they were in the game when the votes were cast.)
      if (state.phase === 'VOTING') {
        const dead = new Set(g.players.filter((p) => p.eliminated).map((p) => p.id))
        expect(round.some((v) => dead.has(v.voterId) || dead.has(v.targetId))).toBe(false)
        expect(voters(g).some((p) => p.eliminated)).toBe(false)
      }
      // Clue order only ever contains the living.
      if (state.phase === 'ROUND') {
        expect(turnOrder(g, g.currentPlayerIndex).every((p) => !p.eliminated)).toBe(true)
      }
    }

    while (s.phase !== 'GAME_OVER' && guard++ < 60) {
      check(s)
      const alive = activePlayers(s.game!)
      if (alive.length < 2) break

      const target = alive.find((p) => p.role === 'CIVILIAN') ?? alive[0]
      s = drive(s, { type: 'START_VOTING' })
      for (let i = 0; i < voters(s.game!).length; i++) {
        const voter = voters(s.game!)[s.votingIndex]
        const options = eligibleTargets(s.game!, voter.id)
        s = drive(s, {
          type: 'SUBMIT_VOTE',
          targetId: (options.find((p) => p.id === target.id) ?? options[0]).id,
        })
        check(s)
      }
      s = drive(s, { type: 'RESOLVE_VOTE' })
      if (s.phase === 'ELIMINATION') s = drive(s, { type: 'CONTINUE_AFTER_ELIMINATION' })
      if (s.phase === 'MR_WHITE_GUESS') {
        s = drive(s, { type: 'SUBMIT_GUESS', guess: 'wrong' }, { type: 'CONTINUE_AFTER_GUESS' })
      }
    }

    expect(s.phase).toBe('GAME_OVER')
    check(s)
  })

  it('replays with the same table and a fresh board', () => {
    const start = dealAll(setupGame(players, whites))
    const { state } = playToEnd(start, (alive) => alive.find((p) => p.role === 'MR_WHITE')!)
    const roster = state.game!.players.map((p) => p.name)

    const again = drive(state, { type: 'PLAY_AGAIN' })
    expect(again.phase).toBe('PASS_PHONE')
    expect(again.game!.players.map((p) => p.name)).toEqual(roster)
    expect(again.game!.players).toHaveLength(players)
    expect(again.game!.players.every((p) => p.role === null)).toBe(true)
    expect(again.game!.votes).toHaveLength(0)
    expect(again.game!.currentRound).toBe(0)

    const redealt = dealAll(again)
    expect(mrWhites(redealt.game!)).toHaveLength(whites)
  })
})

describe('the matrix as a whole', () => {
  it('covers every required configuration', () => {
    expect(CONFIGS.map((c) => `${c.players}/${c.whites}`)).toEqual([
      '3/1',
      '5/1',
      '6/2',
      '8/2',
      '10/3',
      '12/3',
      '15/4',
    ])
  })

  it('has no configuration that starts already lost', () => {
    for (const { players, whites } of CONFIGS) {
      const dealt = dealAll(setupGame(players, whites))
      expect(checkWinCondition(dealt.game!)).toBeNull()
    }
  })
})
