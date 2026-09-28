import { m } from 'framer-motion'
import { useRef } from 'react'
import { AgentMark } from '@/components/ui/AgentMark'
import { Button } from '@/components/ui/Button'
import { PLAYER_MAX, PLAYER_MIN } from '@/game/setupRules'
import { useGame } from '@/hooks/useGame'

const rules = [
  ['Get your secret.', 'Pass the phone. Everyone gets the same word, except Mr. White.'],
  ['Talk a little. Bluff a lot.', 'Take turns giving a hint out loud. Mr. White listens and blends in.'],
  ['Trust your gut.', 'Agree on a suspect. One person records the group’s vote on this phone.'],
  ['One last shot.', 'Caught? Mr. White can still win by guessing the word. Otherwise, play on.'],
]

export function Home({ direction }: { direction: number }) {
  const { dispatch } = useGame()
  const guide = useRef<HTMLElement>(null)
  return (
    <m.div className="lobby" initial={{ opacity: 0, y: direction * 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <header className="lobby-nav">
        <a className="brand" href="#" aria-label="Mr. White home"><AgentMark /> MR. WHITE<span className="brand-dot">®</span></a>
        <div className="nav-right"><span className="status-pill"><i /> OFFLINE PARTY GAME</span><button className="help-button" onClick={() => guide.current?.scrollIntoView({ behavior: 'smooth' })} aria-label="How to play">?</button></div>
      </header>
      <main>
        <section className="lobby-hero">
          <div className="hero-copy">
            <p className="eyebrow"><span /> GOOD FRIENDS. GREAT LIARS.</p>
            <h1>TRUST<br />NO<span className="outline-word">BODY.</span><span className="hero-asterisk" aria-hidden="true">✳</span></h1>
            <p className="hero-description">One secret word. A few suspicious friends.<br className="desktop-break" /> And someone who has absolutely no clue.</p>
            <div className="game-facts"><span><b>{PLAYER_MIN}–{PLAYER_MAX}</b> friends</span><span><b>1</b> phone</span><span><b>Zero</b> poker faces</span></div>
          </div>
          <div className="hero-art" aria-label="Illustrated secret identity cards">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <span className="art-cross cross-one">+</span><span className="art-cross cross-two">+</span>
            <div className="identity-card civilian-card"><div className="card-topline">CIVILIAN <span>01</span></div><div className="civilian-symbol">✳</div><p>YOU KNOW<br />THE WORD.</p><div className="card-bottomline">KEEP IT TO YOURSELF. <span>↗</span></div></div>
            <div className="identity-card white-card"><div className="card-topline">TOP SECRET <span>?</span></div><AgentMark /><p>MR.<br />WHITE</p><div className="card-bottomline">NO WORD. ALL NERVE. <span>↗</span></div></div>
            <div className="suspect-stamp">EVERYONE IS<br /><strong>A SUSPECT.</strong></div>
            <span className="art-caption">THE MOST INNOCENT FACE USUALLY WINS.</span>
          </div>
        </section>
        <div className="ticker" aria-hidden="true"><span>PASS THE PHONE</span>✳<span>READ THE ROOM</span>✳<span>SELL THE BLUFF</span>✳<span>FIND MR. WHITE</span>✳<span>PASS THE PHONE</span></div>
        <section className="lobby-bottom" ref={guide} id="how-to-play" aria-label="How to play">
          <div className="rules-panel"><div className="section-heading"><p className="eyebrow">THE GAME PLAN</p><span>01 — 04</span></div><h2>Small clues. Big accusations.</h2><div className="rules-grid">{rules.map(([title, copy], i) => <div className="rule" key={title}><span className="rule-number">0{i + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></div>)}</div><p className="rule-footnote">Find every Mr. White to win. If they equal the civilians left, they win.</p></div>
          <button className="trailer-card" onClick={() => dispatch({ type: 'REPLAY_INTRO' })} aria-label="Watch the intro video"><video src="/video.mp4#t=0.1" muted playsInline preload="metadata" tabIndex={-1} /><div className="trailer-shade" /><span className="trailer-label">A LITTLE PRE-GAME DRAMA</span><span className="play-circle" aria-hidden="true">▶</span><span className="trailer-title">Meet Mr. White.<span>Watch the intro ↗</span></span></button>
        </section>
      </main>
      <div className="hero-actions lobby-dock"><Button onClick={() => dispatch({ type: 'START_SETUP' })}>Let’s play <span aria-hidden="true">↗</span></Button><button className="text-action" onClick={() => guide.current?.scrollIntoView({ behavior: 'smooth' })}>How to play <span aria-hidden="true">↘</span></button></div>
      <footer className="lobby-footer"><span>MADE FOR REAL FRIENDS. IN THE SAME ROOM.</span><span>NO ACCOUNTS. JUST ACCUSATIONS. ↗</span></footer>
    </m.div>
  )
}
