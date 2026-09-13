import { WORD_CATEGORIES } from '@/data/words'
import { pickOne, type Rng } from './rng'

export type SecretWord = { category: string; word: string }

/** One category, one word, per game. Every Civilian sees the same word. */
export function pickSecretWord(rng?: Rng): SecretWord {
  const category = pickOne(WORD_CATEGORIES, rng)
  return { category: category.name, word: pickOne(category.words, rng) }
}

/**
 * Guess matching for Mr. White. Exact match after normalisation — no fuzzy or
 * AI matching in V1, per spec. "  PIZZA " and "pizza" are the same answer.
 */
export function normaliseGuess(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function guessMatches(guess: string, secretWord: string): boolean {
  return normaliseGuess(guess) === normaliseGuess(secretWord)
}
