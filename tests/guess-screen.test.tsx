import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { LazyMotion, domAnimation } from 'framer-motion'
import { GameContext } from '@/hooks/useGame'
import { MrWhiteGuess } from '@/pages/MrWhiteGuess'
import { dealtGame, drive, mrWhites } from './helpers'

function guessScreen(whiteCount: number, correct = false) {
  let state = drive(dealtGame(6, whiteCount), { type: 'START_ROUND' }, { type: 'START_VOTING' })
  state = drive(state, { type: 'VOTE_ELIMINATE', targetId: mrWhites(state.game!)[0].id }, { type: 'CONTINUE_AFTER_ELIMINATION' })
  const secretWord = state.game!.secretWord
  state = drive(state, { type: 'SUBMIT_GUESS', guess: correct ? secretWord : 'not-the-secret' })
  const html = renderToStaticMarkup(<LazyMotion features={domAnimation}><GameContext.Provider value={{ state, dispatch: () => {} }}><MrWhiteGuess direction={1} /></GameContext.Provider></LazyMotion>)
  return { html, secretWord }
}

describe('secret word visibility after a guess', () => {
  it('keeps the word out of the rendered screen while another Mr. White remains', () => {
    const { html, secretWord } = guessScreen(2)
    expect(html).not.toContain(secretWord)
    expect(html).toContain('The secret stays safe')
  })
  it('reveals the word when the last Mr. White loses', () => {
    const { html, secretWord } = guessScreen(1)
    expect(html).toContain(secretWord)
  })
  it('reveals the word when a correct guess ends the game', () => {
    const { html, secretWord } = guessScreen(2, true)
    expect(html).toContain(secretWord)
  })
})
