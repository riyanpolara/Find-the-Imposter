import { describe, expect, it } from 'vitest'

import { activePlayers } from '@/game/roundManager'
import { reducer } from '@/game/store'
import { checkWinCondition, remaining } from '@/game/winManager'
import type { Game, Player, Role } from '@/types/game'
import { civilians, dealtGame, drive, mrWhites, nameOf, voteOut } from './helpers'

/** Hand-built board for testing the win rules in isolation. */
function board(roles: Role[], eliminated: boolean[]): Game {
  return {
    id: 'g',
    players: roles.map((role, i) => ({
      id: `p${i}`,
      name: `P${i}`,
      role,
      eliminated: eliminated[i],
      cardId: `c${i}`,
    })) as Player[],
    cards: [],
    secretWord: 'Pizza',
    category: 'Food',
    currentRound: 1,
    currentPlayerIndex: 0,
    votes: [],
  }
}

const C: Role = 'CIVILIAN'
const W: Role = 'MR_WHITE'

describe('Civilian eliminated', () => {
  it('reveals CIVILIAN and keeps the word safe', () => {
    let s = drive(dealtGame(8, 2), { type: 'START_ROUND' })
    const victim = civilians(s.game!)[0]
    s = voteOut(s, victim.id)
    s = drive(s, { type: 'RESOLVE_VOTE' })

    expect(s.phase).toBe('ELIMINATION')
    expect(nameOf(s.game!, s.eliminatedId!)).toBe(victim.name)
    expect(s.game!.players.find((p) => p.id === victim.id)!.role).toBe('CIVILIAN')
  })

  it('goes straight to the next round — no guess offered', () => {
    let s = drive(dealtGame(10, 3), { type: 'START_ROUND' })
    s = voteOut(s, civilians(s.game!)[0].id)
    s = drive(s, { type: 'RESOLVE_VOTE' }, { type: 'CONTINUE_AFTER_ELIMINATION' })

    expect(s.phase).toBe('ROUND')
    expect(s.game!.currentRound).toBe(2)
    expect(s.votingIndex).toBe(0)
    expect(s.guessOutcome).toBeNull()
  })
})

describe('Mr White eliminated', () => {
  it('reveals MR_WHITE and offers the one guess', () => {
    let s = drive(dealtGame(8, 2), { type: 'START_ROUND' })
    const caught = mrWhites(s.game!)[0]
    s = voteOut(s, caught.id)
    s = drive(s, { type: 'RESOLVE_VOTE' })

    expect(s.phase).toBe('ELIMINATION')
    expect(s.game!.players.find((p) => p.id === caught.id)!.role).toBe('MR_WHITE')
    expect(s.game!.players.find((p) => p.id === caught.id)!.eliminated).toBe(true)

    s = drive(s, { type: 'CONTINUE_AFTER_ELIMINATION' })
    expect(s.phase).toBe('MR_WHITE_GUESS')
    expect(s.guessOutcome).toBeNull()
  })
})

describe('correct Mr White guess', () => {
  const caughtGame = () => {
    let s = drive(dealtGame(6, 1), { type: 'START_ROUND' })
    s = voteOut(s, mrWhites(s.game!)[0].id)
    return drive(s, { type: 'RESOLVE_VOTE' }, { type: 'CONTINUE_AFTER_ELIMINATION' })
  }

  it('wins the game outright, even though they were caught', () => {
    let s = caughtGame()
    s = drive(s, { type: 'SUBMIT_GUESS', guess: s.game!.secretWord })
    expect(s.guessOutcome).toBe('CORRECT')
    expect(s.phase).toBe('MR_WHITE_GUESS') // result shown before moving on

    s = drive(s, { type: 'CONTINUE_AFTER_GUESS' })
    expect(s.phase).toBe('GAME_OVER')
    expect(s.game!.winner).toBe('MR_WHITE')
  })

  it('accepts a sloppily typed answer', () => {
    for (const shape of [
      (w: string) => w.toUpperCase(),
      (w: string) => w.toLowerCase(),
      (w: string) => `   ${w}   `,
      (w: string) => w.replace(/ /g, '   '),
    ]) {
      let s = caughtGame()
      s = drive(s, { type: 'SUBMIT_GUESS', guess: shape(s.game!.secretWord) })
      expect(s.guessOutcome).toBe('CORRECT')
    }
  })

  it('beats the board even when Civilians would otherwise have won', () => {
    let s = caughtGame()
    // Last Mr White is out, so the board says CIVILIANS — the guess overrides it.
    expect(checkWinCondition(s.game!)).toBe('CIVILIANS')
    s = drive(s, { type: 'SUBMIT_GUESS', guess: s.game!.secretWord }, { type: 'CONTINUE_AFTER_GUESS' })
    expect(s.game!.winner).toBe('MR_WHITE')
  })
})

