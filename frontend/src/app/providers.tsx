'use client'

import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";
import { persistor, store } from '@/store';
import { RehydrationProvider, useSetRehydrated } from '@/contexts/RehydrationContext';

function RehydrationListener({ persistor }: { persistor: ReturnType<typeof import('redux-persist').persistStore> }) {
  const setRehydrated = useSetRehydrated()
  useEffect(() => {
    if (persistor.getState().bootstrapped) {
      setRehydrated()
      return
    }
    const unsub = persistor.subscribe(() => {
      if (persistor.getState().bootstrapped) setRehydrated()
    })
    return () => { unsub() }
  }, [persistor, setRehydrated])
  return null
}

function PersistGateWithRehydration({ children }: { children: React.ReactNode }) {
  return (
    <PersistGate loading={null} persistor={persistor}>
      <>
        <RehydrationListener persistor={persistor} />
        {children}
        <Toaster position="top-right" />
      </>
    </PersistGate>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider store={store}>
        <RehydrationProvider>
          <PersistGateWithRehydration>
            {children}
          </PersistGateWithRehydration>
        </RehydrationProvider>
      </ReduxProvider>
    </QueryClientProvider>
  )
}
