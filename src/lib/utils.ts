import { nanoid } from 'nanoid';
import { Genre, GridState, SoundSelections, TrackVolumes, TrackCategory, TRACK_ORDER } from '@/types';

export function generateShareId(): string {
  return nanoid(8);
}

export function formatBPM(bpm: number): string {
  return `${Math.round(bpm)} BPM`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// --- URL-based beat sharing ---

interface BeatShareState {
  genre: Genre;
  bpm: number;
  grid: GridState;
  sounds: SoundSelections;
  volumes: TrackVolumes;
}

interface CompactBeatData {
  g: Genre;
  b: number;
  gr: Record<string, string>;
  s: SoundSelections;
  v: TrackVolumes;
}

/**
 * Convert grid rows (arrays of 0/1) to compact binary strings.
 * e.g., [1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0] -> "1001001000100100"
 */
function gridToBinaryStrings(grid: GridState): Record<string, string> {
  const result: Record<string, string> = {};
  for (const track of TRACK_ORDER) {
    result[track] = grid[track].map((v) => (v ? '1' : '0')).join('');
  }
  return result;
}

/**
 * Convert compact binary strings back to grid rows.
 */
function binaryStringsToGrid(compact: Record<string, string>): GridState {
  const grid = {} as GridState;
  for (const track of TRACK_ORDER) {
    const str = compact[track as TrackCategory];
    if (!str) {
      grid[track as TrackCategory] = new Array(16).fill(0);
    } else {
      grid[track as TrackCategory] = str.split('').map((c) => (c === '1' ? 1 : 0));
    }
  }
  return grid;
}

/**
 * Encode a beat state into a URL-safe base64 string and return a path.
 * Returns a URL path like `/beat?b=<encoded>`.
 */
export function encodeBeatToUrl(state: BeatShareState): string {
  const compact: CompactBeatData = {
    g: state.genre,
    b: state.bpm,
    gr: gridToBinaryStrings(state.grid),
    s: state.sounds,
    v: state.volumes,
  };

  const json = JSON.stringify(compact);
  const encoded = btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}/beat?b=${encoded}`;
}

/**
 * Decode a base64 URL-safe string back into a beat state object.
 * Returns null if the input is invalid or cannot be parsed.
 */
export function decodeBeatFromUrl(encoded: string): BeatShareState | null {
  try {
    // Restore standard base64 from URL-safe variant
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add back padding
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const json = atob(base64);
    const compact: CompactBeatData = JSON.parse(json);

    // Validate required fields
    if (!compact.g || !compact.b || !compact.gr || !compact.s || !compact.v) {
      return null;
    }

    return {
      genre: compact.g,
      bpm: compact.b,
      grid: binaryStringsToGrid(compact.gr),
      sounds: compact.s,
      volumes: compact.v,
    };
  } catch {
    return null;
  }
}
