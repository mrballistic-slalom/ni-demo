import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BottomSheet from '../BottomSheet';

describe('BottomSheet', () => {
  it('does not render the dialog when closed', () => {
    render(
      <BottomSheet open={false} onClose={() => {}} title="Sounds">
        <p>Content</p>
      </BottomSheet>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog with its content when open', () => {
    render(
      <BottomSheet open onClose={() => {}} title="Sounds">
        <p>Content</p>
      </BottomSheet>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose} title="Sounds">
        <p>Content</p>
      </BottomSheet>
    );

    fireEvent.click(screen.getByTestId('bottom-sheet-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose} title="Sounds">
        <p>Content</p>
      </BottomSheet>
    );

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
