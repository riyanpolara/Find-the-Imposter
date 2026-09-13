import { m } from 'framer-motion'

/**
 * Thin progress rail for the two pass-the-phone loops (dealing, voting).
 * Animates scaleX only — nothing here triggers layout.
 */
export function Progress({ value, total }: { value: number; total: number }) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0

  return (
    <div
      className="h-0.5 w-full overflow-hidden rounded-full bg-white/8"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <m.div
        initial={false}
        animate={{ scaleX: ratio }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        style={{ transformOrigin: 'left' }}
        className="bg-bone/70 h-full w-full"
      />
    </div>
  )
}
