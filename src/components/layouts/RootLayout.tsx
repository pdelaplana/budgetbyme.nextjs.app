'use client';

import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import AddEventModal from '@/components/modals/AddEventModal';
import { useEvents } from '@/contexts/EventsContext';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const { addEvent } = useEvents();
  const pathname = usePathname();

  const handleAddEvent = (eventData: any) => {
    addEvent(eventData);
    setShowAddEventModal(false);
  };

  // Determine if we're on an account page
  const isAccountPage =
    pathname?.startsWith('/profile') || pathname?.startsWith('/settings');

  // Extract event ID from URL if on event page
  const eventIdMatch = pathname?.match(/^\/events\/([^/]+)/);
  const currentEventId = eventIdMatch?.[1];

  const getHeaderInfo = () => {
    if (isAccountPage) {
      return {
        title: 'Account Settings',
        subtitle: 'Manage your profile and preferences',
      };
    }

    // For event pages, we'll let the child layout handle the header
    return null;
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className='min-h-screen bg-slate-100'>
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onAddEventClick={() => setShowAddEventModal(true)}
        currentEventId={currentEventId}
        currentPath={pathname}
      />

      {/* Main content area */}
      <div className='flex flex-col min-h-screen'>
        {/* Top navigation bar */}
        <div className='sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200'>
          <div className='flex h-14 sm:h-16 justify-between items-center px-3 sm:px-6 lg:px-8'>
            <button
              type='button'
              className='text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-200 p-1 hover:bg-gray-100 rounded-lg'
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className='h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-200 hover:scale-110' />
            </button>

            <div className='flex-1 min-w-0 ml-2 sm:ml-4'>
              <div className='flex flex-col items-center max-w-full'>
                {headerInfo ? (
                  <>
                    {/* Account Page Header */}
                    <h1 className='hidden sm:block text-base lg:text-lg font-semibold text-gray-900 truncate max-w-full text-center px-2'>
                      {headerInfo.title}
                    </h1>
                    <h1 className='block sm:hidden text-sm font-semibold text-gray-900 truncate max-w-full text-center px-1'>
                      {headerInfo.title}
                    </h1>
                    {headerInfo.subtitle && (
                      <p className='text-xs sm:text-sm text-gray-500 truncate max-w-full text-center'>
                        {headerInfo.subtitle}
                      </p>
                    )}
                  </>
                ) : (
                  /* Event Page Header - handled by child layout */
                  <div className='w-full' id='page-header-slot'>
                    {/* This will be populated by child layouts */}
                  </div>
                )}
              </div>
            </div>

            <div className='ml-2 sm:ml-4 flex items-center'>
              <button className='bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'>
                <UserCircleIcon className='h-6 w-6 sm:h-8 sm:w-8' />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className='flex-1 overflow-y-auto'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            {children}
          </div>
        </main>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
      />
    </div>
  );
}
