import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ImageCropModal from './ImageCropModal';

vi.mock('react-easy-crop', () => ({
  default: () => <div data-testid='cropper' />,
}));

describe('ImageCropModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <ImageCropModal
        isOpen={false}
        onClose={vi.fn()}
        imageSrc='blob:test'
        onCropComplete={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('cropper')).not.toBeInTheDocument();
  });

  it('renders the title and cropper when open', () => {
    render(
      <ImageCropModal
        isOpen
        onClose={vi.fn()}
        imageSrc='blob:test'
        onCropComplete={vi.fn()}
        title='Crop Photo'
      />,
    );

    expect(screen.getByText('Crop Photo')).toBeInTheDocument();
    expect(screen.getByTestId('cropper')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ImageCropModal
        isOpen
        onClose={onClose}
        imageSrc='blob:test'
        onCropComplete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: /close crop modal/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables the save button until a crop area is available', () => {
    render(
      <ImageCropModal
        isOpen
        onClose={vi.fn()}
        imageSrc='blob:test'
        onCropComplete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: /Save Cropped Image/i }),
    ).toBeDisabled();
  });
});
