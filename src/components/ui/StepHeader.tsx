import { BackButton } from './BackButton'

/** Back control plus a quiet "where am I" indicator for the setup flow. */
export function StepHeader({
  onBack,
  step,
  total,
}: {
  onBack: () => void
  step: number
  total: number
}) {
  return (
    <div className="flex items-center justify-between">
      <BackButton onClick={onBack} />
      <div className="flex items-center gap-1.5" aria-label={`Step ${step} of ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={
              'h-1 rounded-full transition-all duration-300 ' +
              (i < step ? 'bg-bone w-5' : 'bg-white/15 w-2')
            }
          />
        ))}
      </div>
    </div>
  )
}
