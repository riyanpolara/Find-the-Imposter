import type { AppState } from './store'
import { initialState } from './store'

const STORAGE_KEY = 'mr-white-game-v1'
const SCHEMA_VERSION = 1

type Envelope = {
  version: number
  savedAt: number
  state: AppState
}

/**
 * A refresh must never drop someone mid-handoff, but it must also never put a
 * secret back on screen unprompted. Phases that were showing private
 * information rewind to the safe gate immediately before them, so whoever
 * picks the phone up has to confirm they're the right person first.
 */
const REWIND_ON_RESTORE: Partial<Record<AppState['phase'], AppState['phase']>> = {
  // Mid-reveal: the card is already dealt, so send them back to the handoff.
  CARD_REVEAL: 'PASS_PHONE',
  // Mid-pick: the card grid itself is harmless, but the name gate isn't.
  CARD_DISTRIBUTION: 'PASS_PHONE',
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Structural check — a corrupted or stale payload must never crash the app. */
function looksLikeState(value: unknown): value is AppState {
  if (!isPlainObject(value)) return false
  if (typeof value.phase !== 'string') return false
  if (!isPlainObject(value.setup)) return false
  if (!Array.isArray((value.setup as Record<string, unknown>).names)) return false
  if (value.game !== null && !isPlainObject(value.game)) return false
  if (isPlainObject(value.game)) {
    if (!Array.isArray(value.game.players) || !Array.isArray(value.game.cards)) return false
    if (typeof value.game.secretWord !== 'string') return false
  }
  return true
}

export function loadState(): AppState | null {
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    // Private mode, disabled storage, quota errors — play on without saving.
    return null
  }
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isPlainObject(parsed)) return null
    if (parsed.version !== SCHEMA_VERSION) return null
    if (!looksLikeState(parsed.state)) return null

    const restored = parsed.state
    const rewound = REWIND_ON_RESTORE[restored.phase]

    return {
      ...initialState,
      ...restored,
      phase: rewound ?? restored.phase,
      // Never resume mid-transition.
      direction: 1,
    }
  } catch {
    clearState()
    return null
  }
}

export function saveState(state: AppState): void {
  // Nothing worth restoring before a game exists beyond the setup itself.
  try {
    const envelope: Envelope = { version: SCHEMA_VERSION, savedAt: Date.now(), state }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
  } catch {
    // Storage full or unavailable: the game still works, it just won't resume.
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nothing to do */
  }
}

export { STORAGE_KEY }
