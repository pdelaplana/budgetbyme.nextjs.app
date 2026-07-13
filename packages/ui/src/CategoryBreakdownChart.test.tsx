import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import CategoryBreakdownChart from './CategoryBreakdownChart';

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

describe('CategoryBreakdownChart', () => {
  const data = [
    {
      id: '1',
      name: 'Venue & Reception',
      budgeted: 5000,
      spent: 3000,
      percentage: 50,
      color: '#059669',
    },
    {
      id: '2',
      name: 'Catering & Beverages',
      budgeted: 5000,
      spent: 2000,
      percentage: 50,
      color: '#D97706',
    },
  ];

  it('renders category legend entries', () => {
    render(<CategoryBreakdownChart data={data} />);

    // Each name appears twice: once in the visible legend button and once in
    // the sr-only accessibility table.
    expect(screen.getAllByText('Venue & Reception')).toHaveLength(2);
    expect(screen.getAllByText('Catering & Beverages')).toHaveLength(2);
  });

  it('shows the empty state when there is no budgeted data', () => {
    render(<CategoryBreakdownChart data={[]} />);

    expect(screen.getByText('No Budget Categories Yet')).toBeInTheDocument();
  });

  it('does not recompute totalBudget/pieData on hover-triggered re-renders', () => {
    // `data.reduce` is only ever called once in the component, to derive
    // `totalBudget` inside the memoized block. Spying on Array.prototype.reduce
    // and filtering to calls made with `data` as `this` lets us count exactly
    // how many times that derivation has run, without reaching into component
    // internals.
    const reduceSpy = vi.spyOn(Array.prototype, 'reduce');
    const countDataReduceCalls = () =>
      reduceSpy.mock.contexts.filter((ctx) => ctx === data).length;

    render(<CategoryBreakdownChart data={data} />);
    const countAfterMount = countDataReduceCalls();
    expect(countAfterMount).toBeGreaterThan(0);

    // Hovering a legend entry updates `activeIndex` state, which re-renders
    // the component. Before the fix, this recomputed totalBudget/pieData
    // from scratch on every hover event even though `data` hadn't changed.
    const [firstLegendButton] = screen.getAllByRole('button');
    fireEvent.mouseEnter(firstLegendButton);
    fireEvent.mouseLeave(firstLegendButton);
    fireEvent.mouseEnter(firstLegendButton);

    const countAfterHovers = countDataReduceCalls();
    expect(countAfterHovers).toBe(countAfterMount);

    reduceSpy.mockRestore();
  });
});
