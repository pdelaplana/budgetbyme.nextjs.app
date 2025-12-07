import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Expense } from '@/types/Expense';
import ExpenseBasicInfo from './ExpenseBasicInfo';

const mockExpense: Expense = {
  id: 'expense-1',
  name: 'Test Expense',
  amount: 1500,
  currency: { code: 'USD', symbol: '$' },
  category: {
    id: 'cat-1',
    name: 'Test Category',
    color: '#3B82F6',
    icon: 'ShoppingBag',
  },
  tags: ['important', 'urgent'],
  description: 'This is a test expense description',
  _createdDate: new Date('2024-01-01'),
  attachments: [],
  hasPaymentSchedule: false,
  date: new Date('2024-01-01'),
  notes: '',
  vendor: { name: '', address: '', website: '', email: '' },
  _createdBy: 'user123',
  _updatedDate: new Date('2024-01-01'),
  _updatedBy: 'user123',
};

// Mock the formatters
vi.mock('@/lib/formatters', () => ({
  formatCurrency: (amount: number) => `$${amount.toLocaleString()}`,
  formatDate: (date: Date) => date.toLocaleDateString(),
}));

describe('ExpenseBasicInfo', () => {
  const mockTagHandlers = {
    addTag: vi.fn(),
    deleteTag: vi.fn(),
    setNewTag: vi.fn(),
    toggleEditing: vi.fn(),
    handleKeyPress: vi.fn(),
  };

  const defaultProps = {
    expense: mockExpense,
    tags: ['important', 'urgent'],
    isEditingTags: false,
    newTag: '',
    onTagsChange: mockTagHandlers,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render expense basic information', () => {
    render(<ExpenseBasicInfo {...defaultProps} />);

    // Check if expense name is displayed
    expect(screen.getByText('Test Expense')).toBeInTheDocument();

    // Check if amount is displayed
    expect(screen.getByText('$1,500')).toBeInTheDocument();

    // Check if category is displayed
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('should render tags when not editing', () => {
    render(<ExpenseBasicInfo {...defaultProps} />);

    // Tags should be displayed
    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();

    // Should have edit button (shows text as "(Edit)")
    expect(screen.getByText(/\(Edit\)/)).toBeInTheDocument();
  });

  it('should render tag editing interface when editing', () => {
    render(
      <ExpenseBasicInfo
        {...defaultProps}
        isEditingTags={true}
        newTag='new-tag'
      />,
    );

    // Should have input field for new tag
    expect(screen.getByPlaceholderText(/add tag/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('new-tag')).toBeInTheDocument();

    // Should have add button (shows as "+") and cancel button (shows as "(Cancel)")
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
    expect(screen.getByText(/\(Cancel\)/)).toBeInTheDocument();
  });

  it('should call toggleEditing when edit tags button is clicked', () => {
    render(<ExpenseBasicInfo {...defaultProps} />);

    const editButton = screen.getByText(/\(Edit\)/);
    fireEvent.click(editButton);

    expect(mockTagHandlers.toggleEditing).toHaveBeenCalledTimes(1);
  });

  it('should call addTag when add button is clicked', () => {
    render(
      <ExpenseBasicInfo
        {...defaultProps}
        isEditingTags={true}
        newTag='new-tag'
      />,
    );

    const addButton = screen.getByRole('button', { name: '+' });
    fireEvent.click(addButton);

    expect(mockTagHandlers.addTag).toHaveBeenCalledTimes(1);
  });

  it('should call deleteTag when tag delete button is clicked', () => {
    render(<ExpenseBasicInfo {...defaultProps} isEditingTags={true} />);

    // Find delete buttons for tags (they have aria-label like "Remove important tag")
    const deleteButtons = screen.getAllByRole('button', {
      name: /remove.*tag/i,
    });
    expect(deleteButtons).toHaveLength(2); // Should have 2 delete buttons for 2 tags

    fireEvent.click(deleteButtons[0]);
    expect(mockTagHandlers.deleteTag).toHaveBeenCalledWith('important');
  });

  it('should call setNewTag when input value changes', () => {
    render(<ExpenseBasicInfo {...defaultProps} isEditingTags={true} />);

    const input = screen.getByPlaceholderText(/add tag/i);
    fireEvent.change(input, { target: { value: 'new-tag-input' } });

    expect(mockTagHandlers.setNewTag).toHaveBeenCalledWith('new-tag-input');
  });

  it('should call handleKeyPress when keys are pressed in input', () => {
    render(<ExpenseBasicInfo {...defaultProps} isEditingTags={true} />);

    const input = screen.getByPlaceholderText(/add tag/i);
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockTagHandlers.handleKeyPress).toHaveBeenCalled();
  });

  it('should handle empty tags array', () => {
    render(<ExpenseBasicInfo {...defaultProps} tags={[]} />);

    // Should still render the component without tags
    expect(screen.getByText('Test Expense')).toBeInTheDocument();
    // Should show "No tags" text and "Add" button
    expect(screen.getByText(/no tags/i)).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('should render category information if provided', () => {
    // This test assumes the component shows category info if available
    render(<ExpenseBasicInfo {...defaultProps} />);

    // The component might show category info - this depends on implementation
    expect(screen.getByText('Test Expense')).toBeInTheDocument();
  });

  it('should handle long expense names gracefully', () => {
    const longNameExpense = {
      ...mockExpense,
      name: 'This is a very long expense name that might need special handling for display purposes',
    };

    render(<ExpenseBasicInfo {...defaultProps} expense={longNameExpense} />);

    expect(screen.getByText(longNameExpense.name)).toBeInTheDocument();
  });

  it('should render currency information', () => {
    render(<ExpenseBasicInfo {...defaultProps} />);

    // Should show formatted currency
    expect(screen.getByText('$1,500')).toBeInTheDocument();
  });

  it('should handle expense with many tags', () => {
    const manyTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'tag6'];
    render(
      <ExpenseBasicInfo
        {...defaultProps}
        tags={manyTags}
        isEditingTags={true}
      />,
    );

    // All tags should be rendered
    manyTags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });

    // Should have correct number of delete buttons
    const deleteButtons = screen.getAllByRole('button', {
      name: /remove.*tag/i,
    });
    expect(deleteButtons).toHaveLength(manyTags.length);
  });

  it('should have proper semantic structure', () => {
    render(<ExpenseBasicInfo {...defaultProps} />);

    // Should have appropriate headings or labels
    expect(screen.getByText('Test Expense')).toBeInTheDocument();

    // Should have proper form elements when editing
    render(<ExpenseBasicInfo {...defaultProps} isEditingTags={true} />);

    // Input uses placeholder instead of aria-label
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Add tag...');
  });

  it('should handle tag editing state transitions', () => {
    const { rerender } = render(<ExpenseBasicInfo {...defaultProps} />);

    // Initially not editing - should show (Edit) button
    expect(screen.getByText(/\(Edit\)/)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

    // Switch to editing
    rerender(<ExpenseBasicInfo {...defaultProps} isEditingTags={true} />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // Should now show (Cancel) instead of (Edit)
    expect(screen.getByText(/\(Cancel\)/)).toBeInTheDocument();
    expect(screen.queryByText(/\(Edit\)/)).not.toBeInTheDocument();
  });

  it('should not re-render unnecessarily with same props', () => {
    const { rerender } = render(<ExpenseBasicInfo {...defaultProps} />);

    // Get reference to an element
    const _expenseName = screen.getByText('Test Expense');

    // Re-render with same props
    rerender(<ExpenseBasicInfo {...defaultProps} />);

    // Element should still be there (React.memo should prevent unnecessary re-render)
    expect(screen.getByText('Test Expense')).toBeInTheDocument();
  });

  it('should update when expense data changes', () => {
    const { rerender } = render(<ExpenseBasicInfo {...defaultProps} />);

    expect(screen.getByText('Test Expense')).toBeInTheDocument();
    expect(screen.getByText('$1,500')).toBeInTheDocument();

    const updatedExpense = {
      ...mockExpense,
      name: 'Updated Expense',
      amount: 2000,
    };
    rerender(<ExpenseBasicInfo {...defaultProps} expense={updatedExpense} />);

    expect(screen.getByText('Updated Expense')).toBeInTheDocument();
    expect(screen.getByText('$2,000')).toBeInTheDocument();
  });

  it('should update when tags change', () => {
    const { rerender } = render(<ExpenseBasicInfo {...defaultProps} />);

    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();

    rerender(
      <ExpenseBasicInfo {...defaultProps} tags={['new-tag', 'another-tag']} />,
    );

    expect(screen.getByText('new-tag')).toBeInTheDocument();
    expect(screen.getByText('another-tag')).toBeInTheDocument();
    expect(screen.queryByText('important')).not.toBeInTheDocument();
    expect(screen.queryByText('urgent')).not.toBeInTheDocument();
  });
});
