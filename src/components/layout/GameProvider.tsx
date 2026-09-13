import { useEffect, useMemo, useReducer, useRef } from 'react'

import { loadState, saveState } from '@/game/persistence'
import { type AppState, initialState, reducer } from '@/game/store'
import { GameContext } from '@/hooks/useGame'

/** Read storage once, before the first paint, so there is no restore flicker. */
function init(): AppState {
  return loadState() ?? initialState
}

/**
 * Owns the single reducer that drives the whole app, and mirrors every state
 * change into localStorage so a refresh mid-game picks up where it left off.
 */
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)
  const first = useRef(true)

  useEffect(() => {
    // Skip the write on mount: it would only rewrite what we just read.
    if (first.current) {
      first.current = false
      return
    }
    saveState(state)
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
