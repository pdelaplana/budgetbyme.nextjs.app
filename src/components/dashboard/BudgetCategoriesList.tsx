'use client';

import { ChevronRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import type { BudgetCategory } from '@/types/BudgetCategory';

interface BudgetCategoriesListProps {
  categories: BudgetCategory[];
  onCategoryClick?: (categoryId: string) => void;
  onCreateCategory?: () => void;
}

export default function BudgetCategoriesList({
  categories,
  onCategoryClick,
  onCreateCategory,
}: BudgetCategoriesListProps) {
  const getCategoryIcon = (name: string) => {
    const icons: Record<string, string> = {
      'Venue & Reception': '🏛️',
      'Catering & Beverages': '🍰',
      'Photography & Video': '📸',
      Attire: '👗',
      'Flowers & Decorations': '💐',
      'Music & Entertainment': '🎵',
    };
    return icons[name] || '🎉';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage <= 80) return 'success-600';
    if (percentage <= 95) return 'primary-600';
    if (percentage <= 100) return 'warning-600';
    return 'danger-600';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage <= 80) return 'success-100';
    if (percentage <= 95) return 'primary-100';
    if (percentage <= 100) return 'warning-100';
    return 'danger-100';
  };

  const handleCategoryClick = (category: BudgetCategory) => {
    if (onCategoryClick) {
      onCategoryClick(category.id);
    }
  };

  return (
    <div className='space-y-3 sm:space-y-4'>
      {categories.map((category) => {
        // Calculate values from BudgetCategory properties with safety checks
        const budgeted = category.budgetedAmount ?? 0;
        const spent = category.spentAmount ?? 0;
        const percentage =
          budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0;
        const remaining = budgeted - spent;

        const progressColor = getProgressColor(percentage);
        const progressBgColor = getProgressBgColor(percentage);

        return (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className='group p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer'
          >
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
              {/* Category Info */}
              <div className='flex items-center flex-1 min-w-0'>
                <span className='text-lg sm:text-2xl mr-3 sm:mr-4 flex-shrink-0'>
                  {category.icon || '🎉'}
                </span>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='text-sm sm:text-base font-semibold text-gray-900 truncate'>
                      {category.name}
                    </h3>
                    <ChevronRightIcon className='h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 ml-2' />
                  </div>

                  {/* Budget vs Spent - Responsive */}
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3'>
                    <div className='text-xs sm:text-sm text-gray-600 mb-1 sm:mb-0'>
                      <span className='font-medium text-gray-900'>
                        {formatCurrency(spent)}
                      </span>
                      {' of '}
                      <span className='font-medium text-gray-700'>
                        {formatCurrency(budgeted)}
                      </span>
                    </div>
                    <div className='text-xs sm:text-sm font-medium text-gray-900 self-start sm:self-auto'>
                      {percentage}%
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className='w-full'>
                    <div className={`w-full bg-gray-200 rounded-full h-2`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-500 bg-${progressColor}`}
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      />
                    </div>

                    {/* Remaining Amount */}
                    <div className='mt-2 flex justify-between items-center'>
                      <span className='text-xs text-gray-500'>
                        {remaining >= 0 ? 'Remaining:' : 'Over budget:'}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          remaining >= 0
                            ? 'text-success-600'
                            : 'text-danger-600'
                        }`}
                      >
                        {formatCurrency(Math.abs(remaining))}
                        {remaining < 0 && ' over'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add Category Button */}
      {onCreateCategory && (
        <div
          onClick={onCreateCategory}
          className='group p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 cursor-pointer'
        >
          <div className='flex items-center justify-center'>
            <div className='flex items-center space-x-3 text-gray-500 group-hover:text-primary-600'>
              <div className='flex-shrink-0'>
                <PlusIcon className='h-6 w-6' />
              </div>
              <div className='text-center'>
                <p className='text-sm font-medium'>Add New Category</p>
                <p className='text-xs text-gray-400 group-hover:text-primary-500'>
                  Create a budget category for your event
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className='mt-6 pt-4 border-t border-gray-200'>
        <div className='flex justify-between items-center'>
          <span className='text-body font-medium text-gray-700'>
            Total Progress:
          </span>
          <div className='text-right'>
            <div className='text-body font-semibold text-gray-900'>
              {formatCurrency(
                categories.reduce(
                  (sum, cat) => sum + (cat.spentAmount ?? 0),
                  0,
                ),
              )}
              {' of '}
              {formatCurrency(
                categories.reduce(
                  (sum, cat) => sum + (cat.budgetedAmount ?? 0),
                  0,
                ),
              )}
            </div>
            <div className='text-body-sm text-gray-600'>
              {(() => {
                const totalSpent = categories.reduce(
                  (sum, cat) => sum + (cat.spentAmount ?? 0),
                  0,
                );
                const totalBudgeted = categories.reduce(
                  (sum, cat) => sum + (cat.budgetedAmount ?? 0),
                  0,
                );
                return totalBudgeted > 0
                  ? Math.round((totalSpent / totalBudgeted) * 100)
                  : 0;
              })()}% of total budget used
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
