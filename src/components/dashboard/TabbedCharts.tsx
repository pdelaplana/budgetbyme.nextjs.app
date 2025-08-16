'use client';

import {
  CalendarIcon,
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import BudgetGaugeChart from '@/components/charts/BudgetGaugeChart';
import CategoryBreakdownChart from '@/components/charts/CategoryBreakdownChart';
import PaymentTimelineChart from '@/components/charts/PaymentTimelineChart';
import QuickStatsChart from '@/components/charts/QuickStatsChart';

interface CategoryData {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  percentage: number;
  color: string;
}

interface TimelineDataPoint {
  date: string;
  budgeted: number;
  actual: number;
}

interface TabbedChartsProps {
  budgetData: {
    totalBudget: number;
    totalSpent: number;
    percentage: number;
    status: 'under-budget' | 'on-track' | 'approaching-limit' | 'over-budget';
  };
  timelineData: TimelineDataPoint[];
  categoryData: CategoryData[];
  quickStatsData: {
    totalBudget: number;
    totalSpent: number;
    categories: number;
    paymentsDue: number;
    eventDate: string;
  };
}

export default function TabbedCharts({
  budgetData,
  timelineData,
  categoryData,
  quickStatsData,
}: TabbedChartsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 0,
      name: 'Budget Health',
      icon: ChartBarIcon,
      description: 'Overall budget status',
    },
    {
      id: 1,
      name: 'Payment Timeline',
      icon: CalendarIcon,
      description: 'Spending over time',
    },
    {
      id: 2,
      name: 'Categories',
      icon: ChartPieIcon,
      description: 'Budget breakdown',
    },
    {
      id: 3,
      name: 'Quick Stats',
      icon: PresentationChartLineIcon,
      description: 'Key metrics',
    },
  ];

  const renderChart = () => {
    switch (activeTab) {
      case 0:
        return (
          <BudgetGaugeChart
            totalBudget={budgetData.totalBudget}
            totalSpent={budgetData.totalSpent}
            percentage={budgetData.percentage}
            status={budgetData.status}
          />
        );
      case 1:
        return <PaymentTimelineChart data={timelineData} />;
      case 2:
        return <CategoryBreakdownChart data={categoryData} />;
      case 3:
        return <QuickStatsChart data={quickStatsData} />;
      default:
        return null;
    }
  };

  return (
    <div className='card'>
      {/* Tab Navigation - Responsive */}
      <div className='border-b border-gray-200 overflow-x-auto overflow-y-hidden'>
        <nav
          className='-mb-px flex space-x-2 sm:space-x-8 min-w-max px-1'
          aria-label='Chart tabs'
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type='button'
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                <div className='text-left'>
                  <div className='truncate max-w-[80px] sm:max-w-none'>
                    {tab.name}
                  </div>
                  <div className='text-xs text-gray-400 font-normal hidden lg:block'>
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Chart Content - Responsive Container */}
      <div className='p-2 sm:p-4 lg:pt-6 lg:px-6'>
        <div className='transition-all duration-300 ease-in-out min-h-[300px] sm:min-h-[350px] lg:min-h-[400px]'>
          {renderChart()}
        </div>
      </div>

      {/* Mobile Swipe Indicator */}
      <div className='flex justify-center pb-2 sm:hidden'>
        <div className='flex space-x-2'>
          {tabs.map((tab) => (
            <button
              key={`indicator-${tab.id}`}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-600 w-6'
                  : 'bg-gray-300 w-1.5'
              }`}
              aria-label={`Switch to ${tab.name} chart`}
            />
          ))}
        </div>
      </div>

      {/* Touch Swipe Gestures Hint */}
      <div className='text-center text-xs text-gray-400 pb-2 sm:hidden'>
        Swipe left/right or tap tabs to switch charts
      </div>

      {/* Keyboard Navigation Hint */}
      <div className='sr-only'>
        Use left and right arrow keys to navigate between charts. On mobile,
        swipe left or right to change charts.
      </div>
    </div>
  );
}
