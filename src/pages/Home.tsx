import { m } from 'framer-motion'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { CardFan } from '@/components/ui/CardFan'
import { Wordmark } from '@/components/ui/Wordmark'
import { useGame } from '@/hooks/useGame'
import { riseGroup, riseItem } from '@/utils/motion'

export function Home({ direction }: { direction: number }) {
  const { dispatch } = useGame()

  return (
    <Screen
      direction={direction}
      header={
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-label text-smoke flex items-center gap-2 uppercase"
        >
          <span className="bg-signal size-1.5 rounded-full" />
          Social deduction
        </m.p>
      }
      action={
        <m.div
          variants={riseGroup}
          initial="initial"
          animate="animate"
          transition={{ delayChildren: 0.34 }}
          className="space-y-4"
        >
          <m.div variants={riseItem}>
            <Button onClick={() => dispatch({ type: 'START_SETUP' })}>Start game</Button>
          </m.div>
          <m.p variants={riseItem} className="text-smoke text-center text-[0.8125rem]">
            One phone. Pass it around. 3&ndash;20 players.
          </m.p>
        </m.div>
      }
    >
      <div className="flex flex-col items-center gap-8 text-center">
        <CardFan />

        <m.div
          variants={riseGroup}
          initial="initial"
          animate="animate"
          transition={{ delayChildren: 0.2 }}
          className="flex flex-col items-center gap-5"
        >
          <Wordmark />
          <m.p variants={riseItem} className="text-body text-mist max-w-[19rem] text-balance">
            Can you find the impostors?
          </m.p>
        </m.div>
      </div>
    </Screen>
  )
}
