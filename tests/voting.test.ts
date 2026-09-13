import { describe, expect, it } from 'vitest'

import { activePlayers, turnOrder } from '@/game/roundManager'
import { reducer } from '@/game/store'
import {
  eligibleTargets,
  hasVoted,
  recordVote,
  resolveVote,
  tallyVotes,
  voters,
} from '@/game/voteManager'
import { dealtGame, drive, nameOf, voteOut } from './helpers'

describe('round progression', () => {
  it('starts at round 1 with everyone in the clue order', () => {
    const s = drive(dealtGame(10, 3), { type: 'START_ROUND' })
    expect(s.phase).toBe('ROUND')
    expect(s.game!.currentRound).toBe(1)
    expect(turnOrder(s.game!, s.game!.currentPlayerIndex)).toHaveLength(10)
  })

  it('rotates the opening player each round', () => {
    let s = drive(dealtGame(8, 2), { type: 'START_ROUND' })
    const first = turnOrder(s.game!, s.game!.currentPlayerIndex)[0].name

    const victim = activePlayers(s.game!).find((p) => p.role === 'CIVILIAN')!
    s = voteOut(s, victim.id)
    s = drive(s, { type: 'RESOLVE_VOTE' }, { type: 'CONTINUE_AFTER_ELIMINATION' })

    expect(s.game!.currentRound).toBe(2)
    expect(turnOrder(s.game!, s.game!.currentPlayerIndex)[0].name).not.toBe(first)
  })

  it('never opens a round with an eliminated player', () => {
    let s = drive(dealtGame(10, 3), { type: 'START_ROUND' })
    for (let i = 0; i < 3; i++) {
      const victim = activePlayers(s.game!).find((p) => p.role === 'CIVILIAN')!
      s = voteOut(s, victim.id)
      s = drive(s, { type: 'RESOLVE_VOTE' }, { type: 'CONTINUE_AFTER_ELIMINATION' })
      if (s.phase !== 'ROUND') break
      expect(s.game!.players[s.game!.currentPlayerIndex].eliminated).toBe(false)
      expect(turnOrder(s.game!, s.game!.currentPlayerIndex).every((p) => !p.eliminated)).toBe(true)
    }
  })
})

describe('active players', () => {
  it('shrinks the ballot as people go out', () => {
    let s = drive(dealtGame(8, 2), { type: 'START_ROUND' })
    expect(voters(s.game!)).toHaveLength(8)

    const victim = activePlayers(s.game!).find((p) => p.role === 'CIVILIAN')!
    s = voteOut(s, victim.id)
    s = drive(s, { type: 'RESOLVE_VOTE' }, { type: 'CONTINUE_AFTER_ELIMINATION' })
    expect(voters(s.game!)).toHaveLength(7)
    expect(activePlayers(s.game!).some((p) => p.id === victim.id)).toBe(false)
  })
})

describe('preventing self-voting', () => {
  it('leaves the voter out of their own options', () => {
    const s = drive(dealtGame(10, 3), { type: 'START_ROUND' }, { type: 'START_VOTING' })
    for (const voter of voters(s.game!)) {
      const options = eligibleTargets(s.game!, voter.id)
      expect(options).toHaveLength(9)
      expect(options.some((p) => p.id === voter.id)).toBe(false)
    }
  })

  it('is rejected by the engine even if the UI is bypassed', () => {
    const s = drive(dealtGame(6, 2), { type: 'START_ROUND' }, { type: 'START_VOTING' })
    const voter = voters(s.game!)[0]
    expect(() => recordVote(s.game!, voter.id, voter.id)).toThrow()
  })

  it('never offers an eliminated player as a target', () => {
    let s = drive(dealtGame(8, 2), { type: 'START_ROUND' })
    const victim = activePlayers(s.game!).find((p) => p.role === 'CIVILIAN')!
    s = voteOut(s, victim.id)
    s = drive(s, { type: 'RESOLVE_VOTE' }, { type: 'CONTINUE_AFTER_ELIMINATION' })
    s = drive(s, { type: 'START_VOTING' })

    for (const voter of voters(s.game!)) {
      expect(eligibleTargets(s.game!, voter.id).some((p) => p.id === victim.id)).toBe(false)
    }
  })
})

describe('vote locking', () => {
  it('advances to the next voter once confirmed', () => {
    let s = drive(dealtGame(6, 2), { type: 'START_ROUND' }, { type: 'START_VOTING' })
    expect(s.votingIndex).toBe(0)
    const voter = voters(s.game!)[0]
    s = drive(s, { type: 'SUBMIT_VOTE', targetId: eligibleTargets(s.game!, voter.id)[0].id })
    expect(s.votingIndex).toBe(1)
    expect(hasVoted(s.game!, voter.id, 1)).toBe(true)
  })

  it('cannot be changed afterwards', () => {
    const s = drive(dealtGame(6, 2), { type: 'START_ROUND' }, { type: 'START_VOTING' })
    const voter = voters(s.game!)[0]
    const options = eligibleTargets(s.game!, voter.id)
    const once = recordVote(s.game!, voter.id, options[0].id)
    expect(() => recordVote(once, voter.id, options[1].id)).toThrow()
  })

  it('records exactly one vote per active player', () => {
    let s = drive(dealtGame(10, 3), { type: 'START_ROUND' })
    s = voteOut(s, voters(s.game!)[1].id)
    expect(s.game!.votes.filter((v) => v.round === 1)).toHaveLength(10)
    expect(new Set(s.game!.votes.map((v) => v.voterId)).size).toBe(10)
  })
})

