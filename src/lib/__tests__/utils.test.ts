import { describe, it, expect } from 'vitest';
import { encodeBeatToUrl, decodeBeatFromUrl, formatBPM, clamp } from '@/lib/utils';
import { TRACK_ORDER, GridState, SoundSelections, TrackVolumes } from '@/types';

function buildGrid(): GridState {
  const grid = {} as GridState;
  for (const track of TRACK_ORDER) {
    grid[track] = new Array(16).fill(0).map((_, i) => (i % 4 === 0 ? 1 : 0));
  }
  return grid;
}

function buildSounds(): SoundSelections {
  const sounds = {} as SoundSelections;
  for (const track of TRACK_ORDER) sounds[track] = `${track}-808`;
  return sounds;
}

function buildVolumes(): TrackVolumes {
  const volumes = {} as TrackVolumes;
  for (const track of TRACK_ORDER) volumes[track] = 0.8;
  return volumes;
}

describe('utils', () => {
  describe('formatBPM', () => {
    it('rounds and appends BPM suffix', () => {
      expect(formatBPM(119.6)).toBe('120 BPM');
    });
  });

  describe('clamp', () => {
    it('returns the value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });
    it('clamps below the minimum', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });
    it('clamps above the maximum', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('encodeBeatToUrl / decodeBeatFromUrl', () => {
    it('round-trips a full beat state', () => {
      const state = {
        genre: 'trap' as const,
        bpm: 140,
        grid: buildGrid(),
        sounds: buildSounds(),
        volumes: buildVolumes(),
      };

      const url = encodeBeatToUrl(state);
      expect(url).toMatch(/^\/beat\?b=/);

      const encoded = url.replace('/beat?b=', '');
      const decoded = decodeBeatFromUrl(encoded);

      expect(decoded).not.toBeNull();
      expect(decoded?.genre).toBe(state.genre);
      expect(decoded?.bpm).toBe(state.bpm);
      expect(decoded?.sounds).toEqual(state.sounds);
      expect(decoded?.volumes).toEqual(state.volumes);
      for (const track of TRACK_ORDER) {
        expect(decoded?.grid[track]).toEqual(state.grid[track]);
      }
    });

    it('fills missing track rows with zeros when a track is absent from the compact grid', () => {
      const state = {
        genre: 'lofi' as const,
        bpm: 90,
        grid: buildGrid(),
        sounds: buildSounds(),
        volumes: buildVolumes(),
      };

      const url = encodeBeatToUrl(state);
      const encoded = url.replace('/beat?b=', '');

      // Manually decode, strip one track's row, and re-encode to exercise the
      // "missing binary string" fallback branch in binaryStringsToGrid.
      let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4 !== 0) base64 += '=';
      const compact = JSON.parse(atob(base64));
      delete compact.gr.fx;
      const strippedJson = JSON.stringify(compact);
      const strippedEncoded = btoa(strippedJson)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const decoded = decodeBeatFromUrl(strippedEncoded);
      expect(decoded).not.toBeNull();
      expect(decoded?.grid.fx).toEqual(new Array(16).fill(0));
    });

    it('returns null for malformed base64/JSON input', () => {
      expect(decodeBeatFromUrl('%%%not-valid%%%')).toBeNull();
    });

    it('returns null when decoded object is empty', () => {
      const encoded = btoa(JSON.stringify({})).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      expect(decodeBeatFromUrl(encoded)).toBeNull();
    });

    it('returns null when required fields are missing (partial object)', () => {
      const partial1 = { g: 'trap', b: 140, gr: { kick: '1000' } }; // missing s, v
      const encoded1 = btoa(JSON.stringify(partial1)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      expect(decodeBeatFromUrl(encoded1)).toBeNull();

      const partial2 = { g: 'trap', gr: {}, s: {}, v: {} }; // missing b
      const encoded2 = btoa(JSON.stringify(partial2)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      expect(decodeBeatFromUrl(encoded2)).toBeNull();

      const partial3 = { b: 140, gr: {}, s: {}, v: {} }; // missing g
      const encoded3 = btoa(JSON.stringify(partial3)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      expect(decodeBeatFromUrl(encoded3)).toBeNull();
    });
  });
});
