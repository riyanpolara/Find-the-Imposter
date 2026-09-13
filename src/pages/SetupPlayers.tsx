import { m } from 'framer-motion'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { RosterSummary } from '@/components/ui/RosterSummary'
import { StepHeader } from '@/components/ui/StepHeader'
import { Stepper } from '@/components/ui/Stepper'
import { PLAYER_MAX, PLAYER_MIN } from '@/game/setupRules'
import { useGame } from '@/hooks/useGame'
import { riseGroup, riseItem } from '@/utils/motion'

export function SetupPlayers({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const { playerCount, mrWhiteCount } = state.setup

  return (
    <Screen
      direction={direction}
      header={<StepHeader onBack={() => dispatch({ type: 'BACK' })} step={1} total={2} />}
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
          PLAYERS?
        </m.h1>

        <m.div variants={riseItem}>
          <Stepper
            label="player count"
            value={playerCount}
            min={PLAYER_MIN}
            max={PLAYER_MAX}
            onStep={(delta) => dispatch({ type: 'STEP_PLAYER_COUNT', delta })}
          />
        </m.div>

        <RosterSummary playerCount={playerCount} mrWhiteCount={mrWhiteCount} />
      </m.div>
    </Screen>
  )
}
