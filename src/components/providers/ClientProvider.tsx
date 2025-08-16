'use client';

import type React from 'react';
import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { EventsProvider } from '@/contexts/EventsContext';
import QueryProvider from './ReactQueryProvider';

interface ClientProviderProps {
  children: React.ReactNode;
}

export default function ClientProvider({ children }: ClientProviderProps) {
  useEffect(() => {
    // Initialize PWA elements for Capacitor
    const initializePWAElements = async () => {
      if (typeof window !== 'undefined') {
        try {
          console.log('🔧 [PWA] Initializing PWA elements...');
          const { defineCustomElements } = await import(
            '@ionic/pwa-elements/loader'
          );
          await defineCustomElements(window);
          console.log('✅ [PWA] PWA elements initialized successfully');

          // Debug: Check if camera modal element is available
          setTimeout(() => {
            const cameraModalAvailable =
              !!window.customElements.get('pwa-camera-modal');
            console.log(
              '📷 [PWA] Camera modal available:',
              cameraModalAvailable,
            );
          }, 1000);
        } catch (error) {
          console.error('❌ [PWA] Failed to initialize PWA elements:', error);
        }
      }
    };

    initializePWAElements();
  }, []);

  return (
    <QueryProvider>
      <AuthProvider>
        <EventsProvider>{children}</EventsProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
