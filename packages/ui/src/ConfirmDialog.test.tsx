import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <ConfirmDialog
        isOpen={false}
        onClose={vi.fn()}
        title='Delete item'
        message='Are you sure?'
      />,
    );

    expect(screen.queryByText('Delete item')).not.toBeInTheDocument();
  });

  it('renders title and message when open', () => {
    render(
      <ConfirmDialog
        isOpen
        onClose={vi.fn()}
        title='Delete item'
        message='Are you sure?'
      />,
    );

    expect(screen.getByText('Delete item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('calls onClose when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ConfirmDialog
        isOpen
        onClose={onClose}
        title='Delete item'
        message='Are you sure?'
        cancelText='Cancel'
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        isOpen
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title='Delete item'
        message='Are you sure?'
        confirmText='Delete'
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables buttons and shows a spinner when isLoading is true', () => {
    render(
      <ConfirmDialog
        isOpen
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title='Delete item'
        message='Are you sure?'
        confirmText='Delete'
        cancelText='Cancel'
        isLoading
      />,
    );

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Delete/ })).toBeDisabled();
  });
});
