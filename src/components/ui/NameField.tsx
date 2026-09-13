import { m } from 'framer-motion'

import type { NameIssue } from '@/game/setupRules'
import { NAME_MAX_LENGTH } from '@/game/setupRules'
import { cn } from '@/utils/cn'
import { spring } from '@/utils/motion'

type NameFieldProps = {
  index: number
  value: string
  issue: NameIssue | null
  /** Issues stay silent until the player tries to continue. */
  showIssue: boolean
  onChange: (value: string) => void
  onEnter: () => void
  inputRef?: (el: HTMLInputElement | null) => void
}

export function NameField({
  index,
  value,
  issue,
  showIssue,
  onChange,
  onEnter,
  inputRef,
}: NameFieldProps) {
  const invalid = showIssue && issue !== null

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring.soft, delay: Math.min(index, 10) * 0.03 }}
      className="relative"
    >
      <label className="sr-only" htmlFor={`player-${index}`}>
        Player {index + 1} name
      </label>

      <div
        className={cn(
          'flex items-center gap-3 rounded-2xl border pl-3.5 pr-2 transition-colors duration-150',
          invalid
            ? 'border-signal/70 bg-signal/8'
            : 'border-white/8 bg-surface focus-within:border-white/22',
        )}
      >
        <span
          className={cn(
            'grid size-7 shrink-0 place-items-center rounded-full text-[0.75rem] font-semibold tabular-nums',
            invalid ? 'bg-signal/20 text-signal' : 'bg-white/6 text-smoke',
          )}
        >
          {index + 1}
        </span>

        <input
          id={`player-${index}`}
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onEnter()
            }
          }}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="next"
          maxLength={NAME_MAX_LENGTH}
          placeholder={`Player ${index + 1}`}
          aria-invalid={invalid || undefined}
          className="text-bone placeholder:text-smoke/70 min-h-13 w-full min-w-0 bg-transparent text-[1rem] outline-none"
        />
      </div>

      {invalid && (
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-signal mt-1 pl-3.5 text-[0.75rem]"
        >
          {issue === 'EMPTY' ? 'Needs a name' : 'Someone else already has this name'}
        </m.p>
      )}
    </m.div>
  )
}
