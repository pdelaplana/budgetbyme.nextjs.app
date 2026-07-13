import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import QuickStatsChart from './QuickStatsChart';

describe('QuickStatsChart', () => {
  it('renders stats grid and budget overview', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);

    render(
      <QuickStatsChart
        data={{
          totalBudget: 10000,
          totalSpent: 4000,
          categories: 5,
          paymentsDue: 2,
          eventDate: futureDate.toISOString(),
        }}
      />,
    );

    // 40% appears twice: the Budget Used stat tile and the Progress bar label
    expect(screen.getAllByText('40%')).toHaveLength(2);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
    expect(screen.getByText('$4,000')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
    expect(screen.getByText('Upcoming Payments')).toBeInTheDocument();
    expect(screen.getByText('Event Approaching')).toBeInTheDocument();
  });

  it('shows over budget insight when spending exceeds budget', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);

    render(
      <QuickStatsChart
        data={{
          totalBudget: 1000,
          totalSpent: 1200,
          categories: 3,
          paymentsDue: 0,
          eventDate: futureDate.toISOString(),
        }}
      />,
    );

    expect(screen.getByText('Over Budget Alert')).toBeInTheDocument();
    expect(screen.getByText('Over Budget')).toBeInTheDocument();
  });
});
