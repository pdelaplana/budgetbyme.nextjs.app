'use client';

import {
  ChevronDownIcon,
  EllipsisVerticalIcon,
  HomeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { formatDate } from '@/lib/formatters';
import { truncateForBreadcrumb } from '@/lib/textUtils';
import type { Event } from '@/types/Event';
import type { Expense } from '@/types/Expense';

interface ExpenseHeaderProps {
  expense: Expense;
  currentEvent: Event;
  eventId: string;
  showActionDropdown: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActionDropdown: () => void;
  onCloseActionDropdown: () => void;
}

const ExpenseHeader = React.memo<ExpenseHeaderProps>(
  ({
    expense,
    currentEvent,
    eventId,
    showActionDropdown,
    onEdit,
    onDelete,
    onToggleActionDropdown,
    onCloseActionDropdown,
  }) => {
    // Breadcrumb items with mobile-friendly labels
    const breadcrumbItems: BreadcrumbItem[] = [
      {
        label: truncateForBreadcrumb(currentEvent.name, 15),
        href: `/events/${eventId}/dashboard`,
        icon: HomeIcon,
      },
      {
        label: truncateForBreadcrumb(expense.category.name, 12),
        href: `/events/${eventId}/category/${expense.category.id}`,
      },
      {
        label: truncateForBreadcrumb(expense.name, 18),
        current: true,
      },
    ];

    return (
      <>
        {/* Breadcrumbs */}
        <div className='mb-3 sm:mb-4 overflow-hidden'>
          <div className='w-full' style={{ overflowX: 'hidden' }}>
            <Breadcrumbs items={breadcrumbItems} />
          </div>
        </div>

        {/* Header */}
        <div className='mb-4 sm:mb-6'>
          <div className='flex items-start justify-between space-x-4'>
            <div className='flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0'>
              <span className='text-3xl sm:text-4xl flex-shrink-0'>
                {expense.category.icon}
              </span>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-3'>
                  <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight'>
                    {expense.name}
                  </h1>
                </div>
                <p className='text-sm sm:text-base text-gray-600 mt-1'>
                  {expense.category.name} • {formatDate(expense.date)}
                </p>
              </div>
            </div>

            {/* Mobile Action Dropdown - Inline with title, anchored right */}
            <div className='flex-shrink-0 sm:hidden'>
              <div className='relative'>
                <button
                  type='button'
                  onClick={onToggleActionDropdown}
                  className='btn-secondary flex items-center justify-center px-3 py-2 min-w-[44px] min-h-[44px]'
                  aria-label='Open action menu'
                >
                  <EllipsisVerticalIcon className='h-5 w-5' />
                </button>

                {/* Mobile Dropdown Menu */}
                {showActionDropdown && (
                  <div className='absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-50 origin-top-right'>
                    <div className='py-1'>
                      <button
                        type='button'
                        onClick={() => {
                          onEdit();
                          onCloseActionDropdown();
                        }}
                        className='flex items-center gap-3 w-full px-4 py-4 text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 min-h-[48px]'
                      >
                        <PencilIcon className='h-5 w-5 flex-shrink-0' />
                        <span>Edit Expense</span>
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          onDelete();
                          onCloseActionDropdown();
                        }}
                        className='flex items-center gap-3 w-full px-4 py-4 text-base text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors duration-200 min-h-[48px]'
                      >
                        <TrashIcon className='h-5 w-5 flex-shrink-0' />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Mobile Dropdown Backdrop */}
                {showActionDropdown && (
                  <button
                    type='button'
                    className='fixed inset-0 z-40 cursor-default'
                    onClick={onCloseActionDropdown}
                    aria-label='Close menu'
                  />
                )}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className='hidden sm:flex relative flex-shrink-0 overflow-visible'>
              <div className='flex'>
                <button
                  type='button'
                  onClick={onEdit}
                  className='btn-secondary flex items-center rounded-r-none border-r-0'
                >
                  <PencilIcon className='h-4 w-4 mr-2' />
                  Edit
                </button>
                <button
                  type='button'
                  onClick={onToggleActionDropdown}
                  className='btn-secondary px-2 rounded-l-none border-l border-gray-300 hover:border-gray-400'
                  aria-label='More actions'
                >
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 ${showActionDropdown ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              {/* Desktop Dropdown Menu */}
              {showActionDropdown && (
                <div className='absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 origin-top-right transform'>
                  <div className='py-1'>
                    <button
                      type='button'
                      onClick={() => {
                        onDelete();
                        onCloseActionDropdown();
                      }}
                      className='flex items-center gap-3 w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors duration-200'
                    >
                      <TrashIcon className='h-4 w-4 flex-shrink-0' />
                      <span>Delete Expense</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Desktop Dropdown Backdrop */}
              {showActionDropdown && (
                <button
                  type='button'
                  className='fixed inset-0 z-40 bg-transparent border-none p-0 cursor-default'
                  onClick={onCloseActionDropdown}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      onCloseActionDropdown();
                    }
                  }}
                  aria-label='Close dropdown menu'
                />
              )}
            </div>
          </div>
        </div>
      </>
    );
  },
);

ExpenseHeader.displayName = 'ExpenseHeader';

export default ExpenseHeader;
