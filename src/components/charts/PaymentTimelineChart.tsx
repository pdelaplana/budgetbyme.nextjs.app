'use client';

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/formatters';

interface TimelineDataPoint {
  date: string;
  budgeted: number;
  actual: number;
}

interface PaymentTimelineChartProps {
  data: TimelineDataPoint[];
}

export default function PaymentTimelineChart({
  data,
}: PaymentTimelineChartProps) {
  const formatMonth = (dateString: string) => {
    const date = new Date(`${dateString}-01`);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-4 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-semibold text-gray-900 mb-2'>
            {formatMonth(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <div
              key={index}
              className='flex items-center justify-between min-w-[120px]'
            >
              <div className='flex items-center'>
                <div
                  className='w-3 h-3 rounded-full mr-2'
                  style={{ backgroundColor: entry.color }}
                />
                <span className='text-sm text-gray-600'>
                  {entry.dataKey === 'budgeted' ? 'Budgeted' : 'Actual'}:
                </span>
              </div>
              <span className='text-sm font-medium text-gray-900'>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className='h-64 sm:h-72 lg:h-80 w-full'>
      <ResponsiveContainer width='100%' height='100%'>
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray='3 3'
            stroke='#E5E7EB'
            strokeOpacity={0.5}
          />
          <XAxis
            dataKey='date'
            tickFormatter={formatMonth}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 10 }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Budgeted bars */}
          <Bar
            dataKey='budgeted'
            fill='#d1fae5'
            stroke='#059669'
            strokeWidth={1}
            radius={[2, 2, 0, 0]}
            opacity={0.6}
          />

          {/* Actual spending line */}
          <Line
            type='monotone'
            dataKey='actual'
            stroke='#10b981'
            strokeWidth={3}
            dot={{
              fill: '#10b981',
              strokeWidth: 2,
              stroke: '#FFFFFF',
              r: 5,
            }}
            activeDot={{
              r: 7,
              stroke: '#10b981',
              strokeWidth: 2,
              fill: '#FFFFFF',
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Chart Legend */}
      <div className='flex items-center justify-center mt-4 space-x-6'>
        <div className='flex items-center'>
          <div className='w-4 h-3 bg-primary-100 border border-primary-600 mr-2 rounded-sm' />
          <span className='text-sm text-gray-600'>Budgeted Spending</span>
        </div>
        <div className='flex items-center'>
          <div className='w-4 h-0.5 bg-primary-500 mr-2' />
          <span className='text-sm text-gray-600'>Actual Spending</span>
        </div>
      </div>

      {/* Accessibility Table */}
      <table className='sr-only'>
        <caption>
          Payment timeline showing budgeted vs actual spending by month
        </caption>
        <thead>
          <tr>
            <th>Month</th>
            <th>Budgeted Amount</th>
            <th>Actual Spending</th>
            <th>Variance</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{formatMonth(item.date)}</td>
              <td>{formatCurrency(item.budgeted)}</td>
              <td>{formatCurrency(item.actual)}</td>
              <td>{formatCurrency(item.actual - item.budgeted)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
