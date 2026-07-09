import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import SoundBrowser from '../SoundBrowser';
import { useGridStore } from '@/stores/useGridStore';
import type { TrackCategory } from '@/types';

/**
 * A pending `swapSound` invocation, held open until the test explicitly
 * resolves it, so we can script exactly which promise settles first.
 */
interface PendingSwap {
  track: TrackCategory;
  soundId: string;
  resolve: () => void;
}

let pendingSwaps: PendingSwap[] = [];

// Mirrors the real `swapSound` in one respect that matters for this bug:
// the grid store's `sounds` entry is only written once the returned
// promise resolves, never synchronously.
const swapSoundMock = vi.fn((track: TrackCategory, soundId: string) => {
  return new Promise<void>((resolve) => {
    pendingSwaps.push({
      track,
      soundId,
      resolve: () => {
        useGridStore.getState().setSound(track, soundId);
        resolve();
      },
    });
  });
});

vi.mock('@/audio/soundLoader', () => ({
  swapSound: (track: TrackCategory, soundId: string) => swapSoundMock(track, soundId),
}));

vi.mock('@/audio/synthKit', () => ({
  getVoice: vi.fn(() => undefined),
}));

/** Resolves the oldest pending `swapSound` call for `soundId`, applying its deferred store write. */
async function resolveSwap(soundId: string) {
  const idx = pendingSwaps.findIndex((p) => p.soundId === soundId);
  if (idx === -1) throw new Error(`No pending swapSound call for "${soundId}"`);
  const [entry] = pendingSwaps.splice(idx, 1);
  await act(async () => {
    entry.resolve();
    // Flush the microtask queue so the component's `await swapSound(...)`
    // continuation (the generation check) actually runs.
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('SoundBrowser', () => {
  beforeEach(() => {
    pendingSwaps = [];
    swapSoundMock.mockClear();
    useGridStore.setState((state) => ({
      genre: 'trap',
      sounds: { ...state.sounds, kick: 'trap_kick_01' },
    }));
  });

  it('reverts to the original sound on dismiss, even when the preview swap is still in flight', async () => {
    const onClose = vi.fn();
    render(<SoundBrowser open onClose={onClose} track="kick" />);

    expect(useGridStore.getState().sounds.kick).toBe('trap_kick_01');

    // Tap a variant. This starts an in-flight swapSound(kick, trap_kick_02)
    // whose store write has not landed yet.
    fireEvent.click(screen.getByRole('button', { name: 'Preview Trap Punchy Kick' }));
    expect(useGridStore.getState().sounds.kick).toBe('trap_kick_01');

    // Dismiss (backdrop tap) before the preview's swap resolves.
    fireEvent.click(screen.getByTestId('bottom-sheet-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Script the race: the dismiss's own revert swap lands first, then the
    // stale preview swap resolves *after* it -- the exact ordering that
    // used to permanently commit the unconfirmed preview.
    await resolveSwap('trap_kick_01');
    await resolveSwap('trap_kick_02');

    // The stale preview's continuation detects the generation mismatch and
    // fires its own corrective swap back to the original -- resolve that
    // too before asserting the final state.
    await resolveSwap('trap_kick_01');

    await waitFor(() => expect(useGridStore.getState().sounds.kick).toBe('trap_kick_01'));
  });

  it('keeps the newly previewed sound when the user confirms', async () => {
    const onClose = vi.fn();
    render(<SoundBrowser open onClose={onClose} track="kick" />);

    fireEvent.click(screen.getByRole('button', { name: 'Preview Trap Punchy Kick' }));
    await resolveSwap('trap_kick_02');

    expect(useGridStore.getState().sounds.kick).toBe('trap_kick_02');

    fireEvent.click(screen.getByRole('button', { name: 'Use this sound' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await waitFor(() => expect(useGridStore.getState().sounds.kick).toBe('trap_kick_02'));
  });
});
