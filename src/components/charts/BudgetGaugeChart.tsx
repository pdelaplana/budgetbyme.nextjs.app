'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatters';

interface BudgetGaugeChartProps {
  totalBudget: number;
  totalSpent: number;
  percentage: number;
  status: 'under-budget' | 'on-track' | 'approaching-limit' | 'over-budget';
}

export default function BudgetGaugeChart({
  totalBudget,
  totalSpent,
  percentage,
  status,
}: BudgetGaugeChartProps) {
  const radius = 85;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under-budget':
        return '#10b981'; // success-green (lighter mint)
      case 'on-track':
        return '#059669'; // primary-mint
      case 'approaching-limit':
        return '#D97706'; // warning-amber
      case 'over-budget':
        return '#DC2626'; // danger-red
      default:
        return '#059669';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'under-budget':
        return 'Under Budget';
      case 'on-track':
        return 'On Track';
      case 'approaching-limit':
        return 'Approaching Limit';
      case 'over-budget':
        return 'Over Budget';
      default:
        return 'On Track';
    }
  };


  const remaining = totalBudget - totalSpent;

  return (
    <div className='flex flex-col items-center py-2 sm:py-4'>
      {/* SVG Gauge Chart - Responsive */}
      <div className='relative mb-4 sm:mb-6 chart-enter w-full flex justify-center'>
        <svg
          height={radius * 2}
          width={radius * 2}
          className='transform -rotate-90 max-w-full h-auto'
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          role='img'
          aria-labelledby='gauge-title'
          aria-describedby='gauge-description'
        >
          <title id='gauge-title'>Budget Health Gauge</title>
          <desc id='gauge-description'>
            You have spent {formatCurrency(totalSpent)} of your{' '}
            {formatCurrency(totalBudget)} budget, which is {percentage}% of your
            total. Status: {getStatusText(status)}.
          </desc>

          {/* Background circle */}
          <circle
            stroke='#E5E7EB'
            fill='transparent'
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Progress circle */}
          <circle
            stroke={getStatusColor(status)}
            fill='transparent'
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap='round'
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className='transition-all duration-1000 ease-out'
          />
        </svg>

        {/* Center content - Responsive */}
        <div className='absolute inset-0 flex flex-col items-center justify-center'>
          <div className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1'>
            {percentage}%
          </div>
          <div
            className='text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-center px-2'
            style={{ color: getStatusColor(status) }}
          >
            {getStatusText(status)}
          </div>
        </div>
      </div>

      {/* Summary Information - Responsive */}
      <div className='w-full space-y-2 sm:space-y-3'>
        <div className='flex justify-between items-center'>
          <span className='text-xs sm:text-sm text-gray-600'>
            Total Budget:
          </span>
          <span className='font-semibold text-gray-900 text-sm sm:text-base'>
            {formatCurrency(totalBudget)}
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-xs sm:text-sm text-gray-600'>
            Amount Spent:
          </span>
          <span className='font-semibold text-gray-900 text-sm sm:text-base'>
            {formatCurrency(totalSpent)}
          </span>
        </div>

        <div className='flex justify-between items-center pt-2 border-t border-gray-200'>
          <span className='text-xs sm:text-sm text-gray-600'>Remaining:</span>
          <span
            className={`font-semibold text-sm sm:text-base ${
              remaining >= 0 ? 'text-success-600' : 'text-danger-600'
            }`}
          >
            {formatCurrency(Math.abs(remaining))}
            {remaining < 0 && ' over'}
          </span>
        </div>
      </div>

      {/* Status Legend - Responsive */}
      <div className='w-full mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs'>
          <div className='flex items-center'>
            <div className='w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-success-600 mr-2 flex-shrink-0' />
            <span className='text-gray-600 text-xs'>Under Budget (0-80%)</span>
          </div>
          <div className='flex items-center'>
            <div className='w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary-600 mr-2 flex-shrink-0' />
            <span className='text-gray-600 text-xs'>On Track (80-100%)</span>
          </div>
          <div className='flex items-center'>
            <div className='w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-warning-600 mr-2 flex-shrink-0' />
            <span className='text-gray-600 text-xs'>
              Approaching (100-110%)
            </span>
          </div>
          <div className='flex items-center'>
            <div className='w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-danger-600 mr-2 flex-shrink-0' />
            <span className='text-gray-600 text-xs'>Over Budget (110%+)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
