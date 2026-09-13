import { m } from 'framer-motion'

import { cn } from '@/utils/cn'
import { spring } from '@/utils/motion'

type HiddenCardProps = {
  index: number
  taken: boolean
  onSelect: () => void
}

/**
 * One face-down card in the selection grid.
 *
 * Taken cards stay in place as empty slots so the grid never reflows under the
 * player's thumb mid-choice. They carry no hint about the role that left.
 */
export function HiddenCard({ index, taken, onSelect }: HiddenCardProps) {
  if (taken) {
    return (
      <div
        aria-hidden
        className="aspect-[3/4] rounded-2xl border border-dashed border-white/6"
      />
    )
  }

  return (
    <m.button
      type="button"
      onClick={onSelect}
      aria-label={`Take card ${index + 1}`}
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring.soft, delay: Math.min(index, 12) * 0.025 }}
      whileTap={{ scale: 0.94 }}
      className={cn(
        'group bg-surface relative grid aspect-[3/4] place-items-center rounded-2xl',
        'border border-white/10 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.9)]',
        'transition-colors duration-150 hover:border-white/20 active:border-white/25',
      )}
    >
      <span className="text-smoke group-hover:text-mist text-[1.375rem] leading-none font-bold transition-colors duration-150">
        ?
      </span>
    </m.button>
  )
}
