import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders default title and message', () => {
    render(<LoadingSpinner />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(
      screen.getByText('Please wait while we load your data'),
    ).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(<LoadingSpinner title='Custom Title' message='Custom message' />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('applies the size classes to the spinner element', () => {
    const { container } = render(<LoadingSpinner size='lg' />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-16', 'w-16');
  });

  it('defaults to the md size', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('applies noPadding by omitting the py-12 class', () => {
    const { container } = render(<LoadingSpinner noPadding />);

    expect(container.firstChild).not.toHaveClass('py-12');
  });

  it('includes py-12 padding by default', () => {
    const { container } = render(<LoadingSpinner />);

    expect(container.firstChild).toHaveClass('py-12');
  });

  it('applies a custom className', () => {
    const { container } = render(<LoadingSpinner className='custom-class' />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
