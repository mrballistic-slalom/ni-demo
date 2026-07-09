import { Genre } from '@/types';

export interface GenreSkin {
  palette: {
    bg: string;            // page background (may be a gradient)
    surface: string;       // panels/cards
    primary: string;       // main accent
    accent: string;        // secondary highlight
    cellOn: string;
    cellOff: string;
    glow: string;          // rgba used for bloom/shadows
    text: string;
    textDim: string;
  };
  texture: 'grain' | 'scanlines' | 'paper' | 'chromatic' | 'none';
  geometry: { cellRadius: string; cellGap: string };
  glow: { intensity: number; blur: string };
  motion: { easing: string; hitPop: number };
}

export const SKINS: Record<Genre, GenreSkin> = {
  trap: {
    palette: { bg: 'radial-gradient(circle at 50% 0%, #1A0A0A, #0A0505)', surface: '#160C0C', primary: '#FF1F3D', accent: '#FF6A7A', cellOn: '#FF1F3D', cellOff: '#241315', glow: 'rgba(255,31,61,0.55)', text: '#FFFFFF', textDim: 'rgba(255,255,255,0.55)' },
    texture: 'grain', geometry: { cellRadius: '4px', cellGap: '4px' }, glow: { intensity: 1, blur: '14px' }, motion: { easing: 'cubic-bezier(.2,.9,.2,1)', hitPop: 1.18 },
  },
  lofi: {
    palette: { bg: 'linear-gradient(160deg, #241C10, #14100A)', surface: '#20180E', primary: '#F0B45A', accent: '#FFD98A', cellOn: '#F0B45A', cellOff: '#2A2213', glow: 'rgba(240,180,90,0.4)', text: '#F6ECD9', textDim: 'rgba(246,236,217,0.55)' },
    texture: 'paper', geometry: { cellRadius: '9px', cellGap: '5px' }, glow: { intensity: 0.5, blur: '10px' }, motion: { easing: 'cubic-bezier(.4,0,.2,1)', hitPop: 1.08 },
  },
  house: {
    palette: { bg: 'radial-gradient(circle at 50% 10%, #14103A, #06060F)', surface: '#120F26', primary: '#8A5BFF', accent: '#C4A6FF', cellOn: '#8A5BFF', cellOff: '#1A1633', glow: 'rgba(138,91,255,0.55)', text: '#FFFFFF', textDim: 'rgba(255,255,255,0.6)' },
    texture: 'none', geometry: { cellRadius: '6px', cellGap: '4px' }, glow: { intensity: 0.9, blur: '16px' }, motion: { easing: 'cubic-bezier(.3,.8,.3,1)', hitPop: 1.12 },
  },
  drill: {
    palette: { bg: 'linear-gradient(180deg, #0A140C, #050A06)', surface: '#0D160F', primary: '#1DE37A', accent: '#7DF7B6', cellOn: '#1DE37A', cellOff: '#12241A', glow: 'rgba(29,227,122,0.45)', text: '#EAFBF0', textDim: 'rgba(234,251,240,0.5)' },
    texture: 'scanlines', geometry: { cellRadius: '2px', cellGap: '3px' }, glow: { intensity: 0.7, blur: '10px' }, motion: { easing: 'cubic-bezier(.5,0,.9,.3)', hitPop: 1.1 },
  },
  hyperpop: {
    palette: { bg: 'linear-gradient(140deg, #2A0E24, #0E0714)', surface: '#22102A', primary: '#FF5FBE', accent: '#67E8F9', cellOn: '#FF5FBE', cellOff: '#2C1730', glow: 'rgba(255,95,190,0.6)', text: '#FFFFFF', textDim: 'rgba(255,255,255,0.6)' },
    texture: 'chromatic', geometry: { cellRadius: '12px', cellGap: '5px' }, glow: { intensity: 1.2, blur: '18px' }, motion: { easing: 'cubic-bezier(.2,1.3,.4,1)', hitPop: 1.28 },
  },
};

export function skinToCssVars(skin: GenreSkin): Record<string, string> {
  const p = skin.palette;
  return {
    '--genre-bg': p.bg,
    '--genre-surface': p.surface,
    '--genre-primary': p.primary,
    '--genre-accent': p.accent,
    '--genre-cell-on': p.cellOn,
    '--genre-cell-off': p.cellOff,
    '--genre-glow': p.glow,
    '--genre-text': p.text,
    '--genre-text-dim': p.textDim,
    '--genre-cell-radius': skin.geometry.cellRadius,
    '--genre-cell-gap': skin.geometry.cellGap,
    '--genre-glow-blur': skin.glow.blur,
  };
}

/** Fallback bezier (roughly `ease`) used if a skin's easing string can't be parsed. */
const FALLBACK_BEZIER: [number, number, number, number] = [0.4, 0, 0.2, 1];

/**
 * Every `GenreSkin.motion.easing` is authored as a CSS
 * `cubic-bezier(x1,y1,x2,y2)` string (for use directly in CSS
 * `transition`s), but Motion's `ease` transition option wants the four
 * numbers as a tuple, not a CSS function string. This converts one to the
 * other so the same skin-authored easing can drive both CSS transitions
 * and Motion `animate`/`whileTap` transitions.
 */
export function skinEasingToBezier(easing: string): [number, number, number, number] {
  const match = easing.match(/cubic-bezier\(([^)]+)\)/);
  if (!match) return FALLBACK_BEZIER;
  const parts = match[1].split(',').map((n) => parseFloat(n.trim()));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return FALLBACK_BEZIER;
  return parts as [number, number, number, number];
}
