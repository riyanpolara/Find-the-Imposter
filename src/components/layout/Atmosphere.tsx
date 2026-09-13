/**
 * Fixed background for the whole app: a violet and a vermilion light source
 * drifting behind everything, plus fine grain. Rendered once, never unmounts,
 * so screen transitions stay cheap.
 *
 * Each light is a full-bleed layer with the gradient positioned inside it, so
 * the bright core always lands on screen regardless of viewport shape, and the
 * drift animation only ever moves a composited transform.
 */
export function Atmosphere() {
  return (
    <div
      aria-hidden
      className="bg-void grain pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="atmo-a absolute inset-0"
        style={{
          background:
            'radial-gradient(66% 38% at 50% 0%, color-mix(in oklab, var(--color-halo) 30%, transparent), transparent 68%)',
        }}
      />
      <div
        className="atmo-b absolute inset-0"
        style={{
          background:
            'radial-gradient(56% 34% at 92% 100%, color-mix(in oklab, var(--color-signal) 24%, transparent), transparent 66%)',
        }}
      />
      {/* Vignette pulls focus to the centre without flattening the glows */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(125% 88% at 50% 44%, transparent 28%, color-mix(in oklab, var(--color-void) 80%, transparent) 100%)',
        }}
      />
    </div>
  )
}
