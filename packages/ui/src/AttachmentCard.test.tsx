import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AttachmentCard from './AttachmentCard';

describe('AttachmentCard', () => {
  const defaultProps = {
    url: 'https://example.com/file.pdf',
    filename: 'file.pdf',
    originalName: 'My Document.pdf',
    onDelete: vi.fn(),
    canDelete: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the attachment name', () => {
    render(<AttachmentCard {...defaultProps} />);

    expect(screen.getByText('My Document.pdf')).toBeInTheDocument();
  });

  it('renders file size when provided', () => {
    render(<AttachmentCard {...defaultProps} size={2048} />);

    expect(screen.getByText('2 KB')).toBeInTheDocument();
  });

  it('does not render file size when not provided', () => {
    render(<AttachmentCard {...defaultProps} />);

    expect(screen.queryByText(/KB|MB|GB|Bytes/)).not.toBeInTheDocument();
  });

  it('renders upload date when provided', () => {
    render(
      <AttachmentCard {...defaultProps} uploadDate={new Date('2025-01-15')} />,
    );

    expect(screen.getByTitle('My Document.pdf')).toBeInTheDocument();
  });

  it('calls onPreview when preview button is clicked', () => {
    const onPreview = vi.fn();
    render(<AttachmentCard {...defaultProps} onPreview={onPreview} />);

    fireEvent.click(screen.getByTitle('Open file'));

    expect(onPreview).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked and canDelete is true', () => {
    const onDelete = vi.fn();
    render(
      <AttachmentCard {...defaultProps} onDelete={onDelete} canDelete={true} />,
    );

    fireEvent.click(screen.getByTitle('Delete attachment'));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('does not render delete button when canDelete is false', () => {
    render(<AttachmentCard {...defaultProps} canDelete={false} />);

    expect(screen.queryByTitle('Delete attachment')).not.toBeInTheDocument();
  });

  it('shows a spinner instead of the trash icon while deleting', () => {
    const { container } = render(
      <AttachmentCard {...defaultProps} isDeleting={true} />,
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('disables the preview button when disabled prop is true', () => {
    render(<AttachmentCard {...defaultProps} disabled={true} />);

    expect(screen.getByTitle('Open file')).toBeDisabled();
  });
});
