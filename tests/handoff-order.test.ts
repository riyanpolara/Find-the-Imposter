import { describe, expect, it } from 'vitest'

import { availableCards } from '@/game/cardManager'
import { createGame, currentPlayer } from '@/game/gameEngine'
import { seededRng } from '@/game/rng'
import { initialState, type AppState } from '@/game/store'
import { drive, names } from './helpers'

describe('random handoff order', () => {
  it('allows every entered name to start across seeded games', () => {
    const config = { ...initialState.setup, names: names(6) }
    const starters = new Set<string>()
    for (let seed = 0; seed < 100; seed++) {
      starters.add(currentPlayer(createGame(config, seededRng(seed))).name)
    }
    expect([...starters].sort()).toEqual([...config.names].sort())
  })

  it.each([3, 6, 20])('hands off to all %i players exactly once without changing setup names', (count) => {
    const roster = names(count)
    const config = { ...initialState.setup, playerCount: count, mrWhiteCount: 1, names: [...roster] }
    let state: AppState = {
      ...initialState,
      phase: 'PASS_PHONE',
      setup: config,
      game: createGame(config, seededRng(42)),
    }
    const seen: string[] = []

    while (state.phase === 'PASS_PHONE') {
      seen.push(currentPlayer(state.game!).name)
      expect(seen.length).toBeLessThanOrEqual(count)
      state = drive(state,
        { type: 'PLAYER_READY' },
        { type: 'SELECT_CARD', cardId: availableCards(state.game!.cards)[0].id },
        { type: 'HIDE_CARD' },
      )
    }

    expect(state.phase).toBe('GAME_READY')
    expect([...seen].sort()).toEqual([...roster].sort())
    expect(seen).not.toEqual(roster)
    expect(state.setup.names).toEqual(roster)
    expect(state.game!.players.every((player) => player.cardId)).toBe(true)
  })
})
