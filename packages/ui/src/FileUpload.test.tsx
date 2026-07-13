import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import FileUpload from './FileUpload';

describe('FileUpload', () => {
  it('renders the upload prompt when no file is selected', () => {
    render(
      <FileUpload
        file={null}
        onFileChange={vi.fn()}
        onFileRemove={vi.fn()}
        label='Upload receipt'
      />,
    );

    expect(screen.getByText('Upload receipt')).toBeInTheDocument();
  });

  it('renders the selected file name and size', () => {
    const file = new File(['content'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    render(
      <FileUpload file={file} onFileChange={vi.fn()} onFileRemove={vi.fn()} />,
    );

    expect(screen.getByText('receipt.pdf')).toBeInTheDocument();
  });

  it('calls onFileRemove when the remove button is clicked', async () => {
    const user = userEvent.setup();
    const onFileRemove = vi.fn();
    const file = new File(['content'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    render(
      <FileUpload
        file={file}
        onFileChange={vi.fn()}
        onFileRemove={onFileRemove}
      />,
    );

    await user.click(screen.getByTitle('Remove file'));

    expect(onFileRemove).toHaveBeenCalledTimes(1);
  });

  it('calls onFileChange with a valid selected file', async () => {
    const user = userEvent.setup();
    const onFileChange = vi.fn();
    const file = new File(['content'], 'receipt.pdf', {
      type: 'application/pdf',
    });

    render(
      <FileUpload
        file={null}
        onFileChange={onFileChange}
        onFileRemove={vi.fn()}
        accept='.pdf'
        label='Upload receipt'
      />,
    );

    const input = screen.getByLabelText('Upload receipt', {
      selector: 'input',
    }) as HTMLInputElement;

    await user.upload(input, file);

    expect(onFileChange).toHaveBeenCalledWith(file);
  });

  it('shows the loading overlay when isLoading is true', () => {
    render(
      <FileUpload
        file={null}
        onFileChange={vi.fn()}
        onFileRemove={vi.fn()}
        isLoading
        loadingMessage='Uploading receipt...'
      />,
    );

    expect(screen.getByText('Uploading receipt...')).toBeInTheDocument();
  });
});
