import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import NotFoundState from './NotFoundState';

describe('NotFoundState', () => {
  it('renders title, message and button text', () => {
    render(
      <NotFoundState
        title='Not Found'
        message='This item does not exist.'
        buttonText='Go Back'
        onButtonClick={vi.fn()}
      />,
    );

    expect(screen.getByText('Not Found')).toBeInTheDocument();
    expect(screen.getByText('This item does not exist.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
  });

  it('renders a default icon when none is provided', () => {
    render(
      <NotFoundState
        title='Not Found'
        message='This item does not exist.'
        buttonText='Go Back'
        onButtonClick={vi.fn()}
      />,
    );

    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  it('renders a custom icon when provided', () => {
    render(
      <NotFoundState
        title='Not Found'
        message='This item does not exist.'
        buttonText='Go Back'
        onButtonClick={vi.fn()}
        icon='🚫'
      />,
    );

    expect(screen.getByText('🚫')).toBeInTheDocument();
  });

  it('calls onButtonClick when the button is clicked', async () => {
    const user = userEvent.setup();
    const onButtonClick = vi.fn();

    render(
      <NotFoundState
        title='Not Found'
        message='This item does not exist.'
        buttonText='Go Back'
        onButtonClick={onButtonClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Go Back' }));

    expect(onButtonClick).toHaveBeenCalledTimes(1);
  });
});
