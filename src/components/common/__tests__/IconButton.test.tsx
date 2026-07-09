import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Play } from 'lucide-react';
import IconButton from '../IconButton';

describe('IconButton', () => {
  it('renders with the given aria-label', () => {
    render(<IconButton icon={Play} label="Play beat" onClick={() => {}} />);
    expect(screen.getByRole('button', { name: 'Play beat' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<IconButton icon={Play} label="Play beat" onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Play beat' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<IconButton icon={Play} label="Play beat" onClick={onClick} disabled />);

    fireEvent.click(screen.getByRole('button', { name: 'Play beat' }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('reflects the active state via aria-pressed', () => {
    render(<IconButton icon={Play} label="Play beat" onClick={() => {}} active />);
    expect(screen.getByRole('button', { name: 'Play beat' })).toHaveAttribute('aria-pressed', 'true');
  });
});
