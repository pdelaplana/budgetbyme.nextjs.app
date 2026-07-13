import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BudgetGaugeChart from './BudgetGaugeChart';

describe('BudgetGaugeChart', () => {
  it('renders budget summary values', () => {
    render(
      <BudgetGaugeChart
        totalBudget={10000}
        totalSpent={3000}
        totalScheduled={7000}
        percentage={30}
        status='under-budget'
      />,
    );

    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('Under Budget')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
    // $7,000 appears twice: Total Scheduled and Remaining (10000 - 3000)
    expect(screen.getAllByText('$7,000')).toHaveLength(2);
    expect(screen.getByText('$3,000')).toBeInTheDocument();
  });

  it('shows remaining budget as "over" when overspent', () => {
    render(
      <BudgetGaugeChart
        totalBudget={1000}
        totalSpent={1200}
        totalScheduled={1000}
        percentage={120}
        status='over-budget'
      />,
    );

    expect(screen.getByText('Over Budget')).toBeInTheDocument();
    expect(screen.getByText('$200 over')).toBeInTheDocument();
  });

  it.each([
    ['on-track', 'On Track'],
    ['approaching-limit', 'Approaching Limit'],
    ['over-budget', 'Over Budget'],
  ] as const)('renders status text for %s', (status, expectedText) => {
    render(
      <BudgetGaugeChart
        totalBudget={1000}
        totalSpent={500}
        totalScheduled={500}
        percentage={50}
        status={status}
      />,
    );

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});