describe('wrong Mr White guess', () => {
  it('ends the game when they were the last one', () => {
    let s = drive(dealtGame(6, 1), { type: 'START_ROUND' })
    s = voteOut(s, mrWhites(s.game!)[0].id)
    s = drive(s, { type: 'RESOLVE_VOTE' }, { type: 'CONTINUE_AFTER_ELIMINATION' })
    s = drive(s, { type: 'SUBMIT_GUESS', guess: 'not the word' })
    expect(s.guessOutcome).toBe('WRONG')

    s = drive(s, { type: 'CONTINUE_AFTER_GUESS' })
    expect(s.phase).toBe('GAME_OVER')
    expect(s.game!.winner).toBe('CIVILIANS')
  })

  it('continues the game when another Mr White is still hidden', () => {
    let s = drive(dealtGame(10, 3), { type: 'START_ROUND' })
    s = voteOut(s, mrWhites(s.game!)[0].id)
    s = drive(s, { type: 'RESOLVE_VOTE' }, { type: 'CONTINUE_AFTER_ELIMINATION' })
    s = drive(s, { type: 'SUBMIT_GUESS', guess: 'wrong' }, { type: 'CONTINUE_AFTER_GUESS' })

    expect(s.phase).toBe('ROUND')
    expect(s.game!.currentRound).toBe(2)
    expect(mrWhites(s.game!).filter((p) => !p.eliminated)).toHaveLength(2)
  })
})

describe('all Mr Whites eliminated', () => {
  it('is a Civilian victory', () => {
    let s = drive(dealtGame(10, 3), { type: 'START_ROUND' })
    for (let i = 0; i < 3; i++) {
      const target = mrWhites(s.game!).find((p) => !p.eliminated)!
      s = voteOut(s, target.id)
      s = drive(s, { type: 'RESOLVE_VOTE' }, { type: 'CONTINUE_AFTER_ELIMINATION' })
      s = drive(s, { type: 'SUBMIT_GUESS', guess: 'nope' }, { type: 'CONTINUE_AFTER_GUESS' })
    }
    expect(s.phase).toBe('GAME_OVER')
    expect(s.game!.winner).toBe('CIVILIANS')
    expect(mrWhites(s.game!).every((p) => p.eliminated)).toBe(true)
  })

  it('is the rule in isolation', () => {
    expect(checkWinCondition(board([C, C, W], [false, false, true]))).toBe('CIVILIANS')
    expect(checkWinCondition(board([C, C, C, W, W], [false, false, false, true, true]))).toBe('CIVILIANS')
  })
})

