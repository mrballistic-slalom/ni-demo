import { Genre } from '@/types';

/** Color palette for a genre, used to style the grid, playhead, and UI elements. */
export interface GenreTheme {
  primary: string;
  secondary: string;
  accent: string;
  cellActive: string;
  cellInactive: string;
  playhead: string;
  background: string;
}

/** Genre-specific color themes keyed by genre ID, applied to the sequencer UI when a genre is selected. */
export const GENRE_THEMES: Record<Genre, GenreTheme> = {
  trap: {
    primary: '#FF1744',
    secondary: '#1A0A0A',
    accent: '#FF5252',
    cellActive: '#FF1744',
    cellInactive: '#2A1515',
    playhead: 'rgba(255, 23, 68, 0.3)',
    background: '#0D0505',
  },
  lofi: {
    primary: '#FFB74D',
    secondary: '#1A150A',
    accent: '#FFD54F',
    cellActive: '#FFB74D',
    cellInactive: '#2A2415',
    playhead: 'rgba(255, 183, 77, 0.3)',
    background: '#0D0A05',
  },
  house: {
    primary: '#7C4DFF',
    secondary: '#0A0A1A',
    accent: '#B388FF',
    cellActive: '#7C4DFF',
    cellInactive: '#15152A',
    playhead: 'rgba(124, 77, 255, 0.3)',
    background: '#05050D',
  },
  drill: {
    primary: '#00E676',
    secondary: '#0A1A0A',
    accent: '#69F0AE',
    cellActive: '#00E676',
    cellInactive: '#152A15',
    playhead: 'rgba(0, 230, 118, 0.3)',
    background: '#050D05',
  },
  hyperpop: {
    primary: '#FF4081',
    secondary: '#1A0A14',
    accent: '#FF80AB',
    cellActive: '#FF4081',
    cellInactive: '#2A1520',
    playhead: 'rgba(255, 64, 129, 0.3)',
    background: '#0D0508',
  },
};
