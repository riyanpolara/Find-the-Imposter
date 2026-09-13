import { m } from 'framer-motion'

import { riseItem } from '@/utils/motion'

/**
 * The brand lockup. Two stacked lines of tight display caps so it stays
 * enormous at 320px without wrapping unpredictably.
 */
export function Wordmark() {
  return (
    <m.h1
      variants={riseItem}
      className="text-wordmark text-bone flex flex-col leading-none"
    >
      <span className="sr-only">Mr. White</span>
      <span aria-hidden className="block">
        MR<span className="text-signal">.</span>
      </span>
      <span aria-hidden className="block">WHITE</span>
    </m.h1>
  )
}
