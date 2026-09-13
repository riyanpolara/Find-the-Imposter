import { m } from 'framer-motion'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { useGame } from '@/hooks/useGame'
import { riseGroup, riseItem, spring } from '@/utils/motion'

/**
 * The role reveal, after the name. Order matters: the table sees who went out,
 * then finds out what they were.
 */
export function Elimination({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const game = state.game
  if (!game) return null
  const player = game.players.find((p) => p.id === state.eliminatedId)!
  const caught = player.role === 'MR_WHITE'

  return (
    <Screen
      direction={direction}
      action={
        <Button onClick={() => dispatch({ type: 'CONTINUE_AFTER_ELIMINATION' })}>
          {caught ? 'One last chance' : 'Continue'}
        </Button>
      }
    >
      <m.div
        variants={riseGroup}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center gap-5 text-center"
      >
        <m.p variants={riseItem} className="text-label text-smoke uppercase">
          Eliminated
        </m.p>

        <m.h1 variants={riseItem} className="text-title text-bone break-words uppercase">
          {player.name}
        </m.h1>

        <m.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.24, ...spring.soft }}
          className={
            'relative mt-1 overflow-hidden rounded-2xl border px-7 py-6 ' +
            (caught
              ? 'border-signal/50 bg-signal/8'
              : 'border-white/10 bg-surface')
          }
        >
          {caught && (
            <m.span
              aria-hidden
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 0.9, 0.35], scale: 1.2 }}
              transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(closest-side, color-mix(in oklab, var(--color-signal) 30%, transparent), transparent 72%)',
              }}
            />
          )}
          <p
            className={
              'relative text-hero ' + (caught ? 'text-signal' : 'text-bone')
            }
          >
            {caught ? (
              <>
                MR.
                <br />
                WHITE
              </>
            ) : (
              'CIVILIAN'
            )}
          </p>
        </m.div>

        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.44 }}
          className="text-body text-mist max-w-[18rem] pt-1"
        >
          {caught
            ? 'Caught — but not finished. They get one guess at the secret word.'
            : 'The secret word is still safe.'}
        </m.p>
      </m.div>
    </Screen>
  )
}
