import type { Card, Role } from '@/types/game'
import { makeId, shuffle, type Rng } from './rng'

/**
 * One face-down card per player, each carrying one role from the shuffled deck.
 * Card order is shuffled a second time so the deck order can't leak through
 * the grid positions.
 */
export function generateCards(roles: readonly Role[], rng?: Rng): Card[] {
  const cards: Card[] = roles.map((role) => ({
    id: makeId('card'),
    role,
    selected: false,
  }))
  return shuffle(cards, rng)
}

export function availableCards(cards: readonly Card[]): Card[] {
  return cards.filter((card) => !card.selected)
}

export function findCard(cards: readonly Card[], cardId: string): Card | undefined {
  return cards.find((card) => card.id === cardId)
}

/** Permanently binds a card to a player. Throws if the card is already taken. */
export function assignCard(
  cards: readonly Card[],
  cardId: string,
  playerId: string,
): Card[] {
  const target = findCard(cards, cardId)
  if (!target) throw new Error(`assignCard: unknown card ${cardId}`)
  if (target.selected) throw new Error(`assignCard: card ${cardId} is already taken`)

  return cards.map((card) =>
    card.id === cardId ? { ...card, selected: true, assignedPlayerId: playerId } : card,
  )
}
