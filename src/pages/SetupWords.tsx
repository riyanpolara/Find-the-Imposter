import { m } from 'framer-motion'
import { Screen } from '@/components/layout/Screen'
import { Button } from '@/components/ui/Button'
import { StepHeader } from '@/components/ui/StepHeader'
import { DIFFICULTIES, WORD_PACKS, resolveWordOptions, wordsFor } from '@/data/words'
import { useGame } from '@/hooks/useGame'

export function SetupWords({ direction }: { direction: number }) {
  const { state, dispatch } = useGame()
  const options = resolveWordOptions(state.setup)
  const pool = wordsFor(options)
  const difficulty = DIFFICULTIES.find((item) => item.id === options.difficulty)!
  const pack = WORD_PACKS.find((item) => item.id === options.wordPack)!
  const examples = [...new Set(pool.map((entry) => entry.category))].slice(0, 3).map((category) => pool.find((entry) => entry.category === category)!.word)

  return <Screen direction={direction} scroll center={false}
    header={<StepHeader onBack={() => dispatch({ type: 'BACK' })} step={3} total={4} />}
    action={<Button onClick={() => dispatch({ type: 'NEXT' })}>Continue · Add names ↗</Button>}
  >
    <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="word-setup">
      <p className="setup-kicker">03 / Pick your challenge</p>
      <h1 className="text-hero">SET THE<br /><span className="text-acid">DIFFICULTY.</span></h1>
      <p className="setup-note">Choose words your group will enjoy bluffing about.</p>
      <fieldset className="word-options">
        <legend>How tricky?</legend>
        <div className="word-segment">
          {DIFFICULTIES.map((item, i) => <label key={item.id} className="word-option">
            <input type="radio" name="difficulty" value={item.id} checked={options.difficulty === item.id} onChange={() => dispatch({ type: 'SET_DIFFICULTY', difficulty: item.id })} />
            <span><span aria-hidden="true" className="difficulty-bars">{Array.from({length: 3}, (_, j) => <i key={j} className={j <= i ? 'filled' : ''} />)}</span>{item.label}</span>
          </label>)}
        </div>
        <p className="word-description">{difficulty.description}</p>
      </fieldset>
      <fieldset className="word-options">
        <legend>Choose a word pack</legend>
        <div className="word-segment">
          {WORD_PACKS.map((item) => <label key={item.id} className="word-option">
            <input type="radio" name="word-pack" value={item.id} checked={options.wordPack === item.id} onChange={() => dispatch({ type: 'SET_WORD_PACK', wordPack: item.id })} />
            <span>{item.label}</span>
          </label>)}
        </div>
        <p className="word-description">{pack.description}</p>
      </fieldset>
      <div className="word-preview" aria-live="polite" aria-atomic="true">
        <div><span>{difficulty.label} / {pack.label}</span><strong>{pool.length} words</strong></div>
        <p>Examples: {examples.join(' · ')}</p>
        <small>One word is chosen at random when the cards are dealt.</small>
      </div>
      <p className="text-smoke text-xs leading-relaxed">All words are stored on this phone. Your choices carry over when you play again.</p>
    </m.div>
  </Screen>
}
