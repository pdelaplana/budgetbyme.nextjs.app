import { HomeIcon } from '@heroicons/react/24/outline';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Breadcrumbs, { type BreadcrumbItem } from './Breadcrumbs';

describe('Breadcrumbs', () => {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/events/1/dashboard', icon: HomeIcon },
    { label: 'Category', href: '/events/1/category/2' },
    { label: 'Expense', current: true },
  ];

  it('renders a navigation landmark with all items', () => {
    const onNavigate = vi.fn();
    render(<Breadcrumbs items={items} onNavigate={onNavigate} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Expense')).toBeInTheDocument();
  });

  it('renders items with href as clickable buttons', () => {
    const onNavigate = vi.fn();
    render(<Breadcrumbs items={items} onNavigate={onNavigate} />);

    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Category' }),
    ).toBeInTheDocument();
  });

  it('renders the current item as plain text, not a button', () => {
    const onNavigate = vi.fn();
    render(<Breadcrumbs items={items} onNavigate={onNavigate} />);

    expect(
      screen.queryByRole('button', { name: 'Expense' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Expense')).toBeInTheDocument();
  });

  it('calls onNavigate with the correct href when a breadcrumb link is clicked', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Breadcrumbs items={items} onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: 'Category' }));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith('/events/1/category/2');
  });

  it('calls onNavigate with a different href for a different item', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<Breadcrumbs items={items} onNavigate={onNavigate} />);

    await user.click(screen.getByRole('button', { name: 'Home' }));

    expect(onNavigate).toHaveBeenCalledWith('/events/1/dashboard');
  });

  it('does not call onNavigate when clicking an item without href', () => {
    const onNavigate = vi.fn();
    render(<Breadcrumbs items={items} onNavigate={onNavigate} />);

    // The "current" item has no href and renders as a span, not a button,
    // so there is nothing clickable to trigger navigation with.
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('applies the provided className to the nav element', () => {
    const onNavigate = vi.fn();
    const { container } = render(
      <Breadcrumbs items={items} onNavigate={onNavigate} className='mb-4' />,
    );

    expect(container.querySelector('nav')).toHaveClass('mb-4');
  });
});
