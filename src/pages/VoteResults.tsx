import { m } from 'framer-motion'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { resolveVote } from '@/game/voteManager'
import { useGame } from '@/hooks/useGame'
import { cn } from '@/utils/cn'
import { spring } from '@/utils/motion'

export function VoteResults({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const game = state.game
  if (!game) return null
  const outcome = resolveVote(game, game.currentRound)
  const top = outcome.tally[0]?.count ?? 1
  const isTie = outcome.kind === 'TIE'

  return (
    <Screen
      direction={direction}
      scroll
      header={
        <div className="pb-6 text-center">
          <p className="text-label text-smoke pb-2 uppercase tabular-nums">
            Round {game.currentRound}
          </p>
          <h1 className="text-title text-bone">VOTE RESULTS</h1>
        </div>
      }
      action={
        <Button onClick={() => dispatch({ type: 'RESOLVE_VOTE' })}>
          {isTie ? 'Vote again' : 'Continue'}
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {outcome.tally.map((entry, i) => {
          const isTop = entry.count === top
          return (
            <m.li
              key={entry.playerId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.soft, delay: i * 0.07 }}
              className={cn(
                'relative overflow-hidden rounded-2xl border px-4 py-3.5',
                isTop && !isTie
                  ? 'border-signal/50 bg-signal/8'
                  : 'bg-surface border-white/8',
              )}
            >
              {/* Bar grows to show the share — scaleX only, no layout thrash */}
              <m.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: entry.count / top }}
                transition={{ delay: 0.12 + i * 0.07, type: 'spring', stiffness: 180, damping: 26 }}
                style={{ transformOrigin: 'left' }}
                className={cn(
                  'absolute inset-y-0 left-0 w-full',
                  isTop && !isTie ? 'bg-signal/14' : 'bg-white/4',
                )}
              />
              <span className="relative flex items-center justify-between gap-3">
                <span className="text-bone truncate font-semibold">{entry.name}</span>
                <span
                  className={cn(
                    'shrink-0 text-[0.8125rem] tabular-nums',
                    isTop && !isTie ? 'text-signal font-semibold' : 'text-mist',
                  )}
                >
                  {entry.count} {entry.count === 1 ? 'vote' : 'votes'}
                </span>
              </span>
            </m.li>
          )
        })}
      </ul>

      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 + outcome.tally.length * 0.07, ...spring.soft }}
        className="pt-7 text-center"
      >
        {isTie ? (
          <>
            <p className="text-hero text-bone">TIE</p>
            <p className="text-mist pt-3 text-[0.9375rem]">
              Nobody is eliminated. The group votes again.
            </p>
          </>
        ) : (
          <>
            <p className="text-title text-bone break-words uppercase">
              {game.players.find((p) => p.id === outcome.playerId)?.name}
            </p>
            <p className="text-signal text-label pt-2 uppercase">is eliminated</p>
          </>
        )}
      </m.div>
    </Screen>
  )
}
