import { m } from 'framer-motion'
import { useState } from 'react'

import { Screen } from '@/components/layout/Screen'
import { RevealCard } from '@/components/game/RevealCard'
import { Button } from '@/components/ui/Button'
import { currentPlayer } from '@/game/gameEngine'
import { useGame } from '@/hooks/useGame'

/**
 * `revealed` is local component state on purpose: this component unmounts
 * between players, so the next person can never inherit a flipped card.
 */
export function CardReveal({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const [revealed, setRevealed] = useState(false)
  const game = state.game!
  const player = currentPlayer(game)

  return (
    <Screen
      direction={direction}
      header={
        <p className="text-label text-smoke uppercase">
          {revealed ? player.name : 'Only you should look'}
        </p>
      }
      action={
        <Button
          onClick={() => dispatch({ type: 'HIDE_CARD' })}
          disabled={!revealed}
          variant={revealed ? 'primary' : 'secondary'}
        >
          {revealed ? 'Hide card' : 'Tap the card first'}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-7">
        <RevealCard
          role={player.role!}
          word={game.secretWord}
          category={game.category}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
        />

        {!revealed && (
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-mist max-w-[16rem] text-center text-[0.9375rem]"
          >
            Make sure nobody else can see the screen, then tap to reveal.
          </m.p>
        )}
      </div>
    </Screen>
  )
}
