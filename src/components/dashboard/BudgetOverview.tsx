'use client';

import React from 'react';
import TabbedCharts from '@/components/dashboard/TabbedCharts';
import type { Event } from '@/types/Event';

interface BudgetOverviewProps {
  event: Event;
  categories: any[];
}

// Generate timeline data based on current event totals and event date
const generateTimelineData = (event: Event) => {
  const eventDate = new Date(event.eventDate);
  const currentDate = new Date();
  const monthsUntilEvent = Math.max(1, Math.ceil((eventDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  
  // Create timeline showing gradual budget allocation leading up to event
  const timeline = [];
  const monthlyBudget = event.totalBudgetedAmount / Math.max(monthsUntilEvent, 6); // Spread over 6 months or time until event
  
  for (let i = 0; i < Math.min(monthsUntilEvent + 2, 12); i++) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const monthStr = month.toISOString().slice(0, 7); // YYYY-MM format
    
    timeline.push({
      date: monthStr,
      budgeted: Math.round(monthlyBudget * (i + 1)),
      actual: i === 0 ? event.totalSpentAmount : 0, // Only show actual spending for current month
    });
  }
  
  return timeline;
};

export default function BudgetOverview({ event, categories }: BudgetOverviewProps) {
  // Transform BudgetCategory data to CategoryData format expected by charts
  const transformedCategories = categories.map((category) => ({
    id: category.id,
    name: category.name,
    budgeted: category.budgetedAmount || 0,
    spent: category.spentAmount || 0,
    percentage: 0, // Will be calculated in the chart component
    color: category.color || '#3B82F6', // Default blue color if none provided
  }));

  return (
    <div className='mb-6 sm:mb-8'>
      <TabbedCharts
        budgetData={{
          totalBudget: event.totalBudgetedAmount,
          totalSpent: event.totalSpentAmount,
          totalScheduled: event.totalScheduledAmount,
          percentage: event.spentPercentage,
          status:
            event.status === 'completed'
              ? 'on-track'
              : event.status === 'under-budget'
                ? 'under-budget'
                : (event.status as any),
        }}
        timelineData={generateTimelineData(event)}
        categoryData={transformedCategories}
        quickStatsData={{
          totalBudget: event.totalBudgetedAmount,
          totalSpent: event.totalSpentAmount,
          categories: categories.length,
          paymentsDue: 0, // Will be updated when expense system is implemented
          eventDate: event.eventDate,
        }}
      />
    </div>
  );
}