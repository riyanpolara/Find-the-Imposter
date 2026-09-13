import { AnimatePresence, m } from 'framer-motion'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { RosterSummary } from '@/components/ui/RosterSummary'
import { StepHeader } from '@/components/ui/StepHeader'
import { Stepper } from '@/components/ui/Stepper'
import { MR_WHITE_MIN, maxMrWhites } from '@/game/setupRules'
import { useGame } from '@/hooks/useGame'
import { riseGroup, riseItem } from '@/utils/motion'

export function SetupMrWhites({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const { playerCount, mrWhiteCount } = state.setup
  const max = maxMrWhites(playerCount)
  const atCeiling = mrWhiteCount >= max

  return (
    <Screen
      direction={direction}
      header={<StepHeader onBack={() => dispatch({ type: 'BACK' })} step={2} total={2} />}
      action={<Button onClick={() => dispatch({ type: 'NEXT' })}>Continue</Button>}
    >
      <m.div
        variants={riseGroup}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center gap-9 text-center"
      >
        <m.h1 variants={riseItem} className="text-hero text-bone">
          HOW MANY
          <br />
          MR. WHITES?
        </m.h1>

        <m.div variants={riseItem}>
          <Stepper
            label="Mr. White count"
            value={mrWhiteCount}
            min={MR_WHITE_MIN}
            max={max}
            onStep={(delta) => dispatch({ type: 'STEP_MR_WHITE_COUNT', delta })}
          />
        </m.div>

        <RosterSummary playerCount={playerCount} mrWhiteCount={mrWhiteCount} />

        {/* Explains the ceiling rather than silently disabling the button */}
        <div className="h-5">
          <AnimatePresence>
            {atCeiling && (
              <m.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-smoke text-[0.8125rem]"
              >
                Mr. Whites have to stay outnumbered.
              </m.p>
            )}
          </AnimatePresence>
        </div>
      </m.div>
    </Screen>
  )
}
