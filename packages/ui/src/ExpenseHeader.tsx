'use client';

import { HomeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import ActionDropdown from './ActionDropdown';
import Breadcrumbs, { type BreadcrumbItem } from './Breadcrumbs';
import type { Event } from './types/Event';
import type { Expense } from './types/Expense';
import { formatDate } from './utils/formatters';
import { truncateForBreadcrumb } from './utils/textUtils';

interface ExpenseHeaderProps {
  expense: Expense;
  currentEvent: Event;
  eventId: string;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate: (href: string) => void;
}

const ExpenseHeader = React.memo<ExpenseHeaderProps>(
  ({ expense, currentEvent, eventId, onEdit, onDelete, onNavigate }) => {
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
            <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigate} />
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

            <div className='flex-shrink-0'>
              <ActionDropdown
                variant='full'
                primaryAction={{
                  label: 'Edit',
                  icon: PencilIcon,
                  onClick: onEdit,
                }}
                options={[
                  {
                    id: 'delete',
                    label: 'Delete Expense',
                    icon: TrashIcon,
                    onClick: onDelete,
                    variant: 'danger',
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </>
    );
  },
);

ExpenseHeader.displayName = 'ExpenseHeader';

export default ExpenseHeader;
