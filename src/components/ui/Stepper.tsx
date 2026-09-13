import { AnimatePresence, m, type Variants } from 'framer-motion'
import { useState } from 'react'

import { cn } from '@/utils/cn'
import { spring } from '@/utils/motion'

/** `custom` carries the direction the value moved, so the digit slides that way. */
const digitVariants: Variants = {
  initial: (dir: number) => ({ y: dir * 44, opacity: 0 }),
  animate: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir * -44, opacity: 0 }),
}

type StepperProps = {
  value: number
  min: number
  max: number
  /** Receives +1 / -1. Deltas, not absolutes, so fast taps can't be dropped. */
  onStep: (delta: number) => void
  label: string
}

/**
 * Big touch-first counter. The digit slides in the direction you pushed it,
 * which makes rapid tapping legible instead of a blur.
 */
export function Stepper({ value, min, max, onStep, label }: StepperProps) {
  // State, not a ref: the digit's slide direction is rendered output, and both
  // updates batch into the same render as the new value.
  const [direction, setDirection] = useState(1)

  const step = (delta: number) => {
    setDirection(delta)
    onStep(delta)
  }

  return (
    <div className="flex items-center justify-center gap-5">
      <StepButton
        sign="minus"
        label={`Decrease ${label}`}
        disabled={value <= min}
        onClick={() => step(-1)}
      />

      <div className="relative h-[4.5rem] w-[4.5rem] overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <m.span
            key={value}
            custom={direction}
            variants={digitVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={spring.soft}
            className="text-bone absolute inset-0 flex items-center justify-center text-[3.25rem] leading-none font-bold tabular-nums"
          >
            {value}
          </m.span>
        </AnimatePresence>
      </div>

      <StepButton
        sign="plus"
        label={`Increase ${label}`}
        disabled={value >= max}
        onClick={() => step(1)}
      />
    </div>
  )
}

function StepButton({
  sign,
  label,
  disabled,
  onClick,
}: {
  sign: 'plus' | 'minus'
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <m.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={spring.press}
      className={cn(
        'grid size-14 shrink-0 place-items-center rounded-full border transition-colors duration-150',
        disabled
          ? 'border-white/5 text-smoke/40'
          : 'border-white/12 bg-surface text-bone active:bg-surface-2',
      )}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
        <path d="M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {sign === 'plus' && (
          <path d="M10 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </m.button>
  )
}
