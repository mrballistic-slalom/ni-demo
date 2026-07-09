import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Fader from '../Fader';

describe('Fader', () => {
  it('renders a range input with the given aria-label and value', () => {
    render(<Fader value={120} min={60} max={200} onChange={() => {}} ariaLabel="BPM" />);
    const input = screen.getByRole('slider', { name: 'BPM' });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('120');
  });

  it('calls onChange with a number when the value changes', () => {
    const onChange = vi.fn();
    render(<Fader value={50} min={0} max={100} onChange={onChange} ariaLabel="Volume" />);

    const input = screen.getByRole('slider', { name: 'Volume' });
    fireEvent.change(input, { target: { value: '80' } });

    expect(onChange).toHaveBeenCalledWith(80);
  });

  it('sets aria-orientation to vertical when orientation is vertical', () => {
    render(
      <Fader value={0} onChange={() => {}} ariaLabel="Track volume" orientation="vertical" />
    );
    expect(screen.getByRole('slider', { name: 'Track volume' })).toHaveAttribute(
      'aria-orientation',
      'vertical'
    );
  });

  it('disables the input when disabled is true', () => {
    render(<Fader value={0} onChange={() => {}} ariaLabel="Volume" disabled />);
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeDisabled();
  });
});
