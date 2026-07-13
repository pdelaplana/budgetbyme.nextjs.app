import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import IconSelector from './IconSelector';

describe('IconSelector', () => {
  it('renders all available icons as buttons', () => {
    render(<IconSelector value='🏛️' onChange={vi.fn()} />);

    expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
  });

  it('marks the selected icon button', () => {
    render(<IconSelector value='🍰' onChange={vi.fn()} />);

    const selectedButton = screen.getByRole('button', {
      name: 'Select icon 🍰',
    });
    expect(selectedButton).toHaveClass('border-gray-900');
  });

  it('calls onChange with the clicked icon', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<IconSelector value='🏛️' onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Select icon 🍰' }));

    expect(onChange).toHaveBeenCalledWith('🍰');
  });

  it('disables all buttons when disabled is true', () => {
    render(<IconSelector value='🏛️' onChange={vi.fn()} disabled />);

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });

  it('renders an error message when provided', () => {
    render(
      <IconSelector value='🏛️' onChange={vi.fn()} error='Icon is required' />,
    );

    expect(screen.getByText('Icon is required')).toBeInTheDocument();
  });
});
