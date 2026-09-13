import { m } from 'framer-motion'
import { useState } from 'react'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { useGame } from '@/hooks/useGame'
import { activePlayers } from '@/game/roundManager'
import { cn } from '@/utils/cn'
import { spring } from '@/utils/motion'

/**
 * Group vote: the table discusses out loud, then one person opens this screen
 * and picks who the group wants to eliminate. No pass-the-phone handoff.
 */
export function Voting({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const game = state.game
  if (!game) return null

  const alive = activePlayers(game)
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <Screen
      direction={direction}
      scroll
      header={
        <div className="pb-6 text-center">
          <p className="text-label text-smoke pb-2 uppercase tabular-nums">
            Round {game.currentRound}
          </p>
          <h1 className="text-title text-bone">WHO IS MR. WHITE?</h1>
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="text-mist pt-3 text-[0.9375rem]"
          >
            Discuss as a group, then pick one player to eliminate.
          </m.p>
        </div>
      }
      action={
        <Button
          onClick={() =>
            selected && dispatch({ type: 'VOTE_ELIMINATE', targetId: selected })
          }
          disabled={!selected}
        >
          {selected ? 'Eliminate' : 'Pick someone'}
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {alive.map((player, i) => {
          const isSelected = selected === player.id
          return (
            <m.li
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.soft, delay: Math.min(i, 10) * 0.028 }}
            >
              <m.button
                type="button"
                onClick={() => setSelected(player.id)}
                whileTap={{ scale: 0.985 }}
                transition={spring.press}
                aria-pressed={isSelected}
                className={cn(
                  'flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border px-5 text-left transition-colors duration-150 cursor-pointer',
                  isSelected
                    ? 'border-signal bg-signal/15 text-bone'
                    : 'bg-surface border-white/8 text-bone hover:border-white/20',
                )}
              >
                <span className="truncate font-semibold">{player.name}</span>
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border transition-colors',
                    isSelected ? 'border-signal bg-signal' : 'border-white/25',
                  )}
                >
                  {isSelected && (
                    <m.svg
                      width="11"
                      height="11"
                      viewBox="0 0 12 12"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={spring.press}
                    >
                      <path
                        d="M2.5 6.4 5 8.8 9.5 3.6"
                        fill="none"
                        stroke="var(--color-bone)"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </m.svg>
                  )}
                </span>
              </m.button>
            </m.li>
          )
        })}
      </ul>

      <p className="text-smoke pt-4 text-center text-[0.75rem]">
        The group decides together who to eliminate.
      </p>
    </Screen>
  )
}
