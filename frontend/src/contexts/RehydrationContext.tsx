'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type RehydrationContextValue = {
  rehydrated: boolean
  setRehydrated: () => void
}

const RehydrationContext = createContext<RehydrationContextValue | null>(null)

export function RehydrationProvider({ children }: { children: ReactNode }) {
  const [rehydrated, setRehydratedState] = useState(false)
  const setRehydrated = useCallback(() => setRehydratedState(true), [])
  return (
    <RehydrationContext.Provider value={{ rehydrated, setRehydrated }}>
      {children}
    </RehydrationContext.Provider>
  )
}

export function useRehydrated() {
  const ctx = useContext(RehydrationContext)
  return ctx?.rehydrated ?? false
}

export function useSetRehydrated() {
  const ctx = useContext(RehydrationContext)
  return ctx?.setRehydrated ?? (() => {})
}
