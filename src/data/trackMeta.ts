import { Drum, Disc, Disc3, Piano, Guitar, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { TrackCategory } from '@/types';

/**
 * Short display label for each track category. Shared by {@link StepGrid}
 * (grid row labels) and {@link TrackControls} (mixer rows) so the two views
 * of the same track never drift out of sync.
 */
export const TRACK_LABELS: Record<TrackCategory, string> = {
  kick: 'KICK',
  snare: 'SNARE',
  hihat: 'HI-HAT',
  melody: 'MELODY',
  bass: 'BASS',
  fx: 'FX',
};

/**
 * Icon representing each track category. Shared by {@link StepGrid} and
 * {@link TrackControls}.
 */
export const TRACK_ICONS: Record<TrackCategory, LucideIcon> = {
  kick: Drum,
  snare: Disc,
  hihat: Disc3,
  melody: Piano,
  bass: Guitar,
  fx: Sparkles,
};
