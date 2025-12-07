'use client';

import { formatCurrency } from '@/lib/formatters';

export interface BudgetData {
  budgetedAmount: number;
  scheduledAmount?: number;
  spentAmount: number;
  color?: string;
}

export interface BudgetOverviewCardProps {
  data: BudgetData;
  title?: string;
  className?: string;
  showScheduled?: boolean;
  progressBarColor?: string;
}

export default function BudgetOverviewCard({
  data,
  title = 'Budget Overview',
  className = '',
  showScheduled = true,
  progressBarColor,
}: BudgetOverviewCardProps) {
  // Calculate derived values
  const remaining = data.budgetedAmount - data.spentAmount;
  const percentage =
    data.budgetedAmount > 0
      ? Math.round((data.spentAmount / data.budgetedAmount) * 100)
      : 0;

  // Determine progress bar color
  const getProgressBarColor = (): string => {
    if (progressBarColor) return progressBarColor;
    if (data.color) return data.color;
    return '#2563EB'; // default primary-600
  };

  return (
    <div className={`card ${className}`}>
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6'>
        {/* Budget Details */}
        <div className='lg:col-span-2'>
          <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4'>
            {title}
          </h3>
          <div className='space-y-2 sm:space-y-3'>
            {/* Budgeted Amount */}
            <div className='flex justify-between items-center'>
              <span className='text-sm sm:text-base text-gray-600'>
                Budgeted:
              </span>
              <span className='font-semibold text-sm sm:text-base'>
                {formatCurrency(data.budgetedAmount)}
              </span>
            </div>

            {/* Scheduled Amount (optional) */}
            {showScheduled && data.scheduledAmount !== undefined && (
              <div className='flex justify-between items-center'>
                <span className='text-sm sm:text-base text-gray-600'>
                  Scheduled:
                </span>
                <span className='font-semibold text-sm sm:text-base text-primary-600'>
                  {formatCurrency(data.scheduledAmount)}
                </span>
              </div>
            )}

            {/* Spent Amount */}
            <div className='flex justify-between items-center'>
              <span className='text-sm sm:text-base text-gray-600'>Spent:</span>
              <span className='font-semibold text-sm sm:text-base text-success-600'>
                {formatCurrency(data.spentAmount)}
              </span>
            </div>

            {/* Remaining/Over Budget */}
            <div className='flex justify-between items-center border-t pt-2 sm:pt-3'>
              <span className='text-sm sm:text-base text-gray-600'>
                {remaining >= 0 ? 'Remaining:' : 'Over budget:'}
              </span>
              <span
                className={`font-semibold text-sm sm:text-base ${
                  remaining >= 0 ? 'text-success-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(Math.abs(remaining))}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Visualization */}
        <div className='lg:col-span-2 mt-4 lg:mt-0'>
          <h4 className='text-sm font-medium text-gray-500 mb-2'>Progress</h4>
          <div className='flex items-center justify-center lg:justify-center h-16 sm:h-20'>
            <div className='text-center'>
              {/* Percentage Display */}
              <div className='text-2xl sm:text-3xl font-bold text-gray-900 mb-1'>
                {percentage}%
              </div>

              {/* Progress Bar */}
              <div className='w-24 sm:w-32 bg-gray-200 rounded-full h-2 sm:h-3'>
                <div
                  className='h-2 sm:h-3 rounded-full transition-all duration-500'
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: getProgressBarColor(),
                  }}
                />
              </div>

              {/* Progress Label */}
              <div className='text-xs text-gray-500 mt-1'>of budget used</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility function to create budget data from category or event objects
 */
export function createBudgetData(source: {
  budgetedAmount?: number;
  scheduledAmount?: number;
  spentAmount?: number;
  color?: string;
}): BudgetData {
  return {
    budgetedAmount: source.budgetedAmount ?? 0,
    scheduledAmount: source.scheduledAmount,
    spentAmount: source.spentAmount ?? 0,
    color: source.color,
  };
}
