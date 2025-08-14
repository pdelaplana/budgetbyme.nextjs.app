'use client'

import { useParams } from 'next/navigation'
import type React from 'react'
import { useEffect } from 'react'
import RootLayout from '@/components/layouts/RootLayout'
import { useEvents } from '@/contexts/EventsContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const params = useParams()
  const eventId = params?.id as string
  const { events } = useEvents()

  // Find the current event based on URL params
  const currentEvent = events.find((event) => event.id === eventId)

  const formatEventDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getAbbreviatedEventName = (name: string) => {
    // For very long event names, show abbreviated version on mobile
    if (name.length > 25) {
      const words = name.split(' ')
      if (words.length > 2) {
        return `${words[0]} ${words[1]}...`
      }
      return name.substring(0, 22) + '...'
    }
    return name
  }

  // Update the header slot with event information
  useEffect(() => {
    const headerSlot = document.getElementById('page-header-slot')
    if (headerSlot && currentEvent) {
      headerSlot.innerHTML = `
        <div class="flex flex-col items-center max-w-full">
          <h1 class="hidden sm:block text-base lg:text-lg font-semibold text-gray-900 truncate max-w-full text-center px-2">
            ${currentEvent.name}
          </h1>
          <h1 class="block sm:hidden text-sm font-semibold text-gray-900 truncate max-w-full text-center px-1">
            ${getAbbreviatedEventName(currentEvent.name)}
          </h1>
          <p class="text-xs sm:text-sm text-gray-500 truncate max-w-full text-center hidden sm:block">
            ${formatEventDate(currentEvent.eventDate)}
          </p>
          <p class="text-xs text-gray-500 truncate max-w-full text-center sm:hidden">
            ${new Date(currentEvent.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      `
    }

    // Cleanup function to clear header when component unmounts
    return () => {
      if (headerSlot) {
        headerSlot.innerHTML = ''
      }
    }
  }, [currentEvent])

  // Show loading state if event not found
  if (!currentEvent) {
    return (
      <RootLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading event...</p>
          </div>
        </div>
      </RootLayout>
    )
  }

  return <RootLayout>{children}</RootLayout>
}
