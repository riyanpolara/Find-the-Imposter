import { m } from 'framer-motion'
import { useEffect, useState } from 'react'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { useGame } from '@/hooks/useGame'
import { fetchGameStats, recordFinishedGame, type GameStats } from '@/lib/gameHistory'
import { riseGroup, riseItem, spring } from '@/utils/motion'

export function GameOver({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const [stats, setStats] = useState<GameStats | null>(null)
  const game = state.game!
  const civiliansWon = game.winner === 'CIVILIANS'
  const mrWhites = game.players.filter((p) => p.role === 'MR_WHITE')

  const alreadyRecorded = state.recordedGameId === game.id
  const guessedCorrectly = state.guessOutcome === 'CORRECT'

  // Log the finished game and pull the global tally. Both are best-effort:
  // if Supabase isn't configured or the phone is offline, nothing here runs
  // and the screen renders exactly as it always has.
  useEffect(() => {
    let live = true

    const run = async () => {
      if (!alreadyRecorded) {
        const result = await recordFinishedGame(game, { guessedCorrectly })
        // Not gated on `live`: dispatching to a reducer after unmount is safe,
        // and skipping it would lose the record flag on StrictMode's first pass.
        if (result === 'recorded') {
          dispatch({ type: 'MARK_RECORDED', gameId: game.id })
        }
      }
      const totals = await fetchGameStats()
      if (live) setStats(totals)
    }

    void run()
    return () => {
      live = false
    }
    // Keyed on the game id: one log per finished game, never on re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id])

  return (
    <Screen
      direction={direction}
      scroll
      center={false}
      action={
        <div className="space-y-2.5">
          <Button onClick={() => dispatch({ type: 'PLAY_AGAIN' })}>Play again</Button>
          <Button variant="ghost" size="md" block onClick={() => dispatch({ type: 'GO_HOME' })}>
            Home
          </Button>
        </div>
      }
    >
      <div className="flex flex-1 flex-col justify-center py-6">
        <m.div
          variants={riseGroup}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center gap-4 text-center"
        >
          <m.p
            variants={riseItem}
            className={'text-label uppercase ' + (civiliansWon ? 'text-bone' : 'text-signal')}
          >
            {civiliansWon ? 'The table wins' : 'The impostors win'}
          </m.p>

          <m.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 20 }}
            className={'text-hero ' + (civiliansWon ? 'text-bone' : 'text-signal')}
          >
            {civiliansWon ? (
              <>
                CIVILIANS
                <br />
                WIN
              </>
            ) : (
              <>
                MR. WHITE
                <br />
                WINS
              </>
            )}
          </m.h1>

          <m.p variants={riseItem} className="text-body text-mist max-w-[18rem]">
            {civiliansWon
              ? 'Every Mr. White has been found.'
              : 'The impostors were never caught in time.'}
          </m.p>
        </m.div>

        {/* The word, finally */}
        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...spring.soft }}
          className="bg-surface mt-8 rounded-3xl border border-white/8 px-6 py-6 text-center"
        >
          <p className="text-label text-smoke uppercase">
            {game.category} &middot; the secret word
          </p>
          <p className="text-hero text-bone break-words pt-3 uppercase">{game.secretWord}</p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ...spring.soft }}
          className="mt-3 grid grid-cols-2 gap-3"
        >
          <Stat label="Rounds played" value={game.currentRound} />
          <Stat label={mrWhites.length === 1 ? 'Mr. White' : 'Mr. Whites'} value={mrWhites.length} />
        </m.div>

        {stats && stats.games_played > 0 && (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.46 }}
            className="text-smoke mt-3 text-center text-[0.75rem] tabular-nums"
          >
            All time · {stats.games_played} {stats.games_played === 1 ? 'game' : 'games'} ·{' '}
            Civilians {stats.civilian_wins} &ndash; {stats.mr_white_wins} Mr. White
          </m.p>
        )}

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3"
        >
          <p className="text-label text-smoke pb-3 text-center uppercase">Who was who</p>
          <ul className="flex flex-wrap justify-center gap-1.5">
            {game.players.map((player) => (
              <li
                key={player.id}
                className={
                  'max-w-[9rem] truncate rounded-full px-3 py-1.5 text-[0.8125rem] ' +
                  (player.role === 'MR_WHITE'
                    ? 'bg-signal/15 text-signal font-semibold'
                    : 'bg-white/6 text-mist')
                }
              >
                {player.name}
              </li>
            ))}
          </ul>
        </m.div>
      </div>
    </Screen>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface rounded-2xl border border-white/8 px-4 py-4 text-center">
      <p className="text-bone text-[1.75rem] leading-none font-bold tabular-nums">{value}</p>
      <p className="text-label text-smoke pt-2 uppercase">{label}</p>
    </div>
  )
}
