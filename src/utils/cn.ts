/** Tiny conditional-class joiner. No dependency needed for this scale. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}
