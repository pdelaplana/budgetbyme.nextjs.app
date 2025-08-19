'use client';

import type React from 'react';
import { EventDetailsProvider } from '@/contexts/EventDetailsContext';

interface EventDetailLayoutProps {
  children: React.ReactNode;
}

export default function EventDetailLayout({ children }: EventDetailLayoutProps) {
  return (
    <EventDetailsProvider>
      {children}
    </EventDetailsProvider>
  );
}