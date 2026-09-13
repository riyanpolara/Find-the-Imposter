import { m } from 'framer-motion'

import { spring } from '@/utils/motion'

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <m.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={spring.press}
      aria-label="Go back"
      className="text-mist hover:text-bone -ml-2 grid size-11 place-items-center rounded-full transition-colors"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
        <path
          d="M11 3.5 5.5 9l5.5 5.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </m.button>
  )
}
