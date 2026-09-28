/** Original geometric insignia shared by the lobby and secret cards. */
export function AgentMark({ className = '' }: { className?: string }) {
  return <svg viewBox="0 0 200 200" fill="none" aria-hidden="true" className={className}>
    <path d="M56 82 70 38l30 14 30-14 14 44Z" fill="currentColor" />
    <path d="m28 88 72-15 72 15-8 13H36Z" fill="currentColor" />
    <path d="M57 113h33l10 8 10-8h33l-8 23h-24l-11-10-11 10H65Z" fill="currentColor" />
    <path d="m64 147 36 17 36-17 35 37H29Z" fill="currentColor" />
    <path d="m94 163 6 5 6-5-6 24Z" fill="var(--color-void)" />
  </svg>
}
