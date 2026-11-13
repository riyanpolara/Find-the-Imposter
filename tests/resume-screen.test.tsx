import { domAnimation, LazyMotion } from 'framer-motion'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { availableCards } from '@/game/cardManager'
import { GameContext } from '@/hooks/useGame'
import { CardReveal } from '@/pages/CardReveal'
import { PassPhone } from '@/pages/PassPhone'
import { drive, setupGame } from './helpers'

describe('resuming a private card', () => {
  it.each([0, 2, 5])('shows the correct handoff count and a hidden card for seat %i', (seat) => {
    let state = setupGame(6, 2)
    for (let index = 0; index <= seat; index++) {
      state = drive(state,
        { type: 'PLAYER_READY' },
        { type: 'SELECT_CARD', cardId: availableCards(state.game!.cards)[0].id },
      )
      if (index < seat) state = drive(state, { type: 'HIDE_CARD' })
    }
    state = { ...state, phase: 'PASS_PHONE' }
    // A unique secret makes absence assertions independent of random word choice.
    state.game = { ...state.game!, secretWord: 'PRIVATE_TEST_WORD' }
    const render = (screen: React.ReactNode) => renderToStaticMarkup(
      <LazyMotion features={domAnimation}>
        <GameContext.Provider value={{ state, dispatch: () => {} }}>
          {screen}
        </GameContext.Provider>
      </LazyMotion>,
    )

    const handoff = render(<PassPhone direction={1} />)
    expect(handoff).toContain(`Card ${seat + 1} of 6`)
    expect(handoff).not.toContain('PRIVATE_TEST_WORD')

    state = drive(state, { type: 'PLAYER_READY' })
    expect(state.phase).toBe('CARD_REVEAL')
    const card = render(<CardReveal direction={1} />)
    expect(card).toContain('Tap to reveal your card')
    expect(card).toContain('Tap the card first')
    expect(card).not.toContain('PRIVATE_TEST_WORD')
    expect(card).not.toContain('You are')
  })
})
