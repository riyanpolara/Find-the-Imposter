import { describe, expect, it } from 'vitest'

import { WORD_CATEGORIES } from '@/data/words'
import { assignCard, availableCards, generateCards } from '@/game/cardManager'
import { seededRng, shuffle } from '@/game/rng'
import { countRole, generateRoles } from '@/game/roleManager'
import { reducer } from '@/game/store'
import { guessMatches, normaliseGuess, pickSecretWord } from '@/game/wordManager'
import { dealAll, drive, setupGame } from './helpers'

describe('role generation', () => {
  it('produces exactly the requested split', () => {
    for (const [n, w] of [[3, 1], [5, 1], [6, 2], [8, 2], [10, 3], [12, 3], [15, 4]] as const) {
      const roles = generateRoles(n, w)
      expect(roles).toHaveLength(n)
      expect(countRole(roles, 'MR_WHITE')).toBe(w)
      expect(countRole(roles, 'CIVILIAN')).toBe(n - w)
    }
  })

  it('rejects an unplayable split', () => {
    expect(() => generateRoles(5, 5)).toThrow()
    expect(() => generateRoles(5, 6)).toThrow()
    expect(() => generateRoles(5, 0)).toThrow()
  })

  it('shuffles — position is not predictable', () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateRoles(8, 2).join(',')))
    expect(seen.size).toBeGreaterThan(10)
  })

  it('puts a Mr White in every seat over enough deals', () => {
    const seatsSeen = new Set<number>()
    for (let i = 0; i < 400; i++) {
      generateRoles(6, 2).forEach((role, seat) => {
        if (role === 'MR_WHITE') seatsSeen.add(seat)
      })
    }
    expect(seatsSeen.size).toBe(6)
  })
})

