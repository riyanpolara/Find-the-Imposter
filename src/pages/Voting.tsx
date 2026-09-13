import { AnimatePresence, m } from 'framer-motion'
import { useState } from 'react'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { eligibleTargets, voters } from '@/game/voteManager'
import { useGame } from '@/hooks/useGame'
import { cn } from '@/utils/cn'
import { riseGroup, riseItem, spring } from '@/utils/motion'

/**
 * Secret ballot, passed around the table.
 *
 * The whole screen is keyed by voter, so it unmounts and remounts between
 * people — the previous voter's selection cannot survive the handoff, and the
 * running tally is never on screen at all.
 */
export function Voting({ direction }: { direction: number }) {
  const { state } = useGame()
  const game = state.game
  if (!game) return null
  const ballot = voters(game)
  const voter = ballot[state.votingIndex] ?? ballot[0]

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Ballot key={voter.id} voterId={voter.id} direction={direction} />
    </AnimatePresence>
  )
}

function Ballot({ voterId, direction }: { voterId: string; direction: number }) {
  const { state, dispatch } = useGame()
  const game = state.game
  if (!game) return null
  const ballot = voters(game)
  const voter = game.players.find((p) => p.id === voterId)!
  const targets = eligibleTargets(game, voterId)

  const [ready, setReady] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  if (!ready) {
    return (
      <Screen
        direction={direction}
        header={
          <div className="space-y-2.5">
            <p className="text-label text-smoke uppercase tabular-nums">
              Vote {state.votingIndex + 1} of {ballot.length}
            </p>
            <Progress value={state.votingIndex} total={ballot.length} />
          </div>
        }
        action={<Button onClick={() => setReady(true)}>I&rsquo;m ready</Button>}
      >
        <m.div
          variants={riseGroup}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center gap-6 text-center"
        >
          <m.p variants={riseItem} className="text-label text-smoke uppercase">
            Pass the phone to
          </m.p>
          <m.h1 variants={riseItem} className="text-hero text-bone max-w-full break-words uppercase">
            {voter.name}
          </m.h1>
          <m.p variants={riseItem} className="text-body text-mist max-w-[17rem]">
            Your vote stays secret until everyone has voted.
          </m.p>
        </m.div>
      </Screen>
    )
  }

  return (
    <Screen
      direction={direction}
      scroll
      header={
        <div className="pb-6 text-center">
          <p className="text-label text-smoke pb-2 uppercase">{voter.name}</p>
          <h1 className="text-title text-bone">WHO DO YOU SUSPECT?</h1>
        </div>
      }
      action={
        <Button
          onClick={() => selected && dispatch({ type: 'SUBMIT_VOTE', targetId: selected })}
          disabled={!selected}
        >
          {selected ? 'Confirm vote' : 'Pick someone'}
        </Button>
      }
    >
      <ul className="flex flex-col gap-2">
        {targets.map((target, i) => {
          const isSelected = selected === target.id
          return (
            <m.li
              key={target.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.soft, delay: Math.min(i, 10) * 0.028 }}
            >
              <m.button
                type="button"
                onClick={() => setSelected(target.id)}
                whileTap={{ scale: 0.985 }}
                transition={spring.press}
                aria-pressed={isSelected}
                className={cn(
                  'flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border px-5 text-left transition-colors duration-150',
                  isSelected
                    ? 'border-bone bg-bone text-void'
                    : 'bg-surface border-white/8 text-bone hover:border-white/20',
                )}
              >
                <span className="truncate font-semibold">{target.name}</span>
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border transition-colors',
                    isSelected ? 'border-void bg-void' : 'border-white/25',
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
        You can&rsquo;t vote for yourself.
      </p>
    </Screen>
  )
}
