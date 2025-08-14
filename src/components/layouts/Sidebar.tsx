'use client'

import {
  ArrowRightOnRectangleIcon,
  PlusIcon,
  UserCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import React from 'react'
import Logo from '@/components/ui/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { useEvents } from '@/contexts/EventsContext'
import { getEventIcon, getEventStatusColor } from '@/lib/mockData/events'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  onAddEventClick: () => void
  currentEventId?: string
  currentPath?: string | null
}

const navigation = [
  {
    name: 'Your Account',
    href: '/profile',
    icon: UserCircleIcon,
    current: false,
  },
]

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  onAddEventClick,
  currentEventId,
  currentPath,
}: SidebarProps) {
  const { events } = useEvents()
  const { signOut } = useAuth()

  const handleEventSelect = (event: any) => {
    // Navigate to the event dashboard using the new route structure
    window.location.href = `/events/${event.id}/dashboard`
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/signin'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <>
      {/* Sidebar overlay with slideout animation */}
      <div
        className={`fixed inset-0 flex z-40 transition-opacity duration-300 ease-in-out ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-gray-600 transition-opacity duration-300 ease-in-out ${
            sidebarOpen ? 'bg-opacity-75' : 'bg-opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar panel */}
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close button */}
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className={`ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-opacity duration-300 ${
                sidebarOpen ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>
    </>
  )

  function SidebarContent() {
    return (
      <div className="flex flex-col h-full border-r border-gray-200 bg-white">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 border-b border-gray-200">
          {/* Logo */}
          <div className="flex items-center px-6 py-4">
            <Logo variant="full" size="md" />
          </div>

          {/* Events Header */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-50">
            <h3 className="text-body font-semibold text-gray-900">
              Your Events
            </h3>
            <button
              onClick={onAddEventClick}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Add new event"
            >
              <PlusIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
          </div>
        </div>

        {/* Scrollable Events List */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <div className="space-y-2">
            {events.map((event) => {
              const isActive = currentEventId === event.id
              const statusColor = getEventStatusColor(event.status)

              return (
                <button
                  key={event.id}
                  onClick={() => handleEventSelect(event)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] group ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 shadow-md border border-primary-200 scale-[1.02]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md border border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 text-xl">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isActive ? 'text-primary-900' : 'text-gray-900'
                        }`}
                      >
                        {event.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500 truncate">
                          {new Date(event.eventDate).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            },
                          )}
                        </p>
                        <div
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} ${statusColor.border} border`}
                        >
                          {event.spentPercentage}%
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Budget Progress</span>
                          <span>
                            ${event.totalSpent.toLocaleString()} / $
                            {event.totalBudget.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              isActive ? 'bg-primary-600' : 'bg-gray-400'
                            }`}
                            style={{
                              width: `${Math.min(event.spentPercentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
          <nav className="px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isAccountPage =
                currentPath?.startsWith('/profile') ||
                currentPath?.startsWith('/settings')
              const isActive = isAccountPage && item.href === '/profile'

              return (
                <div key={item.name} className="relative">
                  <a
                    href={item.href}
                    className={`group flex items-center justify-between px-4 py-3 text-body-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 shadow-sm border border-primary-200'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive
                            ? 'text-primary-600'
                            : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </div>

                    {/* Sign Out Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleSignOut()
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded transition-all duration-200"
                      title="Sign out"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  </a>
                </div>
              )
            })}
          </nav>
        </div>
      </div>
    )
  }
}
