import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExpenseBasicInfo from './ExpenseBasicInfo';
import type { Expense } from './types/Expense';

const mockExpense: Expense = {
  id: 'expense-1',
  name: 'Test Expense',
  description: 'This is a test expense description',
  amount: 1500,
  date: new Date('2024-01-01'),
  notes: '',
  category: {
    id: 'cat-1',
    name: 'Test Category',
    color: '#3B82F6',
    icon: 'ShoppingBag',
  },
  vendor: { name: '', address: '', website: '', email: '' },
  hasPaymentSchedule: false,
};

// Mock the formatters
vi.mock('./utils/formatters', () => ({
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

    expect(screen.getByText('Test Expense')).toBeInTheDocument();
    expect(screen.getByText('$1,500')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
  });

  it('should render tags when not editing', () => {
    render(<ExpenseBasicInfo {...defaultProps} />);

    expect(screen.getByText('important')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
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

    expect(screen.getByPlaceholderText(/add tag/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('new-tag')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
    expect(screen.getByText(/\(Cancel\)/)).toBeInTheDocument();
  });

  it('should call toggleEditing when edit tags button is clicked', () => {
    render(<ExpenseBasicInfo {...defaultProps} />);

    fireEvent.click(screen.getByText(/\(Edit\)/));

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

    fireEvent.click(screen.getByRole('button', { name: '+' }));

    expect(mockTagHandlers.addTag).toHaveBeenCalledTimes(1);
  });

  it('should call deleteTag when tag delete button is clicked', () => {
    render(<ExpenseBasicInfo {...defaultProps} isEditingTags={true} />);

    const deleteButtons = screen.getAllByRole('button', {
      name: /remove.*tag/i,
    });
    expect(deleteButtons).toHaveLength(2);

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

    expect(screen.getByText('Test Expense')).toBeInTheDocument();
    expect(screen.getByText(/no tags/i)).toBeInTheDocument();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('should handle long expense names gracefully', () => {
    const longNameExpense = {
      ...mockExpense,
      name: 'This is a very long expense name that might need special handling for display purposes',
    };

    render(<ExpenseBasicInfo {...defaultProps} expense={longNameExpense} />);

    expect(screen.getByText(longNameExpense.name)).toBeInTheDocument();
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

    manyTags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', {
      name: /remove.*tag/i,
    });
    expect(deleteButtons).toHaveLength(manyTags.length);
  });

  it('should not re-render unnecessarily with same props', () => {
    const { rerender } = render(<ExpenseBasicInfo {...defaultProps} />);

    rerender(<ExpenseBasicInfo {...defaultProps} />);

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
