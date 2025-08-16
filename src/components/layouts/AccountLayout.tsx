'use client';

import type React from 'react';
import RootLayout from './RootLayout';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <RootLayout>
      <div className='max-w-4xl mx-auto'>{children}</div>
    </RootLayout>
  );
}