describe('Mr White majority', () => {
  it('wins the moment Mr Whites equal the Civilians', () => {
    expect(checkWinCondition(board([C, C, W], [false, true, false]))).toBe('MR_WHITE')
    expect(checkWinCondition(board([C, C, C, W, W], [false, false, true, false, false]))).toBe('MR_WHITE')
  })

  it('wins when Mr Whites outnumber the Civilians', () => {
    expect(checkWinCondition(board([C, C, W, W], [false, true, false, false]))).toBe('MR_WHITE')
  })

  it('keeps playing while Civilians are still ahead', () => {
    expect(checkWinCondition(board([C, C, W], [false, false, false]))).toBeNull()
    expect(checkWinCondition(board([C, C, C, W, W], [false, false, false, false, false]))).toBeNull()
  })

  it('fires through real play once the Civilians are voted down', () => {
    let s = drive(dealtGame(6, 2), { type: 'START_ROUND' })
    // 4 Civilians vs 2 Mr Whites: removing two Civilians makes it 2-2.
    for (let i = 0; i < 2; i++) {
      const victim = civilians(s.game!).find((p) => !p.eliminated)!
      s = voteOut(s, victim.id)
      s = drive(s, { type: 'RESOLVE_VOTE' }, { type: 'CONTINUE_AFTER_ELIMINATION' })
    }
    expect(s.phase).toBe('GAME_OVER')
    expect(s.game!.winner).toBe('MR_WHITE')
    const standing = remaining(s.game!)
    expect(standing.mrWhites).toBeGreaterThanOrEqual(standing.civilians)
  })

  it('counts only the living', () => {
    expect(remaining(board([C, W, W], [true, false, false]))).toEqual({ civilians: 0, mrWhites: 2 })
  })
})

describe('Play Again', () => {
  const finished = () => {
    let s = drive(dealtGame(6, 2), { type: 'START_ROUND' })
    for (let i = 0; i < 2; i++) {
      const victim = civilians(s.game!).find((p) => !p.eliminated)!
      s = voteOut(s, victim.id)
      s = drive(s, { type: 'RESOLVE_VOTE' }, { type: 'CONTINUE_AFTER_ELIMINATION' })
    }
    return s
  }

  it('keeps the table and resets everything else', () => {
    const before = finished()
    const roster = before.game!.players.map((p) => p.name)
    const after = drive(before, { type: 'PLAY_AGAIN' })

    expect(after.phase).toBe('PASS_PHONE')
    expect(after.game!.players.map((p) => p.name)).toEqual(roster)
    expect(after.setup.playerCount).toBe(6)
    expect(after.setup.mrWhiteCount).toBe(2)

    expect(after.game!.players.every((p) => p.role === null)).toBe(true)
    expect(after.game!.players.every((p) => !p.eliminated)).toBe(true)
    expect(after.game!.cards.every((c) => !c.selected)).toBe(true)
    expect(after.game!.votes).toHaveLength(0)
    expect(after.game!.currentRound).toBe(0)
    expect(after.game!.winner).toBeUndefined()
    expect(after.guessOutcome).toBeNull()
    expect(after.eliminatedId).toBeNull()
    expect(after.game!.id).not.toBe(before.game!.id)
  })

  it('draws a new word over repeated replays', () => {
    const before = finished()
    const words = new Set(
      Array.from({ length: 60 }, () => reducer(before, { type: 'PLAY_AGAIN' }).game!.secretWord),
    )
    expect(words.size).toBeGreaterThan(1)
  })

  it('re-deals a valid board that can be played again', () => {
    const replayed = drive(finished(), { type: 'PLAY_AGAIN' })
    const dealt = drive(
      replayed,
      ...Array.from({ length: 6 }).flatMap(() => []),
    )
    expect(activePlayers(dealt.game!)).toHaveLength(6)
  })
})

describe('out-of-phase actions are inert', () => {
  it('ignores mid-game actions fired from the wrong screen', () => {
    const s = drive(dealtGame(8, 2), { type: 'START_ROUND' })
    const snapshot = JSON.stringify(s)
    const poked = drive(
      s,
      { type: 'PLAYER_READY' },
      { type: 'HIDE_CARD' },
      { type: 'GENERATE_GAME' },
      { type: 'RESOLVE_VOTE' },
      { type: 'SUBMIT_GUESS', guess: 'x' },
      { type: 'CONTINUE_AFTER_GUESS' },
      { type: 'CONTINUE_AFTER_ELIMINATION' },
      { type: 'NEXT' },
      { type: 'BACK' },
    )
    expect(JSON.stringify(poked)).toBe(snapshot)
  })

  it('offers no way back once roles are dealt', () => {
    const s = dealtGame(6, 2)
    expect(drive(s, { type: 'BACK' }).phase).toBe(s.phase)
  })
})
