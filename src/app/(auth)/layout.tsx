'use client'

import type React from 'react'
import Logo from '@/components/ui/Logo'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100'>
      <div className='flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
        <div className='w-full max-w-md space-y-8'>
          {/* Logo and Branding */}
          <div className='text-center'>
            <div className='flex justify-center mb-4'>
              <Logo variant='full' size='lg' />
            </div>
            <p className='mt-2 text-sm text-gray-600'>
              Plan life's special moments with ease
            </p>
          </div>

          {/* Auth Form Container */}
          <div className='bg-white rounded-lg shadow-xl border border-gray-200 px-6 py-8 sm:px-8'>
            {children}
          </div>

          {/* Footer */}
          <div className='text-center text-xs text-gray-500'>
            <p>© 2024 BudgetByMe. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
