import { createContext, useContext } from 'react'

import type { Action, AppState } from '@/game/store'

export type GameContextValue = {
  state: AppState
  dispatch: React.Dispatch<Action>
}

export const GameContext = createContext<GameContextValue | null>(null)

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}
