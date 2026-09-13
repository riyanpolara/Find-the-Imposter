import { m } from 'framer-motion'

import { RosterPips } from './RosterPips'
import { riseItem } from '@/utils/motion'

/** Live split shown under both setup steps so the maths is never a surprise. */
export function RosterSummary({
  playerCount,
  mrWhiteCount,
}: {
  playerCount: number
  mrWhiteCount: number
}) {
  const civilians = playerCount - mrWhiteCount

  return (
    <m.div variants={riseItem} className="flex flex-col items-center gap-4">
      <RosterPips total={playerCount} mrWhites={mrWhiteCount} />
      <p className="text-mist flex items-center gap-2.5 text-[0.9375rem]">
        <span className="text-bone font-semibold tabular-nums">{civilians}</span>
        <span>{civilians === 1 ? 'Civilian' : 'Civilians'}</span>
        <span className="bg-white/15 h-3.5 w-px" />
        <span className="text-signal font-semibold tabular-nums">{mrWhiteCount}</span>
        <span>Mr. {mrWhiteCount === 1 ? 'White' : 'Whites'}</span>
      </p>
    </m.div>
  )
}
