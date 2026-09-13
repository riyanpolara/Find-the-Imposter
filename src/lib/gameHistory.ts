import type { Game } from '@/types/game'
import { getSupabase } from './supabase'

/**
 * Logs a finished game to Supabase.
 *
 * Three rules this must never break:
 *   1. It is entirely optional. No Supabase config, no network, offline — the
 *      game plays identically and this returns quietly.
 *   2. It never throws into the UI. A failed log is not a failed game.
 *   3. It only ever runs on GAME_OVER. Sending anything mid-game could put the
 *      secret word on the wire while people are still guessing it.
 */

export type RecordResult = 'skipped' | 'recorded' | 'failed'

/**
 * In-flight and completed sends, keyed by game id.
 *
 * React StrictMode invokes effects twice in development. A plain "already
 * handled" flag would make the second call return early with no result, and
 * since the first call's effect has been cleaned up by then, nothing would be
 * left to record the success. Sharing the *promise* means both callers await
 * the same single request and both see the real outcome.
 *
 * Dropped on failure so a genuine retry is still possible.
 */
const inFlight = new Map<string, Promise<RecordResult>>()

export type GameStats = {
  games_played: number
  civilian_wins: number
  mr_white_wins: number
  avg_rounds: number | null
}

export type WordStat = {
  secret_word: string
  category: string
  times_played: number
  times_solved: number
}

export function recordFinishedGame(
  game: Game,
  options: { guessedCorrectly: boolean },
): Promise<RecordResult> {
  const existing = inFlight.get(game.id)
  if (existing) return existing

  const pending = sendGame(game, options)
  inFlight.set(game.id, pending)

  void pending.then((result) => {
    if (result === 'failed') inFlight.delete(game.id)
  })

  return pending
}

async function sendGame(
  game: Game,
  options: { guessedCorrectly: boolean },
): Promise<RecordResult> {
  const supabase = await getSupabase()
  if (!supabase || !game.winner) return 'skipped'

  // Client-generated so a retry or a refresh on the game-over screen can't
  // create a second row for the same game.
  const id = crypto.randomUUID()
  const mrWhiteCount = game.players.filter((p) => p.role === 'MR_WHITE').length

  try {
    const { error: gameError } = await supabase.from('games').insert({
      id,
      player_count: game.players.length,
      mr_white_count: mrWhiteCount,
      category: game.category,
      secret_word: game.secretWord,
      winner: game.winner,
      rounds_played: game.currentRound,
      mr_white_guessed_correctly: options.guessedCorrectly,
    })
    if (gameError) return 'failed'

    const { error: playerError } = await supabase.from('game_players').insert(
      game.players.map((player, seat) => ({
        game_id: id,
        seat,
        name: player.name,
        role: player.role,
        eliminated: player.eliminated,
      })),
    )
    // The game row is already saved; a missing roster is a partial win, not a
    // reason to tell the caller everything failed.
    return playerError ? 'failed' : 'recorded'
  } catch {
    return 'failed'
  }
}

/** Overall aggregates. Null when Supabase isn't configured or is unreachable. */
export async function fetchGameStats(): Promise<GameStats | null> {
  const supabase = await getSupabase()
  if (!supabase) return null

  try {
    const { data, error } = await supabase.rpc('game_stats')
    if (error || !data?.length) return null
    return data[0] as GameStats
  } catch {
    return null
  }
}

/** Word difficulty. Groups under 3 games are withheld by the database. */
export async function fetchWordStats(minPlays = 3): Promise<WordStat[]> {
  const supabase = await getSupabase()
  if (!supabase) return []

  try {
    const { data, error } = await supabase.rpc('word_stats', { min_plays: minPlays })
    if (error || !data) return []
    return data as WordStat[]
  } catch {
    return []
  }
}
