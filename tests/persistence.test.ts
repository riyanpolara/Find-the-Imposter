import { beforeEach, describe, expect, it } from 'vitest'

import { clearState, loadState, saveState, STORAGE_KEY } from '@/game/persistence'
import type { AppState } from '@/game/store'
import { civilians, dealtGame, drive, setupGame, voteOut } from './helpers'

/** Minimal in-memory localStorage; swapped per test to simulate failures. */
function useMemoryStorage() {
  const store = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
      key: () => null,
      length: 0,
    },
  })
  return store
}

function useBrokenStorage() {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => {
        throw new Error('storage blocked')
      },
      setItem: () => {
        throw new Error('storage blocked')
      },
      removeItem: () => {
        throw new Error('storage blocked')
      },
    },
  })
}

let store: Map<string, string>
beforeEach(() => {
  store = useMemoryStorage()
})

describe('refreshing during card distribution', () => {
  it('rewinds a half-revealed card to the handoff gate', () => {
    // Mid-reveal the card is already dealt. Restoring straight back onto
    // CARD_REVEAL would put someone's role on screen for whoever picks the
    // phone up, so it must land on the "pass to X" gate instead.
    const s = drive(setupGame(8, 2), { type: 'PLAYER_READY' })
    const revealing = drive(s, { type: 'SELECT_CARD', cardId: s.game!.cards[0].id })
    expect(revealing.phase).toBe('CARD_REVEAL')

    saveState(revealing)
    expect(loadState()!.phase).toBe('PASS_PHONE')
  })

  it('rewinds the card grid to the handoff gate too', () => {
    const picking = drive(setupGame(8, 2), { type: 'PLAYER_READY' })
    expect(picking.phase).toBe('CARD_DISTRIBUTION')

    saveState(picking)
    expect(loadState()!.phase).toBe('PASS_PHONE')
  })

  it('keeps the cards already dealt', () => {
    let s = setupGame(6, 2)
    s = drive(
      s,
      { type: 'PLAYER_READY' },
      { type: 'SELECT_CARD', cardId: s.game!.cards[0].id },
      { type: 'HIDE_CARD' },
    )
    saveState(s)

    const restored = loadState()!
    expect(restored.game!.players[0].role).not.toBeNull()
    expect(restored.game!.cards.filter((c) => c.selected)).toHaveLength(1)
    expect(restored.game!.currentPlayerIndex).toBe(1)
  })

  it('resumes the handoff itself unchanged', () => {
    const s = dealtGame(6, 2)
    saveState({ ...s, phase: 'PASS_PHONE' })
    expect(loadState()!.phase).toBe('PASS_PHONE')
  })
})

describe('refreshing during voting', () => {
  it('resumes on the same voter with the ballot intact', () => {
    let s = drive(dealtGame(8, 2), { type: 'START_ROUND' }, { type: 'START_VOTING' })
    const voter = s.game!.players[0]
    s = drive(s, { type: 'SUBMIT_VOTE', targetId: s.game!.players[1].id })
    expect(s.votingIndex).toBe(1)

    saveState(s)
    const restored = loadState()!

    expect(restored.phase).toBe('VOTING')
    expect(restored.votingIndex).toBe(1)
    expect(restored.game!.votes).toHaveLength(1)
    expect(restored.game!.votes[0].voterId).toBe(voter.id)
    expect(restored.game!.currentRound).toBe(1)
  })

  it('does not re-open a locked vote', () => {
    let s = drive(dealtGame(6, 2), { type: 'START_ROUND' }, { type: 'START_VOTING' })
    s = drive(s, { type: 'SUBMIT_VOTE', targetId: s.game!.players[1].id })
    saveState(s)
    const restored = loadState()!
    expect(restored.game!.votes.filter((v) => v.voterId === s.game!.players[0].id)).toHaveLength(1)
  })

  it('survives a refresh on the results screen', () => {
    let s = drive(dealtGame(6, 2), { type: 'START_ROUND' })
    s = voteOut(s, civilians(s.game!)[0].id)
    expect(s.phase).toBe('VOTE_RESULTS')

    saveState(s)
    const restored = loadState()!
    expect(restored.phase).toBe('VOTE_RESULTS')
    expect(restored.game!.votes).toHaveLength(6)
  })

  it('survives a refresh mid-guess without leaking the word early', () => {
    const s = dealtGame(8, 2)
    saveState({ ...s, phase: 'MR_WHITE_GUESS', guessOutcome: null })
    const restored = loadState()!
    expect(restored.phase).toBe('MR_WHITE_GUESS')
    expect(restored.guessOutcome).toBeNull()
  })
})

describe('close tab and reopen', () => {
  it('restores a full game round-trip', () => {
    let s = drive(dealtGame(10, 3), { type: 'START_ROUND' })
    s = voteOut(s, civilians(s.game!)[0].id)
    saveState(s)

    const restored = loadState()!
    expect(restored.game!.players).toHaveLength(10)
    expect(restored.game!.secretWord).toBe(s.game!.secretWord)
    expect(restored.game!.category).toBe(s.game!.category)
    expect(restored.game!.votes).toHaveLength(s.game!.votes.length)
    expect(restored.game!.currentRound).toBe(s.game!.currentRound)
    expect(restored.setup).toEqual(s.setup)
  })

  it('always resumes travelling forward', () => {
    const s = dealtGame(6, 2)
    saveState({ ...s, direction: -1 })
    expect(loadState()!.direction).toBe(1)
  })

  it('returns nothing when there is no save', () => {
    expect(loadState()).toBeNull()
  })
})

describe('corrupted storage', () => {
  const good = () => drive(dealtGame(6, 2), { type: 'START_ROUND' })

  it('ignores unparseable JSON and clears it', () => {
    store.set(STORAGE_KEY, 'not json at all {{{')
    expect(loadState()).toBeNull()
    expect(store.get(STORAGE_KEY)).toBeUndefined()
  })

  it('ignores a payload from a different schema version', () => {
    store.set(STORAGE_KEY, JSON.stringify({ version: 999, state: good() }))
    expect(loadState()).toBeNull()
  })

  it('ignores a structurally wrong payload', () => {
    store.set(STORAGE_KEY, JSON.stringify({ version: 1, state: { phase: 'ROUND' } }))
    expect(loadState()).toBeNull()
  })

  it('ignores a half-written game object', () => {
    const s = good()
    store.set(STORAGE_KEY, JSON.stringify({ version: 1, state: { ...s, game: { players: [] } } }))
    expect(loadState()).toBeNull()
  })

  it('ignores a game missing its word', () => {
    const s = good()
    const broken = { ...s, game: { ...s.game!, secretWord: undefined } }
    store.set(STORAGE_KEY, JSON.stringify({ version: 1, state: broken }))
    expect(loadState()).toBeNull()
  })

  it('clears cleanly', () => {
    saveState(good())
    clearState()
    expect(loadState()).toBeNull()
  })
})

describe('unavailable storage', () => {
  it('reads as empty instead of throwing', () => {
    useBrokenStorage()
    expect(() => loadState()).not.toThrow()
    expect(loadState()).toBeNull()
  })

  it('never throws on save — a lost save is not a lost game', () => {
    useBrokenStorage()
    const s: AppState = drive(dealtGame(6, 2), { type: 'START_ROUND' })
    expect(() => saveState(s)).not.toThrow()
    expect(() => clearState()).not.toThrow()
  })
})
