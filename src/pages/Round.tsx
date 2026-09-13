import { m } from 'framer-motion'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { activePlayers, turnOrder } from '@/game/roundManager'
import { useGame } from '@/hooks/useGame'
import { riseGroup, riseItem } from '@/utils/motion'

/**
 * The clue phase happens out loud, around the table — the app's only job here
 * is to say whose turn it is and in what order, then get out of the way.
 */
export function Round({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const game = state.game!
  const order = turnOrder(game, game.currentPlayerIndex)
  const starter = order[0]
  const stillIn = activePlayers(game).length

  return (
    <Screen
      direction={direction}
      scroll
      action={
        <Button onClick={() => dispatch({ type: 'START_VOTING' })}>Everyone has spoken</Button>
      }
    >
      <div className="flex flex-col items-center gap-7 text-center">
        {/* The round marker doubles as the transition: a hard scale-in the
            player never has to wait out, rather than a blocking interstitial. */}
        <m.div
          key={game.currentRound}
          initial={{ opacity: 0, scale: 1.25, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex flex-col items-center"
        >
          <span className="text-label text-smoke uppercase">Round</span>
          <span className="text-wordmark text-bone leading-none tabular-nums">
            {game.currentRound}
          </span>
        </m.div>

        <m.div
          variants={riseGroup}
          initial="initial"
          animate="animate"
          className="flex w-full flex-col items-center gap-7"
        >
          <m.div variants={riseItem} className="flex flex-col items-center gap-2">
            <p className="text-label text-smoke uppercase">Starts with</p>
            <p className="text-title text-bone max-w-full break-words uppercase">{starter.name}</p>
          </m.div>

          <m.p variants={riseItem} className="text-body text-mist max-w-[18rem]">
            Say one word that hints at the secret word. Not too obvious.
          </m.p>

          <m.div variants={riseItem} className="w-full">
            <p className="text-label text-smoke pb-3 uppercase">Clue order</p>
            <ol className="flex flex-wrap justify-center gap-1.5">
              {order.map((player, i) => (
                <li
                  key={player.id}
                  className={
                    'max-w-[8rem] truncate rounded-full px-3 py-1.5 text-[0.8125rem] ' +
                    (i === 0 ? 'bg-bone text-void font-semibold' : 'bg-white/6 text-mist')
                  }
                >
                  {player.name}
                </li>
              ))}
            </ol>
          </m.div>

          {/* Standing, without ever naming who is who */}
          <m.p
            variants={riseItem}
            className="text-smoke text-[0.75rem] tabular-nums"
          >
            {stillIn} still in the game
          </m.p>
        </m.div>
      </div>
    </Screen>
  )
}
