'use client'

import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { EventsProvider } from '@/contexts/EventsContext'

interface ClientAuthProviderProps {
  children: React.ReactNode
}

export default function ClientAuthProvider({ children }: ClientAuthProviderProps) {
  return (
    <AuthProvider>
      <EventsProvider>
        {children}
      </EventsProvider>
    </AuthProvider>
  )
}