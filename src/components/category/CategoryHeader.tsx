'use client';

import {
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type React from 'react';
import ActionDropdown from '@/components/ui/ActionDropdown';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  budgetedAmount?: number;
  scheduledAmount?: number;
  spentAmount?: number;
  color?: string;
}

export interface CategoryHeaderProps {
  category: Category;
  onAddExpense: () => void;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  className?: string;
}

export default function CategoryHeader({
  category,
  onAddExpense,
  onEditCategory,
  onDeleteCategory,
  className = '',
}: CategoryHeaderProps) {
  return (
    <div className={`mb-4 sm:mb-6 ${className}`}>
      <div className='flex items-start justify-between'>
        <div className='flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0'>
          <span className='text-3xl sm:text-4xl flex-shrink-0'>
            {category.icon || '🎉'}
          </span>
          <div className='flex-1 min-w-0'>
            <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight'>
              {category.name}
            </h1>
            <p className='text-sm sm:text-base text-gray-600 mt-1'>
              {category.description ||
                'Track and manage expenses for this budget category'}
            </p>
          </div>
        </div>

        {/* Action Dropdown - Aligned with title, anchored right */}
        <div className='flex-shrink-0 ml-4'>
          <ActionDropdown
            variant='full'
            primaryAction={{
              label: 'Add Expense',
              icon: PlusIcon,
              onClick: onAddExpense,
            }}
            options={[
              {
                id: 'edit-category',
                label: 'Edit Category',
                icon: PencilIcon,
                onClick: onEditCategory,
              },
              {
                id: 'delete-category',
                label: 'Delete Category',
                icon: TrashIcon,
                onClick: onDeleteCategory,
                variant: 'danger',
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}