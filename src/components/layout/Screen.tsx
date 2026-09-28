import { m } from 'framer-motion'

import { cn } from '@/utils/cn'
import { pageVariants, spring } from '@/utils/motion'
import { AgentMark } from '@/components/ui/AgentMark'

type ScreenProps = {
  /** Direction of travel: 1 moving forward, -1 going back. */
  direction?: number
  /** Small slot pinned to the top (eyebrow, round counter, back button). */
  header?: React.ReactNode
  /** The primary action, pinned above the bottom safe area. */
  action?: React.ReactNode
  /** Wider column for card grids. */
  wide?: boolean
  /** Centre the main content vertically instead of stacking from the top. */
  center?: boolean
  /** Let the main area scroll (name entry, large card grids). */
  scroll?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * The single layout every game screen uses.
 *
 *   header   — context, never competing for attention
 *   main     — one clear decision
 *   action   — one primary button, always reachable by thumb
 *
 * Portrait phone first; on desktop the same column is centred in a
 * max-width container so it still reads as a game, not a web page.
 */
export function Screen({
  direction = 1,
  header,
  action,
  wide,
  center = true,
  scroll = false,
  className,
  children,
}: ScreenProps) {
  return (
    <m.div
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={spring.screen}
      className={cn('game-screen flex w-full flex-col', scroll ? 'h-[100dvh]' : 'min-h-[100dvh]')}
    >
      <div
        className={cn(
          'game-shell pad-safe-x pad-safe-t pad-safe-b mx-auto flex min-h-0 w-full flex-1 flex-col',
          wide ? 'max-w-[38rem]' : 'max-w-[32rem]',
          className,
        )}
      >
        <div className="game-brand"><span><AgentMark /> MR. WHITE</span><span>TRUST NOBODY. ↗</span></div>
        {header ? <header className="shrink-0">{header}</header> : null}

        <main
          className={cn(
            'game-main flex min-h-0 flex-1 flex-col py-6',
            center && !scroll && 'justify-center',
            // `-mx` + `px` keeps focus rings from being clipped by the scroller
            scroll && 'overflow-y-auto overscroll-contain -mx-1 px-1',
          )}
        >
          {/* `my-auto` centres short content but collapses once it overflows —
              `justify-center` would clip the top of a long list instead. */}
          {scroll && center ? <div className="my-auto w-full">{children}</div> : children}
        </main>

        {action ? <div className="shrink-0 pt-6">{action}</div> : null}
      </div>
    </m.div>
  )
}
