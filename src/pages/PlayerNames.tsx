import { m } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'

import { Screen } from '@/components/layout/Screen'
import { BackButton } from '@/components/ui/BackButton'
import { Button } from '@/components/ui/Button'
import { NameField } from '@/components/ui/NameField'
import { validateNames } from '@/game/setupRules'
import { useGame } from '@/hooks/useGame'

export function PlayerNames({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const { names, playerCount, mrWhiteCount } = state.setup
  const [showIssues, setShowIssues] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const issues = useMemo(() => validateNames(names), [names])
  const firstIssue = issues.findIndex((issue) => issue !== null)
  const complete = firstIssue === -1

  const focusInput = (index: number) => {
    const el = inputs.current[index]
    el?.focus()
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const submit = () => {
    if (complete) {
      dispatch({ type: 'GENERATE_GAME' })
      return
    }
    // Don't just disable the button — say what's wrong and go there.
    setShowIssues(true)
    focusInput(firstIssue)
  }

  return (
    <Screen
      direction={direction}
      scroll
      center={false}
      header={
        <div className="flex items-center justify-between gap-3 pb-5">
          <BackButton onClick={() => dispatch({ type: 'BACK' })} />
          <p className="text-label text-smoke uppercase">
            {playerCount} players · {mrWhiteCount} Mr. {mrWhiteCount === 1 ? 'White' : 'Whites'}
          </p>
        </div>
      }
      action={
        <Button onClick={submit} className={complete ? undefined : 'opacity-60'}>
          Start game
        </Button>
      }
    >
      <m.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-title text-bone pb-5"
      >
        WHO IS PLAYING?
      </m.h1>

      <div className="flex flex-col gap-2.5 pb-2">
        {names.map((name, index) => (
          <NameField
            key={index}
            index={index}
            value={name}
            issue={issues[index]}
            showIssue={showIssues}
            inputRef={(el) => {
              inputs.current[index] = el
            }}
            onChange={(value) => dispatch({ type: 'SET_NAME', index, value })}
            onEnter={() => {
              if (index < names.length - 1) focusInput(index + 1)
              else submit()
            }}
          />
        ))}
      </div>
    </Screen>
  )
}
