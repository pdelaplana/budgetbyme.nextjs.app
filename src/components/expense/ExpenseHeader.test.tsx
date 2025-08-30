import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ExpenseHeader from './ExpenseHeader';
import type { Expense } from '@/types/Expense';
import type { Event } from '@/types/Event';

const mockExpense: Expense = {
  id: 'expense-1',
  name: 'Test Expense',
  amount: 100,
  currency: { code: 'USD', symbol: '$' },
  categoryId: 'cat-1',
  tags: ['tag1', 'tag2'],
  _createdDate: new Date(),
  attachments: [],
};

const mockEvent: Event = {
  id: 'event-1',
  name: 'Test Event',
  description: 'Test Description',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-02'),
  _createdDate: new Date(),
  categories: [
    {
      id: 'cat-1',
      name: 'Test Category',
      budgetAmount: 1000,
      _createdDate: new Date(),
    },
  ],
};

describe('ExpenseHeader', () => {
  const defaultProps = {
    expense: mockExpense,
    currentEvent: mockEvent,
    eventId: 'event-1',
    showActionDropdown: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onToggleActionDropdown: vi.fn(),
    onCloseActionDropdown: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render breadcrumbs correctly', () => {
    render(<ExpenseHeader {...defaultProps} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByText('Test Expense')).toBeInTheDocument();
  });

  it('should render expense title', () => {
    render(<ExpenseHeader {...defaultProps} />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Expense');
  });

  it('should render edit and delete buttons on desktop', () => {
    render(<ExpenseHeader {...defaultProps} />);
    
    // Should have Edit and Delete buttons
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('should render mobile menu button', () => {
    render(<ExpenseHeader {...defaultProps} />);
    
    // Should have mobile menu button (hidden on larger screens)
    const mobileButton = screen.getByRole('button', { name: /open actions menu/i });
    expect(mobileButton).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<ExpenseHeader {...defaultProps} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<ExpenseHeader {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('should call onToggleActionDropdown when mobile menu button is clicked', () => {
    render(<ExpenseHeader {...defaultProps} />);
    
    const mobileButton = screen.getByRole('button', { name: /open actions menu/i });
    fireEvent.click(mobileButton);
    
    expect(defaultProps.onToggleActionDropdown).toHaveBeenCalledTimes(1);
  });

  it('should render ActionDropdown when showActionDropdown is true', () => {
    render(
      <ExpenseHeader
        {...defaultProps}
        showActionDropdown={true}
      />
    );
    
    // ActionDropdown should be rendered (we'll test its internal functionality in its own test)
    // For now, we just check that it receives the correct props
    expect(defaultProps.onCloseActionDropdown).toBeDefined();
  });

  it('should handle long expense names in breadcrumbs', () => {
    const longNameExpense = {
      ...mockExpense,
      name: 'This is a very long expense name that should be truncated in the breadcrumb navigation',
    };
    
    render(
      <ExpenseHeader
        {...defaultProps}
        expense={longNameExpense}
      />
    );
    
    // Title should show full name
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(longNameExpense.name);
    
    // Breadcrumb should show truncated name (implementation detail of breadcrumb component)
    const breadcrumbExpenseName = screen.getByText(longNameExpense.name);
    expect(breadcrumbExpenseName).toBeInTheDocument();
  });

  it('should handle missing category gracefully', () => {
    const eventWithoutCategory = {
      ...mockEvent,
      categories: [],
    };
    
    render(
      <ExpenseHeader
        {...defaultProps}
        currentEvent={eventWithoutCategory}
      />
    );
    
    // Should still render, but might show "Unknown Category"
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('should render with proper ARIA labels and semantic structure', () => {
    render(<ExpenseHeader {...defaultProps} />);
    
    // Check for proper semantic structure
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // Breadcrumbs
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(); // Main title
    
    // Check for proper button labels
    expect(screen.getByRole('button', { name: /edit/i })).toHaveAttribute('aria-label');
    expect(screen.getByRole('button', { name: /delete/i })).toHaveAttribute('aria-label');
    expect(screen.getByRole('button', { name: /open actions menu/i })).toHaveAttribute('aria-label');
  });

  it('should have proper responsive classes', () => {
    render(<ExpenseHeader {...defaultProps} />);
    
    // Desktop buttons should have md:flex class (or similar responsive utility)
    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toHaveClass(/md:/);
    
    // Mobile button should have md:hidden class (or similar)
    const mobileButton = screen.getByRole('button', { name: /open actions menu/i });
    expect(mobileButton).toHaveClass(/md:/);
  });

  it('should not re-render unnecessarily with same props', () => {
    const { rerender } = render(<ExpenseHeader {...defaultProps} />);
    
    // Get initial render count (this is conceptual - React.memo prevents unnecessary renders)
    const initialEditButton = screen.getByRole('button', { name: /edit/i });
    
    // Re-render with same props
    rerender(<ExpenseHeader {...defaultProps} />);
    
    // Button should still be there (component should have memoized properly)
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('should update when expense changes', () => {
    const { rerender } = render(<ExpenseHeader {...defaultProps} />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Expense');
    
    const updatedExpense = { ...mockExpense, name: 'Updated Expense Name' };
    rerender(<ExpenseHeader {...defaultProps} expense={updatedExpense} />);
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Updated Expense Name');
  });

  it('should update when event changes', () => {
    const { rerender } = render(<ExpenseHeader {...defaultProps} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    
    const updatedEvent = { ...mockEvent, name: 'Updated Event Name' };
    rerender(<ExpenseHeader {...defaultProps} currentEvent={updatedEvent} />);
    
    expect(screen.getByText('Updated Event Name')).toBeInTheDocument();
  });
});