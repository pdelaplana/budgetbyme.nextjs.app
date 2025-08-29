'use client';

import React, { useState } from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface CategoryData {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  percentage: number;
  color: string;
}

interface CategoryBreakdownChartProps {
  data: CategoryData[];
}

export default function CategoryBreakdownChart({
  data,
}: CategoryBreakdownChartProps) {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

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

  // Prepare data for the pie chart
  const totalBudget = data.reduce((sum, cat) => sum + cat.budgeted, 0);
  const pieData = data.map((item) => ({
    name: item.name,
    value: item.budgeted,
    spent: item.spent,
    percentage: totalBudget > 0 ? (item.budgeted / totalBudget) * 100 : 0,
    color: item.color,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-[200px]'>
          <div className='flex items-center mb-2'>
            <span className='text-lg mr-2'>{getCategoryIcon(data.name)}</span>
            <h3 className='font-semibold text-gray-900'>{data.name}</h3>
          </div>
          <div className='space-y-1'>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Budgeted:</span>
              <span className='text-sm font-medium'>
                {formatCurrency(data.value)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-sm text-gray-600'>Spent:</span>
              <span className='text-sm font-medium'>
                {formatCurrency(data.spent)}
              </span>
            </div>
            <div className='flex justify-between pt-1 border-t border-gray-200'>
              <span className='text-sm text-gray-600'>Percentage:</span>
              <span className='text-sm font-medium'>
                {isNaN(data.percentage) ? '0.0' : data.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  // Show empty state if no data or all budgets are zero
  if (data.length === 0 || totalBudget === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-64 sm:h-72 lg:h-80 text-center'>
        <div className='text-6xl mb-4'>📊</div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          No Budget Categories Yet
        </h3>
        <p className='text-gray-600 max-w-md'>
          Create budget categories and allocate amounts to see your spending
          breakdown here.
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      {/* Pie Chart - Responsive */}
      <div className='h-64 sm:h-72 lg:h-80 w-full mb-4'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              data={pieData}
              cx='50%'
              cy='50%'
              innerRadius={40}
              outerRadius={90}
              paddingAngle={2}
              dataKey='value'
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={activeIndex === index ? '#374151' : 'none'}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  style={{
                    filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                    transform:
                      activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Legend with Details - Responsive */}
      <div className='space-y-2 sm:space-y-3'>
        {pieData.map((item, index) => (
          <div
            key={item.name}
            className='flex items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 cursor-pointer'
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
          >
            <div className='flex items-center min-w-0 flex-1'>
              <span className='text-base sm:text-lg mr-2 sm:mr-3 flex-shrink-0'>
                {getCategoryIcon(item.name)}
              </span>
              <div className='flex items-center min-w-0'>
                <div
                  className='w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full mr-2 sm:mr-3 flex-shrink-0'
                  style={{ backgroundColor: item.color }}
                />
                <span className='font-medium text-gray-900 text-xs sm:text-sm truncate'>
                  {item.name}
                </span>
              </div>
            </div>
            <div className='text-right ml-2'>
              <div className='text-xs sm:text-sm font-medium text-gray-900'>
                {formatCurrency(item.value)}
              </div>
              <div className='text-xs text-gray-500'>
                {isNaN(item.percentage) ? '0.0' : item.percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className='mt-6 pt-4 border-t border-gray-200'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-900'>
              {formatCurrency(
                pieData.reduce((sum, item) => sum + item.value, 0),
              )}
            </div>
            <div className='text-sm text-gray-600'>Total Budget</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-success-600'>
              {formatCurrency(
                pieData.reduce((sum, item) => sum + item.spent, 0),
              )}
            </div>
            <div className='text-sm text-gray-600'>Total Spent</div>
          </div>
        </div>
      </div>

      {/* Accessibility Table */}
      <table className='sr-only'>
        <caption>
          Budget breakdown by category showing budgeted amounts and spending
        </caption>
        <thead>
          <tr>
            <th>Category</th>
            <th>Budgeted Amount</th>
            <th>Amount Spent</th>
            <th>Percentage of Total Budget</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{formatCurrency(item.budgeted)}</td>
              <td>{formatCurrency(item.spent)}</td>
              <td>
                {isNaN(pieData[index].percentage)
                  ? '0.0'
                  : pieData[index].percentage.toFixed(1)}
                %
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
