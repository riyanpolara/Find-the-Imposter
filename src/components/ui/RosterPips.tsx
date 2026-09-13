import { m } from 'framer-motion'

import { spring } from '@/utils/motion'

/**
 * The split, at a glance: one pip per player, the last `mrWhites` of them lit
 * in vermilion. Reads faster than the numbers underneath it.
 *
 * Positions carry no information — roles aren't dealt until card selection.
 */
export function RosterPips({ total, mrWhites }: { total: number; mrWhites: number }) {
  return (
    <div className="flex max-w-[16rem] flex-wrap justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => {
        const isMrWhite = i >= total - mrWhites
        return (
          <m.span
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...spring.soft, delay: Math.min(i, 12) * 0.012 }}
            className={
              'size-2.5 rounded-full transition-colors duration-200 ' +
              (isMrWhite ? 'bg-signal' : 'bg-bone/85')
            }
          />
        )
      })}
    </div>
  )
}
