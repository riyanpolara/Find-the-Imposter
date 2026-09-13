import { m } from 'framer-motion'

import type { Role } from '@/types/game'
import { duration } from '@/utils/motion'

type RevealCardProps = {
  role: Role
  word: string
  category: string
  revealed: boolean
  onReveal: () => void
}

/**
 * The moment the game turns on. A real 3D flip: the face-down back and the
 * role face are two sides of one card, so nothing can be glimpsed early.
 *
 * Civilians get a clean, calm reveal. Mr. White gets a harder one — vermilion,
 * a snap of scale, and a glow that arrives after the flip has landed.
 */
export function RevealCard({ role, word, category, revealed, onReveal }: RevealCardProps) {
  const isMrWhite = role === 'MR_WHITE'

  return (
    <div style={{ perspective: '1400px' }} className="mx-auto w-[min(68vw,16rem)]">
      <m.button
        type="button"
        onClick={revealed ? undefined : onReveal}
        aria-label={revealed ? 'Your card' : 'Tap to reveal your card'}
        disabled={revealed}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: duration.reveal, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative block aspect-[3/4] w-full disabled:cursor-default"
      >
        {/* Face down */}
        <m.span
          style={{ backfaceVisibility: 'hidden' }}
          animate={revealed ? undefined : { scale: [1, 1.02, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="bg-surface absolute inset-0 grid place-items-center rounded-[1.75rem] border border-white/10 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.95)]"
        >
          <span className="text-smoke text-[2.5rem] leading-none font-bold">?</span>
        </m.span>

        {/* Face up */}
        <span
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className={
            'absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[1.75rem] px-4 text-center ' +
            (isMrWhite
              ? 'bg-surface border-signal/45 text-bone border-2 shadow-[0_24px_60px_-22px_rgba(255,68,51,0.5)]'
              : 'bg-bone text-void shadow-[0_24px_50px_-22px_rgba(0,0,0,0.9)]')
          }
        >
          {revealed &&
            (isMrWhite ? <MrWhiteFace /> : <CivilianFace word={word} category={category} />)}
        </span>
      </m.button>
    </div>
  )
}

function CivilianFace({ word, category }: { word: string; category: string }) {
  return (
    <>
      <m.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.25 }}
        className="text-label text-void/45 uppercase"
      >
        {category}
      </m.span>
      <m.span
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.32, type: 'spring', stiffness: 380, damping: 24 }}
        className="text-[clamp(1.5rem,7vw,2.125rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance"
      >
        {word}
      </m.span>
      <m.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.46, duration: 0.25 }}
        className="text-void/50 text-[0.8125rem]"
      >
        Remember it.
      </m.span>
    </>
  )
}

function MrWhiteFace() {
  return (
    <>
      {/* Arrives after the flip lands, so the hit is felt rather than seen coming */}
      <m.span
        aria-hidden
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0.85, 0.4], scale: 1.15 }}
        transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklab, var(--color-signal) 34%, transparent), transparent 72%)',
        }}
      />
      <m.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.2 }}
        className="text-label text-signal relative uppercase"
      >
        You are
      </m.span>
      <m.span
        initial={{ opacity: 0, scale: 1.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.32, type: 'spring', stiffness: 300, damping: 18 }}
        className="text-bone relative text-[clamp(1.625rem,8vw,2.25rem)] leading-[0.95] font-bold tracking-[-0.035em]"
      >
        MR.
        <br />
        WHITE
      </m.span>
      <m.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.52, duration: 0.25 }}
        className="text-mist relative max-w-[10rem] text-[0.8125rem] leading-snug"
      >
        You don&rsquo;t know the word. Work it out from the clues.
      </m.span>
    </>
  )
}
