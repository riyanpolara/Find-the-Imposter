import type { Game, Player, Vote } from '@/types/game'
import { activePlayers } from './roundManager'

export type VoteTally = {
  playerId: string
  name: string
  count: number
}

export type VoteOutcome =
  | { kind: 'ELIMINATED'; playerId: string; tally: VoteTally[] }
  | { kind: 'TIE'; tiedIds: string[]; tally: VoteTally[] }

/** Everyone still in the game votes, including the players under suspicion. */
export function voters(game: Game): Player[] {
  return activePlayers(game)
}

/** You may suspect anyone but yourself. */
export function eligibleTargets(game: Game, voterId: string): Player[] {
  return activePlayers(game).filter((player) => player.id !== voterId)
}

export function votesForRound(votes: readonly Vote[], round: number): Vote[] {
  return votes.filter((vote) => vote.round === round)
}

export function hasVoted(game: Game, voterId: string, round: number): boolean {
  return votesForRound(game.votes, round).some((vote) => vote.voterId === voterId)
}

/**
 * Adds a vote. Rejects self-votes, double-votes and votes from or for
 * eliminated players — the UI prevents all of these, but the engine is the
 * place the rule actually lives.
 */
export function recordVote(game: Game, voterId: string, targetId: string): Game {
  if (voterId === targetId) throw new Error('recordVote: cannot vote for yourself')
  const voter = game.players.find((p) => p.id === voterId)
  const target = game.players.find((p) => p.id === targetId)
  if (!voter || voter.eliminated) throw new Error('recordVote: voter is not in the game')
  if (!target || target.eliminated) throw new Error('recordVote: target is not in the game')
  if (hasVoted(game, voterId, game.currentRound)) {
    throw new Error('recordVote: this player has already voted')
  }

  return {
    ...game,
    votes: [...game.votes, { voterId, targetId, round: game.currentRound }],
  }
}

/** Counts for this round, highest first. Players with no votes are omitted. */
export function tallyVotes(game: Game, round: number): VoteTally[] {
  const counts = new Map<string, number>()
  for (const vote of votesForRound(game.votes, round)) {
    counts.set(vote.targetId, (counts.get(vote.targetId) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([playerId, count]) => ({
      playerId,
      name: game.players.find((p) => p.id === playerId)?.name ?? '',
      count,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

/**
 * Nobody is eliminated on a tie — the group votes again. Deliberately not a
 * coin flip: having the app pick a victim at random would feel arbitrary and
 * take the decision away from the table.
 */
export function resolveVote(game: Game, round: number): VoteOutcome {
  const tally = tallyVotes(game, round)
  if (tally.length === 0) return { kind: 'TIE', tiedIds: [], tally }

  const top = tally[0].count
  const tied = tally.filter((entry) => entry.count === top)

  if (tied.length > 1) {
    return { kind: 'TIE', tiedIds: tied.map((t) => t.playerId), tally }
  }
  return { kind: 'ELIMINATED', playerId: tally[0].playerId, tally }
}

/** Wipes a round's ballots so a tied vote can be run again cleanly. */
export function clearRoundVotes(game: Game, round: number): Game {
  return { ...game, votes: game.votes.filter((vote) => vote.round !== round) }
}
