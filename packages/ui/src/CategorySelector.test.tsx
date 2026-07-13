import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CategorySelector from './CategorySelector';

describe('CategorySelector', () => {
  const mockOnSelectionChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders category templates for the given event type', () => {
    render(
      <CategorySelector
        eventType='wedding'
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
      />,
    );

    expect(screen.getByText('Venue & Reception')).toBeInTheDocument();
    expect(screen.getByText('Catering & Beverages')).toBeInTheDocument();
  });

  it('shows the selection counter', () => {
    render(
      <CategorySelector
        eventType='wedding'
        selectedCategories={['wedding-venue']}
        onSelectionChange={mockOnSelectionChange}
      />,
    );

    expect(screen.getByText('1 of 6 categories selected')).toBeInTheDocument();
  });

  it('checks the checkbox for a selected category', () => {
    render(
      <CategorySelector
        eventType='wedding'
        selectedCategories={['wedding-venue']}
        onSelectionChange={mockOnSelectionChange}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
  });

  it('calls onSelectionChange when a category checkbox is toggled on', () => {
    render(
      <CategorySelector
        eventType='wedding'
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes[0].click();

    expect(mockOnSelectionChange).toHaveBeenCalledWith(['wedding-venue']);
  });

  it('calls onSelectionChange when a category checkbox is toggled off', () => {
    render(
      <CategorySelector
        eventType='wedding'
        selectedCategories={['wedding-venue']}
        onSelectionChange={mockOnSelectionChange}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes[0].click();

    expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
  });

  it('selects all categories when "Select All" is clicked', () => {
    render(
      <CategorySelector
        eventType='wedding'
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
      />,
    );

    screen.getByText('Select All').click();

    expect(mockOnSelectionChange).toHaveBeenCalledWith([
      'wedding-venue',
      'wedding-catering',
      'wedding-photography',
      'wedding-attire',
      'wedding-flowers',
      'wedding-entertainment',
    ]);
  });

  it('deselects all categories when "Deselect All" is clicked', () => {
    render(
      <CategorySelector
        eventType='wedding'
        selectedCategories={[
          'wedding-venue',
          'wedding-catering',
          'wedding-photography',
          'wedding-attire',
          'wedding-flowers',
          'wedding-entertainment',
        ]}
        onSelectionChange={mockOnSelectionChange}
      />,
    );

    screen.getByText('Deselect All').click();

    expect(mockOnSelectionChange).toHaveBeenCalledWith([]);
  });

  it('falls back to generic categories for an unmapped event type', () => {
    render(
      <CategorySelector
        eventType={'unknown' as never}
        selectedCategories={[]}
        onSelectionChange={mockOnSelectionChange}
      />,
    );

    expect(screen.getByText('Miscellaneous')).toBeInTheDocument();
  });
});
