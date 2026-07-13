import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import PaymentTimelineChart from './PaymentTimelineChart';

// Recharts' ResponsiveContainer observes its layout via ResizeObserver, which
// jsdom does not implement. Provide a no-op stub so the chart can mount.
beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {
        // no-op
      }
      unobserve() {
        // no-op
      }
      disconnect() {
        // no-op
      }
    },
  );
});

describe('PaymentTimelineChart', () => {
  const data = [
    {
      date: '2024-01',
      budgeted: 1000,
      actual: 800,
      expenses: [{ name: 'Venue deposit', amount: 800 }],
    },
    {
      date: '2024-02',
      budgeted: 500,
      actual: 500,
      expenses: [],
    },
  ];

  it('renders the accessibility table with formatted amounts', () => {
    render(<PaymentTimelineChart data={data} />);

    expect(
      screen.getByText(
        'Payment timeline showing budgeted vs actual spending by month',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Feb')).toBeInTheDocument();
    expect(screen.getAllByText('$1,000')).toHaveLength(1);
    expect(screen.getAllByText('$500')).toHaveLength(2); // Feb budgeted and Feb actual
  });

  it('renders the chart legend', () => {
    render(<PaymentTimelineChart data={data} />);

    expect(screen.getAllByText('Budgeted Spending').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Actual Spending').length).toBeGreaterThan(0);
  });
});
