import { m, type HTMLMotionProps } from 'framer-motion'

import { cn } from '@/utils/cn'
import { spring } from '@/utils/motion'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'lg' | 'md'

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant
  size?: Size
  /** Stretch to the container width. Default for `lg`. */
  block?: boolean
  children: React.ReactNode
}

const VARIANTS: Record<Variant, string> = {
  // Bone-on-black: the single unmistakable primary action on every screen.
  primary: 'bg-bone text-void shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset]',
  secondary: 'bg-surface-2 text-bone border border-white/8',
  ghost: 'bg-transparent text-mist hover:text-bone',
  danger: 'bg-signal text-bone',
}

const SIZES: Record<Size, string> = {
  // 56px / 48px tall — comfortably above the 44px touch-target floor.
  lg: 'min-h-14 px-7 text-[0.9375rem] tracking-[0.14em]',
  md: 'min-h-12 px-5 text-[0.8125rem] tracking-[0.12em]',
}

export function Button({
  variant = 'primary',
  size = 'lg',
  block,
  className,
  children,
  ...props
}: ButtonProps) {
  const isBlock = block ?? size === 'lg'

  return (
    <m.button
      type="button"
      whileTap={props.disabled ? undefined : { scale: 0.975 }}
      transition={spring.press}
      className={cn(
        'inline-flex select-none items-center justify-center rounded-2xl font-semibold uppercase',
        'transition-colors duration-150 outline-none',
        'disabled:pointer-events-none disabled:opacity-35',
        isBlock && 'w-full',
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </m.button>
  )
}
