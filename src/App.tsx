import { AnimatePresence, domAnimation, LazyMotion, MotionConfig } from 'framer-motion'

import { Atmosphere } from '@/components/layout/Atmosphere'
import { GameProvider } from '@/components/layout/GameProvider'
import { CardReveal } from '@/pages/CardReveal'
import { ChooseCard } from '@/pages/ChooseCard'
import { Elimination } from '@/pages/Elimination'
import { GameOver } from '@/pages/GameOver'
import { GameReady } from '@/pages/GameReady'
import { Home } from '@/pages/Home'
import { MrWhiteGuess } from '@/pages/MrWhiteGuess'
import { PassPhone } from '@/pages/PassPhone'
import { PlayerNames } from '@/pages/PlayerNames'
import { Round } from '@/pages/Round'
import { SetupMrWhites } from '@/pages/SetupMrWhites'
import { SetupPlayers } from '@/pages/SetupPlayers'
import { VoteResults } from '@/pages/VoteResults'
import { Voting } from '@/pages/Voting'
import { useGame } from '@/hooks/useGame'
import type { Phase } from '@/types/game'

/**
 * One value — the phase — decides what is on screen. No `isVoting`,
 * `isCardOpen`, `isRoundStarted` booleans anywhere.
 */
const SCREENS: Partial<Record<Phase, (props: { direction: number }) => React.ReactElement>> = {
  HOME: Home,
  SETUP_PLAYERS: SetupPlayers,
  SETUP_MR_WHITES: SetupMrWhites,
  PLAYER_NAMES: PlayerNames,
  PASS_PHONE: PassPhone,
  CARD_DISTRIBUTION: ChooseCard,
  CARD_REVEAL: CardReveal,
  GAME_READY: GameReady,
  ROUND: Round,
  VOTING: Voting,
  VOTE_RESULTS: VoteResults,
  ELIMINATION: Elimination,
  MR_WHITE_GUESS: MrWhiteGuess,
  GAME_OVER: GameOver,
}

function CurrentScreen() {
  const { state } = useGame()
  const Screen = SCREENS[state.phase] ?? Home

  return (
    // `mode="wait"` guarantees the outgoing screen is gone before the next
    // paints — non-negotiable for a pass-the-phone game where the previous
    // player's secrets must never linger behind a cross-fade.
    <AnimatePresence mode="wait" custom={state.direction} initial={false}>
      <Screen key={state.phase} direction={state.direction} />
    </AnimatePresence>
  )
}

export default function App() {
  return (
    // `domAnimation` ships transform/opacity/gesture support only, which is
    // everything this game needs — it keeps ~35kB of layout/drag code out of
    // the bundle. Components use `m.*`; `strict` makes a stray `motion.*` throw.
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <GameProvider>
          <Atmosphere />
          <CurrentScreen />
        </GameProvider>
      </MotionConfig>
    </LazyMotion>
  )
}
