import { describe, expect, it } from 'vitest'
import { DIFFICULTIES, WORD_BANK, WORD_PACKS, resolveWordOptions, wordsFor } from '@/data/words'
import { initialState, reducer } from '@/game/store'
import { guessMatches, normaliseGuess, pickSecretWord } from '@/game/wordManager'
import { createGame } from '@/game/gameEngine'
import { seededRng } from '@/game/rng'
import { drive, names } from './helpers'

const setupWords = () => drive(initialState, { type: 'START_SETUP' }, { type: 'NEXT' }, { type: 'NEXT' })

describe('word bank integrity', () => {
  it('has 360 distinct display words and 180 Indian entries', () => {
    expect(WORD_BANK).toHaveLength(360)
    expect(new Set(WORD_BANK.map(w => normaliseGuess(w.word))).size).toBe(360)
    expect(WORD_BANK.filter(w => w.pack === 'india')).toHaveLength(180)
    expect(WORD_BANK.every(w => w.word.length <= 40 && w.word.trim() === w.word)).toBe(true)
  })
  it('does not accept another word’s answer through an alias', () => {
    const owners = new Map<string, string>()
    for (const entry of WORD_BANK) {
      for (const answer of [entry.word, ...entry.aliases]) {
        const key = normaliseGuess(answer)
        expect(owners.get(key) ?? entry.word).toBe(entry.word)
        owners.set(key, entry.word)
      }
    }
  })
  for (const difficulty of DIFFICULTIES) {
    for (const pack of WORD_PACKS) {
      it(`only deals ${difficulty.id} / ${pack.id} words, including the full pool`, () => {
        const options = {difficulty:difficulty.id,wordPack:pack.id}
        const pool = wordsFor(options)
        expect(pool).toHaveLength(pack.id === 'mixed' ? 120 : 60)
        for (let i=0;i<pool.length;i++) {
          const picked = pickSecretWord(() => (i + 0.5) / pool.length, options)
          expect(picked.word).toBe(pool[i].word)
          expect(picked.category).toBe(pool[i].category)
        }
        const game = createGame({playerCount:6,mrWhiteCount:2,names:names(6),...options},seededRng(4))
        expect(pool.some(w => w.word === game.secretWord)).toBe(true)
        expect(game.difficulty).toBe(difficulty.id)
        expect(game.wordPack).toBe(pack.id)
      })
    }
  }
})

describe('difficulty setup and saved preferences', () => {
  it('visits word choices before names and retains them when navigating back', () => {
    let state = setupWords()
    expect(state.phase).toBe('SETUP_WORDS')
    state = drive(state,{type:'SET_DIFFICULTY',difficulty:'hard'},{type:'SET_WORD_PACK',wordPack:'india'},{type:'NEXT'})
    expect(state.phase).toBe('PLAYER_NAMES')
    expect(reducer(state,{type:'BACK'}).phase).toBe('SETUP_WORDS')
    state = drive(state,{type:'BACK'},{type:'BACK'},{type:'BACK'},{type:'STEP_PLAYER_COUNT',delta:1})
    expect(state.setup.difficulty).toBe('hard')
    expect(state.setup.wordPack).toBe('india')
    expect(reducer(state,{type:'START_SETUP'}).setup.wordPack).toBe('india')
  })
  it('keeps the selected bank on play again', () => {
    let state = drive(setupWords(),{type:'SET_DIFFICULTY',difficulty:'medium'},{type:'SET_WORD_PACK',wordPack:'india'},{type:'NEXT'})
    names(6).forEach((value,index)=> {state=reducer(state,{type:'SET_NAME',index,value})})
    state = drive(state,{type:'GENERATE_GAME'},{type:'PLAY_AGAIN'})
    expect(state.game!.wordPack).toBe('india')
    expect(state.game!.difficulty).toBe('medium')
    expect(wordsFor({difficulty:'medium',wordPack:'india'}).some(w=>w.word===state.game!.secretWord)).toBe(true)
  })
  it('defaults missing choices and does not change an active game’s preferences', () => {
    expect(resolveWordOptions()).toEqual({difficulty:'easy',wordPack:'mixed'})
    expect(reducer(initialState,{type:'SET_DIFFICULTY',difficulty:'hard'})).toBe(initialState)
  })
})

describe('regional and spelling alternatives', () => {
  it.each([['golgappa','Pani Puri'],['phuchka','Pani Puri'],['sari','Saree'],['biriyani','Biryani'],['qutb minar','Qutub Minar'],['rani-ki-vav','Rani ki Vav'],['soufflé','Souffle'],['pitthu','Lagori']])('accepts %s for %s', (guess,word) => {
    expect(guessMatches(guess,word)).toBe(true)
  })
  it.each([['pani','Pani Puri'],['minar','Qutub Minar'],['dosa','Idli'],['kathak','Kathakali'],['burger','Pizza'],['','Chai']])('rejects %s for %s', (guess,word) => {
    expect(guessMatches(guess,word)).toBe(false)
  })
})
