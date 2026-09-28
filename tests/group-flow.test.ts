import { describe, expect, it } from 'vitest'
import { reducer } from '@/game/store'
import { dealtGame, drive, mrWhites, civilians } from './helpers'

function groupVote(state: ReturnType<typeof dealtGame>, targetId: string) {
  return drive(state, { type: 'START_VOTING' }, { type: 'VOTE_ELIMINATE', targetId }, { type: 'CONTINUE_AFTER_ELIMINATION' })
}

describe('one-phone group voting', () => {
  it('continues after a civilian is selected with one group vote', () => {
    const start = drive(dealtGame(6, 2), { type: 'START_ROUND' })
    const next = groupVote(start, civilians(start.game!)[0].id)
    expect(next.phase).toBe('ROUND')
    expect(next.game!.currentRound).toBe(2)
  })

  it('gives each caught Mr. White a fresh, single guess', () => {
    let s = drive(dealtGame(6, 2), { type: 'START_ROUND' })
    const whites = mrWhites(s.game!)
    s = groupVote(s, whites[0].id)
    s = reducer(s, { type: 'SUBMIT_GUESS', guess: 'definitely-wrong' })
    expect(s.guessOutcome).toBe('WRONG')
    expect(reducer(s, { type: 'SUBMIT_GUESS', guess: s.game!.secretWord }).guessOutcome).toBe('WRONG')
    s = reducer(s, { type: 'CONTINUE_AFTER_GUESS' })
    expect(s.phase).toBe('ROUND')
    s = groupVote(s, whites[1].id)
    expect(s.phase).toBe('MR_WHITE_GUESS')
    expect(s.guessOutcome).toBeNull()
    s = drive(s, { type: 'SUBMIT_GUESS', guess: s.game!.secretWord }, { type: 'CONTINUE_AFTER_GUESS' })
    expect(s.phase).toBe('GAME_OVER')
    expect(s.game!.winner).toBe('MR_WHITE')
  })
})
