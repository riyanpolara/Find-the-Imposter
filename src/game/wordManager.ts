import { WORD_BANK, wordsFor, type WordOptions } from '@/data/words'
import { pickOne, type Rng } from './rng'

export type SecretWord = { category: string; word: string }

/** One category, one word, per game. Every Civilian sees the same word. */
export function pickSecretWord(rng?: Rng, options: Partial<WordOptions> = {}): SecretWord {
  const entry = pickOne(wordsFor(options), rng)
  return { category: entry.category, word: entry.word }
}

/**
 * Exact matching plus curated equivalent names. No fuzzy/substring guesses.
 */
export function normaliseGuess(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[-‐‑]/g, ' ').replace(/\s+/g, ' ')
}

export function guessMatches(guess: string, secretWord: string): boolean {
  const answer = normaliseGuess(guess)
  const secret = normaliseGuess(secretWord)
  if (answer === secret) return true
  const entry = WORD_BANK.find((item) => normaliseGuess(item.word) === secret)
  return entry?.aliases.some((alias) => normaliseGuess(alias) === answer) ?? false
}
