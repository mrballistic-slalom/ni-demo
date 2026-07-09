import { describe, it, expect } from 'vitest';
import { encodeWAV, synthKick, synthSnare, synthHat, synthFx } from '../renderSounds.mjs';

const rms = a => Math.sqrt(a.reduce((n,x)=>n+x*x,0)/a.length);
const peak = a => Math.max(...Array.from(a, Math.abs));

const GENRES = ['trap', 'lofi', 'house', 'drill', 'hyperpop'];

describe('renderSounds DSP', () => {
  it('encodes a valid WAV header', () => {
    const buf = encodeWAV(new Float32Array(1000));
    expect(buf.slice(0,4).toString('ascii')).toBe('RIFF');
    expect(buf.slice(8,12).toString('ascii')).toBe('WAVE');
  });
  it('kick is non-silent and decays', () => {
    const s = synthKick({ genre: 'trap', variant: 1 });
    expect(peak(s)).toBeGreaterThan(0.1);
    expect(rms(s.slice(-s.length/4))).toBeLessThan(rms(s.slice(0, s.length/4)));
  });
  it('snare, hat, fx are non-silent for every genre', () => {
    for (const genre of GENRES) {
      expect(peak(synthSnare({ genre, variant: 1 }))).toBeGreaterThan(0.05);
      expect(peak(synthHat({ genre, variant: 1 }))).toBeGreaterThan(0.05);
      expect(peak(synthFx({ genre, variant: 1 }))).toBeGreaterThan(0.02);
    }
  });
  it('variants differ', () => {
    const a = synthKick({ genre: 'trap', variant: 1 });
    const b = synthKick({ genre: 'trap', variant: 3 });
    expect(peak(a)).not.toBe(peak(b));
  });

  it('kick decays and is non-silent across every genre', () => {
    for (const genre of GENRES) {
      const s = synthKick({ genre, variant: 2 });
      expect(peak(s)).toBeGreaterThan(0.1);
      expect(rms(s.slice(-s.length/4))).toBeLessThan(rms(s.slice(0, s.length/4)));
    }
  });

  it('snare, hat, fx variants differ within a genre', () => {
    const s1 = synthSnare({ genre: 'house', variant: 1 });
    const s2 = synthSnare({ genre: 'house', variant: 3 });
    expect(peak(s1)).not.toBe(peak(s2));

    const h1 = synthHat({ genre: 'drill', variant: 1 });
    const h2 = synthHat({ genre: 'drill', variant: 3 });
    expect(peak(h1)).not.toBe(peak(h2));

    const f1 = synthFx({ genre: 'hyperpop', variant: 1 });
    const f2 = synthFx({ genre: 'hyperpop', variant: 3 });
    expect(peak(f1)).not.toBe(peak(f2));
  });

  it('hat decays over its length', () => {
    const h = synthHat({ genre: 'trap', variant: 1 });
    expect(rms(h.slice(-h.length/4))).toBeLessThan(rms(h.slice(0, h.length/4)));
  });

  it('all synth outputs are finite (no NaN/Infinity from filters)', () => {
    for (const genre of GENRES) {
      for (const fn of [synthKick, synthSnare, synthHat, synthFx]) {
        const s = fn({ genre, variant: 1 });
        expect(s.every(Number.isFinite)).toBe(true);
        expect(peak(s)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('encodeWAV output size matches sample count (16-bit mono PCM + 44 byte header)', () => {
    const samples = new Float32Array(500).fill(0.5);
    const buf = encodeWAV(samples);
    expect(buf.length).toBe(44 + 500 * 2);
    expect(buf.readUInt16LE(22)).toBe(1); // mono
    expect(buf.readUInt16LE(34)).toBe(16); // bits per sample
  });
});
