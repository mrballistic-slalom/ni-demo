import { describe, it, expect } from 'vitest';
import { audioBufferToWav, AudioBufferLike } from '@/lib/wav';

/** Builds a minimal {@link AudioBufferLike} from per-channel Float32 sample arrays. */
function makeBuffer(channels: number[][], sampleRate = 44100): AudioBufferLike {
  return {
    numberOfChannels: channels.length,
    sampleRate,
    length: channels[0].length,
    getChannelData: (ch: number) => new Float32Array(channels[ch]),
  };
}

/** Reads a fixed-length ASCII string out of a DataView. */
function readAscii(view: DataView, offset: number, length: number): string {
  let s = '';
  for (let i = 0; i < length; i++) s += String.fromCharCode(view.getUint8(offset + i));
  return s;
}

describe('audioBufferToWav', () => {
  it('writes the RIFF/WAVE/fmt /data chunk markers at the correct offsets', () => {
    const wav = audioBufferToWav(makeBuffer([[0, 0, 0]]));
    const view = new DataView(wav);

    expect(readAscii(view, 0, 4)).toBe('RIFF');
    expect(readAscii(view, 8, 4)).toBe('WAVE');
    expect(readAscii(view, 12, 4)).toBe('fmt ');
    expect(readAscii(view, 36, 4)).toBe('data');
  });

  it('writes sampleRate, channel count, and bitsPerSample=16 correctly for mono', () => {
    const wav = audioBufferToWav(makeBuffer([[0, 0]], 44100));
    const view = new DataView(wav);

    expect(view.getUint16(20, true)).toBe(1); // PCM format tag
    expect(view.getUint16(22, true)).toBe(1); // numChannels
    expect(view.getUint32(24, true)).toBe(44100); // sampleRate
    expect(view.getUint16(34, true)).toBe(16); // bitsPerSample
  });

  it('writes sampleRate, channel count, and bitsPerSample=16 correctly for stereo', () => {
    const wav = audioBufferToWav(makeBuffer([[0, 0], [0, 0]], 48000));
    const view = new DataView(wav);

    expect(view.getUint16(22, true)).toBe(2); // numChannels
    expect(view.getUint32(24, true)).toBe(48000); // sampleRate
    expect(view.getUint16(34, true)).toBe(16); // bitsPerSample
  });

  it('computes RIFF/data chunk sizes and total byte length correctly', () => {
    const numSamples = 10;
    const channels = 2;
    const wav = audioBufferToWav(
      makeBuffer([new Array(numSamples).fill(0), new Array(numSamples).fill(0)])
    );
    const view = new DataView(wav);
    const expectedDataSize = numSamples * channels * 2;

    expect(wav.byteLength).toBe(44 + expectedDataSize);
    expect(view.getUint32(40, true)).toBe(expectedDataSize); // data subchunk size
    expect(view.getUint32(4, true)).toBe(36 + expectedDataSize); // RIFF chunk size
  });

  it('maps a known Float32 input to the correct 16-bit PCM values', () => {
    const wav = audioBufferToWav(makeBuffer([[1, -1, 0]]));
    const view = new DataView(wav);

    expect(view.getInt16(44, true)).toBe(32767);
    expect(view.getInt16(46, true)).toBe(-32768);
    expect(view.getInt16(48, true)).toBe(0);
  });

  it('interleaves stereo channels frame-by-frame (L, R, L, R, ...)', () => {
    const wav = audioBufferToWav(makeBuffer([[1, 0.5], [-1, -0.5]]));
    const view = new DataView(wav);

    // frame 0: left, right
    expect(view.getInt16(44, true)).toBe(32767);
    expect(view.getInt16(46, true)).toBe(-32768);
    // frame 1: left, right
    expect(view.getInt16(48, true)).toBe(16384);
    expect(view.getInt16(50, true)).toBe(-16384);
  });

  it('clamps out-of-range samples instead of wrapping', () => {
    const wav = audioBufferToWav(makeBuffer([[2, -2]]));
    const view = new DataView(wav);

    expect(view.getInt16(44, true)).toBe(32767);
    expect(view.getInt16(46, true)).toBe(-32768);
  });
});
