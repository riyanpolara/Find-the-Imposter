import { m } from 'framer-motion'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { startingIndexForRound } from '@/game/roundManager'
import { useGame } from '@/hooks/useGame'
import { riseGroup, riseItem } from '@/utils/motion'

export function GameReady({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const game = state.game
  if (!game) return null
  const starter = game.players[startingIndexForRound(game, 1)]

  return (
    <Screen
      direction={direction}
      action={
        <div className="space-y-2.5">
          <Button onClick={() => dispatch({ type: 'START_ROUND' })}>Start round 1</Button>
          <Button variant="ghost" size="md" block onClick={() => dispatch({ type: 'GO_HOME' })}>
            Home
          </Button>
        </div>
      }
    >
      <m.div
        variants={riseGroup}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center gap-6 text-center"
      >
        <m.h1 variants={riseItem} className="text-hero text-bone">
          EVERYONE
          <br />
          IS READY
        </m.h1>

        <m.p variants={riseItem} className="text-body text-mist max-w-[17rem]">
          Cards are dealt. Put the phone down where everyone can reach it.
        </m.p>

        <m.div variants={riseItem} className="pt-2">
          <p className="text-label text-smoke pb-2 uppercase">First to give a clue</p>
          <p className="text-title text-bone break-words uppercase">{starter.name}</p>
        </m.div>
      </m.div>
    </Screen>
  )
}