describe('shuffle', () => {
  it('never mutates its input', () => {
    const source = [1, 2, 3, 4, 5]
    shuffle(source, seededRng(42))
    expect(source).toEqual([1, 2, 3, 4, 5])
  })

  it('preserves every element', () => {
    expect([...shuffle([1, 2, 3, 4, 5], seededRng(7))].sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('is deterministic under a seed', () => {
    expect(shuffle([1, 2, 3, 4, 5], seededRng(42))).toEqual(shuffle([1, 2, 3, 4, 5], seededRng(42)))
  })
})

describe('card generation', () => {
  it('deals one card per player, carrying the whole role deck', () => {
    const roles = generateRoles(10, 3)
    const cards = generateCards(roles)
    expect(cards).toHaveLength(10)
    expect(new Set(cards.map((c) => c.id)).size).toBe(10)
    expect(countRole(cards.map((c) => c.role), 'MR_WHITE')).toBe(3)
    expect(availableCards(cards)).toHaveLength(10)
  })
})

describe('card selection', () => {
  it('binds the card to the player and copies its role across', () => {
    let s = setupGame(8, 2)
    const chosen = availableCards(s.game!.cards)[3]
    s = drive(s, { type: 'PLAYER_READY' }, { type: 'SELECT_CARD', cardId: chosen.id })

    const player = s.game!.players[0]
    expect(player.role).toBe(chosen.role)
    expect(player.cardId).toBe(chosen.id)
    expect(s.phase).toBe('CARD_REVEAL')
  })

  it('removes the card from the pool for everyone after', () => {
    let s = setupGame(6, 2)
    const first = availableCards(s.game!.cards)[0]
    s = drive(s, { type: 'PLAYER_READY' }, { type: 'SELECT_CARD', cardId: first.id })
    expect(availableCards(s.game!.cards)).toHaveLength(5)
    expect(availableCards(s.game!.cards).some((c) => c.id === first.id)).toBe(false)
  })

  it('offers a shrinking pool as the phone goes round', () => {
    let s = setupGame(8, 2)
    for (let i = 0; i < 8; i++) {
      expect(availableCards(s.game!.cards)).toHaveLength(8 - i)
      s = drive(
        s,
        { type: 'PLAYER_READY' },
        { type: 'SELECT_CARD', cardId: availableCards(s.game!.cards)[0].id },
        { type: 'HIDE_CARD' },
      )
    }
    expect(availableCards(s.game!.cards)).toHaveLength(0)
    expect(s.phase).toBe('GAME_READY')
  })
})

describe('card already selected', () => {
  it('throws at the engine level', () => {
    const cards = generateCards(generateRoles(6, 2))
    const taken = assignCard(cards, cards[2].id, 'player-a')
    expect(() => assignCard(taken, cards[2].id, 'player-b')).toThrow()
  })

  it('leaves the original untouched', () => {
    const cards = generateCards(generateRoles(6, 2))
    assignCard(cards, cards[2].id, 'player-a')
    expect(cards[2].selected).toBe(false)
    expect(cards[2].assignedPlayerId).toBeUndefined()
  })

  it('is unreachable through the reducer — a second pick is inert', () => {
    let s = setupGame(6, 2)
    s = drive(s, { type: 'PLAYER_READY' })
    const first = availableCards(s.game!.cards)[0]
    const second = availableCards(s.game!.cards)[1]
    s = drive(s, { type: 'SELECT_CARD', cardId: first.id })

    const snapshot = JSON.stringify(s.game)
    s = reducer(s, { type: 'SELECT_CARD', cardId: second.id })
    expect(JSON.stringify(s.game)).toBe(snapshot)
    expect(s.game!.players[0].cardId).toBe(first.id)
  })

  it('never deals the same card twice across a full table', () => {
    const s = dealAll(setupGame(15, 4))
    const dealt = s.game!.players.map((p) => p.cardId)
    expect(new Set(dealt).size).toBe(15)
    expect(new Set(s.game!.cards.map((c) => c.assignedPlayerId)).size).toBe(15)
    expect(s.game!.players.every((p) => p.role !== null)).toBe(true)
  })
})

describe('secret word', () => {
  it('always belongs to its category', () => {
    for (let i = 0; i < 200; i++) {
      const { category, word } = pickSecretWord()
      expect(WORD_CATEGORIES.find((c) => c.name === category)!.words).toContain(word)
    }
  })

  it('varies between games', () => {
    const seen = new Set(Array.from({ length: 300 }, () => pickSecretWord().word))
    expect(seen.size).toBeGreaterThan(20)
  })

  it('has no duplicates inside a category', () => {
    for (const category of WORD_CATEGORIES) {
      const lower = category.words.map((w) => w.toLowerCase())
      expect(new Set(lower).size).toBe(category.words.length)
    }
  })

  it('never lands on a player record', () => {
    const s = dealAll(setupGame(10, 3))
    for (const player of s.game!.players) {
      expect(Object.keys(player).some((k) => /word/i.test(k))).toBe(false)
    }
    expect(typeof s.game!.secretWord).toBe('string')
  })
})

describe('guess normalisation', () => {
  it('ignores case, padding and repeated spaces', () => {
    expect(guessMatches('pizza', 'Pizza')).toBe(true)
    expect(guessMatches('PIZZA', 'Pizza')).toBe(true)
    expect(guessMatches('  Pizza  ', 'Pizza')).toBe(true)
    expect(guessMatches('ice   cream', 'Ice Cream')).toBe(true)
    expect(guessMatches('  HOT air   BALLOON ', 'Hot Air Balloon')).toBe(true)
  })

  it('still rejects a wrong word', () => {
    expect(guessMatches('Burger', 'Pizza')).toBe(false)
    expect(guessMatches('', 'Pizza')).toBe(false)
    expect(guessMatches('Pizzas', 'Pizza')).toBe(false)
  })

  it('normalises predictably', () => {
    expect(normaliseGuess('  HOT  Air Balloon ')).toBe('hot air balloon')
  })
})
