'use client';

import { PlusIcon } from '@heroicons/react/24/outline';

export interface EmptyExpensesStateProps {
  onAddExpense: () => void;
  categoryName?: string;
  customMessage?: string;
  customIcon?: string;
  customButtonText?: string;
  className?: string;
}

export default function EmptyExpensesState({
  onAddExpense,
  categoryName,
  customMessage,
  customIcon = '💸',
  customButtonText = 'Add First Expense',
  className = '',
}: EmptyExpensesStateProps) {
  const defaultMessage = categoryName
    ? `Start by adding your first expense to ${categoryName}`
    : 'Start by adding your first expense to this category';

  const message = customMessage || defaultMessage;

  return (
    <div className={`text-center py-8 sm:py-12 ${className}`}>
      <div className='text-gray-400 mb-4'>
        <div className='text-4xl sm:text-6xl mb-3 sm:mb-4'>{customIcon}</div>
        <h3 className='text-lg sm:text-xl font-medium text-gray-600 mb-2'>
          No expenses yet
        </h3>
        <p className='text-sm sm:text-base text-gray-500 px-4'>
          {message}
        </p>
      </div>
      <div className='flex justify-center'>
        <button
          type='button'
          onClick={onAddExpense}
          className='btn-primary w-full sm:w-auto sm:min-w-[180px] flex items-center justify-center'
        >
          <PlusIcon className='h-4 w-4 mr-2 flex-shrink-0' />
          <span>{customButtonText}</span>
        </button>
      </div>
    </div>
  );
}