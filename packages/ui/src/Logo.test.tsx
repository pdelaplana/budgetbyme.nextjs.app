import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Logo from './Logo';

describe('Logo', () => {
  it('renders an accessible svg logo', () => {
    render(<Logo />);

    expect(
      screen.getByRole('img', { name: 'BudgetByMe logo' }),
    ).toBeInTheDocument();
  });

  it('renders the full variant text by default', () => {
    render(<Logo />);

    expect(screen.getByText('Budget')).toBeInTheDocument();
    expect(screen.getByText('By Me')).toBeInTheDocument();
  });

  it('omits text when variant is icon-only', () => {
    render(<Logo variant='icon-only' />);

    expect(screen.queryByText('Budget')).not.toBeInTheDocument();
    expect(screen.queryByText('By Me')).not.toBeInTheDocument();
  });

  it('applies size dimensions to the svg element', () => {
    render(<Logo size='lg' />);

    const svg = screen.getByRole('img', { name: 'BudgetByMe logo' });
    expect(svg).toHaveAttribute('width', '220');
    expect(svg).toHaveAttribute('height', '80');
  });

  it('applies a custom className to the wrapping div', () => {
    const { container } = render(<Logo className='custom-class' />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
