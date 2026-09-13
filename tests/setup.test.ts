import { describe, expect, it } from 'vitest'

import {
  clampMrWhiteCount,
  clampPlayerCount,
  isValidConfig,
  maxMrWhites,
  namesAreValid,
  normaliseName,
  PLAYER_MAX,
  PLAYER_MIN,
  resizeNames,
  validateNames,
} from '@/game/setupRules'
import { initialState, reducer } from '@/game/store'
import { drive, names } from './helpers'

describe('invalid player counts', () => {
  it('rejects a table too small to play', () => {
    expect(isValidConfig(0, 1)).toBe(false)
    expect(isValidConfig(1, 1)).toBe(false)
    expect(isValidConfig(2, 1)).toBe(false)
  })

  it('rejects a table above the maximum', () => {
    expect(isValidConfig(PLAYER_MAX + 1, 1)).toBe(false)
    expect(isValidConfig(100, 1)).toBe(false)
  })

  it('rejects non-integers', () => {
    expect(isValidConfig(6.5, 1)).toBe(false)
    expect(isValidConfig(Number.NaN, 1)).toBe(false)
  })

  it('clamps to the legal range', () => {
    expect(clampPlayerCount(-5)).toBe(PLAYER_MIN)
    expect(clampPlayerCount(0)).toBe(PLAYER_MIN)
    expect(clampPlayerCount(999)).toBe(PLAYER_MAX)
  })

  it('cannot be stepped outside the range through the UI', () => {
    let s = drive(initialState, { type: 'START_SETUP' })
    for (let i = 0; i < 50; i++) s = reducer(s, { type: 'STEP_PLAYER_COUNT', delta: 1 })
    expect(s.setup.playerCount).toBe(PLAYER_MAX)
    for (let i = 0; i < 50; i++) s = reducer(s, { type: 'STEP_PLAYER_COUNT', delta: -1 })
    expect(s.setup.playerCount).toBe(PLAYER_MIN)
  })
})

describe('invalid Mr White counts', () => {
  it('requires at least one', () => {
    expect(isValidConfig(10, 0)).toBe(false)
    expect(isValidConfig(10, -1)).toBe(false)
  })

  it('rejects Mr Whites matching or outnumbering Civilians', () => {
    // These would hand Mr. White the win before a single clue was given.
    expect(isValidConfig(6, 3)).toBe(false)
    expect(isValidConfig(5, 5)).toBe(false)
    expect(isValidConfig(10, 5)).toBe(false)
    expect(isValidConfig(4, 2)).toBe(false)
  })

  it('caps so Mr Whites always start outnumbered', () => {
    for (let n = PLAYER_MIN; n <= PLAYER_MAX; n++) {
      const cap = maxMrWhites(n)
      expect(isValidConfig(n, cap)).toBe(true)
      expect(cap).toBeLessThan(n - cap)
      expect(isValidConfig(n, cap + 1)).toBe(false)
    }
  })

  it('re-clamps when the table shrinks under it', () => {
    let s = drive(initialState, { type: 'START_SETUP' })
    s = reducer(s, { type: 'STEP_PLAYER_COUNT', delta: 12 }) // 20 players
    for (let i = 0; i < 20; i++) s = reducer(s, { type: 'STEP_MR_WHITE_COUNT', delta: 1 })
    expect(s.setup.mrWhiteCount).toBe(maxMrWhites(20))

    s = reducer(s, { type: 'STEP_PLAYER_COUNT', delta: -17 }) // back to 3
    expect(s.setup.playerCount).toBe(3)
    expect(s.setup.mrWhiteCount).toBe(1)
    expect(isValidConfig(s.setup.playerCount, s.setup.mrWhiteCount)).toBe(true)
  })

  it('clamps direct values too', () => {
    expect(clampMrWhiteCount(4, 99)).toBe(1)
    expect(clampMrWhiteCount(10, 0)).toBe(1)
  })
})

describe('empty names', () => {
  it('flags a blank field', () => {
    expect(validateNames(['Shan', '', 'Jay'])).toEqual([null, 'EMPTY', null])
  })

  it('flags whitespace-only as empty', () => {
    expect(validateNames(['Shan', '   ', '\t'])).toEqual([null, 'EMPTY', 'EMPTY'])
  })

  it('blocks game generation', () => {
    let s = drive(initialState, { type: 'START_SETUP' }, { type: 'NEXT' }, { type: 'NEXT' })
    s = reducer(s, { type: 'GENERATE_GAME' })
    expect(s.phase).toBe('PLAYER_NAMES')
    expect(s.game).toBeNull()
  })
})

describe('duplicate names', () => {
  it('flags both sides of the duplicate', () => {
    expect(validateNames(['Jay', 'Jay', 'Shan'])).toEqual(['DUPLICATE', 'DUPLICATE', null])
  })

  it('matches case-insensitively', () => {
    expect(validateNames(['Jay', 'jay'])).toEqual(['DUPLICATE', 'DUPLICATE'])
    expect(validateNames(['JAY', 'jAy'])).toEqual(['DUPLICATE', 'DUPLICATE'])
  })

  it('matches after trimming and collapsing whitespace', () => {
    expect(validateNames(['Jay', '  Jay  '])).toEqual(['DUPLICATE', 'DUPLICATE'])
    expect(validateNames(['Ravi Kumar', 'Ravi   Kumar'])).toEqual(['DUPLICATE', 'DUPLICATE'])
  })

  it('normalises inner whitespace', () => {
    expect(normaliseName('  Ravi   Kumar ')).toBe('Ravi Kumar')
  })

  it('blocks game generation', () => {
    let s = drive(initialState, { type: 'START_SETUP' }, { type: 'NEXT' }, { type: 'NEXT' })
    names(8).forEach((value, index) => {
      s = reducer(s, { type: 'SET_NAME', index, value })
    })
    s = reducer(s, { type: 'SET_NAME', index: 3, value: 'player1' })
    s = reducer(s, { type: 'GENERATE_GAME' })
    expect(s.phase).toBe('PLAYER_NAMES')
    expect(s.game).toBeNull()
  })

  it('accepts a clean roster', () => {
    expect(namesAreValid(names(15))).toBe(true)
  })
})

describe('name list resizing', () => {
  it('keeps what was typed when the table grows', () => {
    expect(resizeNames(['Shan', 'Jay'], 4)).toEqual(['Shan', 'Jay', '', ''])
  })

  it('truncates when the table shrinks', () => {
    expect(resizeNames(['A', 'B', 'C'], 2)).toEqual(['A', 'B'])
  })

  it('caps a name at the layout limit however it arrives', () => {
    const s = reducer(initialState, { type: 'SET_NAME', index: 0, value: 'x'.repeat(500) })
    expect(s.setup.names[0].length).toBe(20)
  })
})
