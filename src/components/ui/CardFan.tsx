import { m } from 'framer-motion'

/** Three hidden cards fanning out — the game's core gesture, as a hero mark. */

const CARDS = [
  { rotate: -15, x: '-58%', tone: 'dark' as const },
  { rotate: 15, x: '58%', tone: 'dark' as const },
  { rotate: -2, x: '0%', tone: 'bone' as const },
]

export function CardFan() {
  return (
    <m.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative mx-auto h-[clamp(6rem,26vw,8.5rem)] w-full max-w-[15rem]"
    >
      <m.div
        className="absolute inset-0"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {CARDS.map((card, i) => (
          <m.div
            key={i}
            initial={{ rotate: 0, x: '0%', y: 10, opacity: 0 }}
            animate={{ rotate: card.rotate, x: card.x, y: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 26,
              delay: 0.12 + i * 0.07,
            }}
            style={{ zIndex: i }}
            className={[
              'absolute left-1/2 top-1/2 -ml-[clamp(2.1rem,9vw,2.9rem)] -mt-[clamp(3rem,12.5vw,4.1rem)]',
              'h-[clamp(6rem,25vw,8.2rem)] w-[clamp(4.2rem,18vw,5.8rem)]',
              'grid place-items-center rounded-[1.1rem]',
              card.tone === 'bone'
                ? 'bg-bone text-void shadow-[0_18px_40px_-12px_rgba(0,0,0,0.9)]'
                : 'bg-surface text-smoke border border-white/8 shadow-[0_14px_30px_-16px_rgba(0,0,0,0.9)]',
            ].join(' ')}
          >
            {card.tone === 'bone' ? (
              <span className="text-[clamp(1.5rem,6vw,2rem)] leading-none font-bold">?</span>
            ) : null}
          </m.div>
        ))}
      </m.div>
    </m.div>
  )
}
