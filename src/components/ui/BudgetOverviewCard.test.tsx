import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { BudgetData } from './BudgetOverviewCard';
import BudgetOverviewCard, { createBudgetData } from './BudgetOverviewCard';

// Mock the formatters
vi.mock('@/lib/formatters', () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(0)}`,
}));

describe('BudgetOverviewCard', () => {
  const mockBudgetData: BudgetData = {
    budgetedAmount: 10000,
    scheduledAmount: 7000,
    spentAmount: 3000,
    color: '#059669',
  };

  it('renders budget overview correctly', () => {
    render(<BudgetOverviewCard data={mockBudgetData} />);

    expect(screen.getByText('Budget Overview')).toBeInTheDocument();
    expect(screen.getByText('$10000')).toBeInTheDocument(); // budgeted
    expect(screen.getAllByText('$7000')).toHaveLength(2); // scheduled and remaining
    expect(screen.getByText('$3000')).toBeInTheDocument(); // spent
    expect(screen.getByText('30%')).toBeInTheDocument(); // percentage
    expect(screen.getByText('of budget used')).toBeInTheDocument();
  });

  it('shows remaining budget correctly', () => {
    render(<BudgetOverviewCard data={mockBudgetData} />);

    expect(screen.getByText('Remaining:')).toBeInTheDocument();
    // Check specifically for the remaining amount (should be 2 occurrences: scheduled and remaining)
    expect(screen.getAllByText('$7000')).toHaveLength(2);
  });

  it('shows over budget correctly', () => {
    const overBudgetData: BudgetData = {
      budgetedAmount: 1000,
      spentAmount: 1500,
    };

    render(<BudgetOverviewCard data={overBudgetData} />);

    expect(screen.getByText('Over budget:')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<BudgetOverviewCard data={mockBudgetData} title='Custom Title' />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BudgetOverviewCard data={mockBudgetData} className='custom-class' />,
    );

    const card = container.querySelector('.card');
    expect(card).toHaveClass('custom-class');
  });

  it('hides scheduled amount when showScheduled is false', () => {
    render(<BudgetOverviewCard data={mockBudgetData} showScheduled={false} />);

    expect(screen.queryByText('Scheduled:')).not.toBeInTheDocument();
  });

  it('does not show scheduled amount when not provided', () => {
    const dataWithoutScheduled = {
      ...mockBudgetData,
      scheduledAmount: undefined,
    };

    render(<BudgetOverviewCard data={dataWithoutScheduled} />);

    expect(screen.queryByText('Scheduled:')).not.toBeInTheDocument();
  });

  it('uses custom progress bar color', () => {
    const { container } = render(
      <BudgetOverviewCard data={mockBudgetData} progressBarColor='#ff0000' />,
    );

    const progressBar = container.querySelector('.transition-all');
    expect(progressBar).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('uses data color for progress bar when no custom color provided', () => {
    const { container } = render(<BudgetOverviewCard data={mockBudgetData} />);

    const progressBar = container.querySelector('.transition-all');
    expect(progressBar).toHaveStyle({ backgroundColor: '#059669' });
  });

  it('handles zero budget amount', () => {
    const zeroBudgetData: BudgetData = {
      budgetedAmount: 0,
      spentAmount: 0,
    };

    render(<BudgetOverviewCard data={zeroBudgetData} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('caps progress bar at 100%', () => {
    const overSpentData: BudgetData = {
      budgetedAmount: 1000,
      spentAmount: 2000, // 200% spent
    };

    const { container } = render(<BudgetOverviewCard data={overSpentData} />);

    const progressBar = container.querySelector('.transition-all');
    expect(progressBar).toHaveStyle({ width: '100%' }); // Should be capped at 100%
    expect(screen.getByText('200%')).toBeInTheDocument(); // But text shows actual percentage
  });
});

describe('createBudgetData', () => {
  it('creates budget data with all properties', () => {
    const source = {
      budgetedAmount: 5000,
      scheduledAmount: 3000,
      spentAmount: 1000,
      color: '#123456',
    };

    const result = createBudgetData(source);

    expect(result).toEqual({
      budgetedAmount: 5000,
      scheduledAmount: 3000,
      spentAmount: 1000,
      color: '#123456',
    });
  });

  it('handles undefined values with defaults', () => {
    const source = {};

    const result = createBudgetData(source);

    expect(result).toEqual({
      budgetedAmount: 0,
      scheduledAmount: undefined,
      spentAmount: 0,
      color: undefined,
    });
  });

  it('handles partial data', () => {
    const source = {
      budgetedAmount: 2000,
      color: '#abcdef',
    };

    const result = createBudgetData(source);

    expect(result).toEqual({
      budgetedAmount: 2000,
      scheduledAmount: undefined,
      spentAmount: 0,
      color: '#abcdef',
    });
  });
});
