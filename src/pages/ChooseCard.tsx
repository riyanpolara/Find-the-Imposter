import { m } from 'framer-motion'

import { Screen } from '@/components/layout/Screen'
import { HiddenCard } from '@/components/game/HiddenCard'
import { currentPlayer } from '@/game/gameEngine'
import { availableCards } from '@/game/cardManager'
import { useGame } from '@/hooks/useGame'

/** Column count that keeps every card comfortably tappable at 320px. */
function columnsFor(total: number): string {
  if (total <= 4) return 'grid-cols-2'
  if (total <= 12) return 'grid-cols-3'
  return 'grid-cols-4'
}

export function ChooseCard({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const game = state.game
  if (!game) return null
  const player = currentPlayer(game)
  const remaining = availableCards(game.cards).length

  return (
    <Screen
      direction={direction}
      wide
      scroll
      header={
        <div className="pb-7 text-center">
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-label text-smoke pb-2 uppercase"
          >
            {player.name}
          </m.p>
          <m.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-title text-bone"
          >
            PICK A CARD
          </m.h1>
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08 }}
            className="text-smoke pt-2 text-[0.8125rem] tabular-nums"
          >
            {remaining} left · any one of them
          </m.p>
        </div>
      }
    >
      <div className={`grid gap-2.5 ${columnsFor(game.cards.length)}`}>
        {game.cards.map((card, index) => (
          <HiddenCard
            key={card.id}
            index={index}
            taken={card.selected}
            onSelect={() => dispatch({ type: 'SELECT_CARD', cardId: card.id })}
          />
        ))}
      </div>
    </Screen>
  )
}
