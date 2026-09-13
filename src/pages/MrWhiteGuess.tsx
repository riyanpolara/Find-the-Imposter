import { AnimatePresence, m } from 'framer-motion'
import { useState } from 'react'

import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { useGame } from '@/hooks/useGame'
import { riseGroup, riseItem, spring } from '@/utils/motion'

/**
 * One guess, exact match after normalisation. The word is never on screen
 * before the answer is locked in.
 */
export function MrWhiteGuess({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const [guess, setGuess] = useState('')
  const game = state.game!
  const player = game.players.find((p) => p.id === state.eliminatedId)!
  const outcome = state.guessOutcome

  if (outcome) {
    const correct = outcome === 'CORRECT'
    return (
      <Screen
        direction={direction}
        action={
          <Button onClick={() => dispatch({ type: 'CONTINUE_AFTER_GUESS' })}>
            {correct ? 'See the result' : 'Continue'}
          </Button>
        }
      >
        <m.div
          variants={riseGroup}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center gap-5 text-center"
        >
          <m.p
            variants={riseItem}
            className={'text-label uppercase ' + (correct ? 'text-bone' : 'text-signal')}
          >
            {correct ? 'Guessed it' : 'Wrong guess'}
          </m.p>

          <m.p variants={riseItem} className="text-label text-smoke uppercase">
            The word was
          </m.p>

          <m.h1
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, type: 'spring', stiffness: 340, damping: 22 }}
            className="text-hero text-bone break-words uppercase"
          >
            {game.secretWord}
          </m.h1>

          <m.p variants={riseItem} className="text-body text-mist max-w-[18rem] pt-1">
            {correct
              ? `${player.name} worked it out from the clues.`
              : `${player.name} is out of the game.`}
          </m.p>
        </m.div>
      </Screen>
    )
  }

  const canSubmit = guess.trim().length > 0

  return (
    <Screen
      direction={direction}
      action={
        <Button
          onClick={() => canSubmit && dispatch({ type: 'SUBMIT_GUESS', guess })}
          disabled={!canSubmit}
        >
          Submit guess
        </Button>
      }
    >
      <m.div
        variants={riseGroup}
        initial="initial"
        animate="animate"
        className="flex flex-col items-center gap-5 text-center"
      >
        <m.p variants={riseItem} className="text-label text-signal uppercase">
          One last chance
        </m.p>

        <m.h1 variants={riseItem} className="text-hero text-bone break-words uppercase">
          {player.name}
        </m.h1>

        <m.p variants={riseItem} className="text-body text-mist max-w-[18rem]">
          Guess the secret word. Get it right and you win the game.
        </m.p>

        <m.div variants={riseItem} className="w-full pt-2">
          <label className="sr-only" htmlFor="guess">
            Your guess
          </label>
          <input
            id="guess"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canSubmit) {
                e.preventDefault()
                dispatch({ type: 'SUBMIT_GUESS', guess })
              }
            }}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="words"
            spellCheck={false}
            enterKeyHint="done"
            maxLength={40}
            placeholder="Type the word"
            className="text-bone placeholder:text-smoke/70 bg-surface min-h-14 w-full rounded-2xl border border-white/8 px-5 text-center text-[1.125rem] font-semibold outline-none transition-colors duration-150 focus:border-white/25"
          />
          <AnimatePresence>
            {canSubmit && (
              <m.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={spring.soft}
                className="text-smoke pt-3 text-[0.75rem]"
              >
                Capitals and extra spaces don&rsquo;t matter.
              </m.p>
            )}
          </AnimatePresence>
        </m.div>
      </m.div>
    </Screen>
  )
}