describe('vote secrecy', () => {
  it('withholds the result until the final ballot is in', () => {
    let s = drive(dealtGame(6, 2), { type: 'START_ROUND' }, { type: 'START_VOTING' })
    for (let i = 0; i < 5; i++) {
      const voter = voters(s.game!)[s.votingIndex]
      s = drive(s, { type: 'SUBMIT_VOTE', targetId: eligibleTargets(s.game!, voter.id)[0].id })
      expect(s.phase).toBe('VOTING')
    }
    const last = voters(s.game!)[s.votingIndex]
    s = drive(s, { type: 'SUBMIT_VOTE', targetId: eligibleTargets(s.game!, last.id)[0].id })
    expect(s.phase).toBe('VOTE_RESULTS')
  })

  it('cannot resolve early', () => {
    let s = drive(dealtGame(6, 2), { type: 'START_ROUND' }, { type: 'START_VOTING' })
    const voter = voters(s.game!)[0]
    s = drive(s, { type: 'SUBMIT_VOTE', targetId: eligibleTargets(s.game!, voter.id)[0].id })
    const before = JSON.stringify(s)
    s = reducer(s, { type: 'RESOLVE_VOTE' })
    expect(JSON.stringify(s)).toBe(before)
  })
})

describe('vote results', () => {
  it('counts and orders correctly', () => {
    let s = drive(dealtGame(8, 2), { type: 'START_ROUND' })
    const target = voters(s.game!)[3]
    s = voteOut(s, target.id)

    const tally = tallyVotes(s.game!, 1)
    expect(tally.reduce((n, t) => n + t.count, 0)).toBe(8)
    expect(tally[0].count).toBeGreaterThanOrEqual(tally[1]?.count ?? 0)
    // The target can't vote for themselves, so they collect the other seven.
    expect(tally[0].playerId).toBe(target.id)
    expect(tally[0].count).toBe(7)
  })

  it('eliminates on a clear majority', () => {
    let s = drive(dealtGame(8, 2), { type: 'START_ROUND' })
    const target = voters(s.game!)[2]
    s = voteOut(s, target.id)

    const outcome = resolveVote(s.game!, 1)
    expect(outcome.kind).toBe('ELIMINATED')

    s = drive(s, { type: 'RESOLVE_VOTE' })
    expect(s.phase).toBe('ELIMINATION')
    expect(nameOf(s.game!, s.eliminatedId!)).toBe(target.name)
    expect(s.game!.players.find((p) => p.id === target.id)!.eliminated).toBe(true)
  })
})

describe('tie vote', () => {
  /** Four players deadlocked two-all on seats 0 and 2. */
  const deadlock = () => {
    let s = drive(dealtGame(4, 1), { type: 'START_ROUND' }, { type: 'START_VOTING' })
    const p = s.game!.players
    for (const [voter, target] of [[0, 2], [1, 2], [2, 0], [3, 0]]) {
      expect(voters(s.game!)[s.votingIndex].id).toBe(p[voter].id)
      s = drive(s, { type: 'SUBMIT_VOTE', targetId: p[target].id })
    }
    return s
  }

  it('is detected rather than broken by a coin flip', () => {
    const s = deadlock()
    const outcome = resolveVote(s.game!, 1)
    expect(outcome.kind).toBe('TIE')
    expect(outcome.kind === 'TIE' && outcome.tiedIds).toHaveLength(2)
  })

  it('eliminates nobody and re-runs the same round', () => {
    let s = deadlock()
    s = drive(s, { type: 'RESOLVE_VOTE' })

    expect(s.phase).toBe('VOTING')
    expect(activePlayers(s.game!)).toHaveLength(4)
    expect(s.game!.players.some((p) => p.eliminated)).toBe(false)
    expect(s.game!.currentRound).toBe(1)
    expect(s.votingIndex).toBe(0)
    expect(s.game!.votes.filter((v) => v.round === 1)).toHaveLength(0)
  })

  it('resolves cleanly on the re-vote', () => {
    let s = drive(deadlock(), { type: 'RESOLVE_VOTE' })
    s = voteOut({ ...s, phase: 'ROUND' }, s.game!.players[1].id)
    expect(s.phase).toBe('VOTE_RESULTS')
    expect(resolveVote(s.game!, 1).kind).toBe('ELIMINATED')
  })

  it('handles a four-way tie', () => {
    let s = drive(dealtGame(4, 1), { type: 'START_ROUND' }, { type: 'START_VOTING' })
    const p = s.game!.players
    for (const [voter, target] of [[0, 1], [1, 0], [2, 3], [3, 2]]) {
      expect(voters(s.game!)[s.votingIndex].id).toBe(p[voter].id)
      s = drive(s, { type: 'SUBMIT_VOTE', targetId: p[target].id })
    }
    const outcome = resolveVote(s.game!, 1)
    expect(outcome.kind).toBe('TIE')
    expect(outcome.kind === 'TIE' && outcome.tiedIds).toHaveLength(4)
  })
})
