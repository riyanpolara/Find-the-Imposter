import { m } from 'framer-motion'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { currentPlayer } from '@/game/gameEngine'
import { useGame } from '@/hooks/useGame'
import { riseGroup, riseItem } from '@/utils/motion'

/**
 * The handoff. Nothing secret is on screen — by the time this renders the
 * previous player's card has already unmounted (AnimatePresence mode="wait").
 */
export function PassPhone({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const game = state.game!
  const player = currentPlayer(game)
  const dealt = game.players.filter((p) => p.role !== null).length

  return (
    <Screen
      direction={direction}
      header={
        <div className="space-y-2.5">
          <p className="text-label text-smoke uppercase tabular-nums">
            Card {dealt + 1} of {game.players.length}
          </p>
          <Progress value={dealt} total={game.players.length} />
        </div>
      }
      action={<Button onClick={() => dispatch({ type: 'PLAYER_READY' })}>I&rsquo;m ready</Button>}
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

        <m.h1
          variants={riseItem}
          className="text-hero text-bone max-w-full break-words uppercase"
        >
          {player.name}
        </m.h1>

        <m.p variants={riseItem} className="text-body text-mist max-w-[17rem]">
          Only {player.name} should look at the screen.
        </m.p>
      </m.div>
    </Screen>
  )
}
