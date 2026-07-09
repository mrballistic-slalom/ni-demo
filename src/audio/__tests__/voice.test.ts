import { describe, it, expect, vi } from 'vitest';

vi.mock('@/audio/tone', () => {
  const fake = () => ({ toDestination() { return this; }, connect() { return this; }, dispose() {}, start() {}, triggerAttackRelease() {}, loaded: true, volume: { value: 0 } });
  return { getTone: () => ({
    Player: function(){ return fake(); },
    MonoSynth: function(){ return fake(); },
    FMSynth: function(){ return fake(); },
    PolySynth: function(){ return fake(); },
    gainToDb: (x:number)=>x,
  }) };
});

import { createVoice } from '@/audio/voice';

describe('createVoice', () => {
  it('builds a sample voice', () => {
    const v = createVoice({ kind: 'sample', url: '/x.wav' });
    expect(typeof v.trigger).toBe('function');
    expect(() => v.trigger(0)).not.toThrow();
  });

  it('builds a synth voice and forwards a note', () => {
    const v = createVoice({ kind: 'synth', synth: 'mono808', options: {} });
    expect(() => v.trigger(0, 'C2')).not.toThrow();
  });

  it('builds an fm synth voice', () => {
    const v = createVoice({ kind: 'synth', synth: 'fm', options: {} });
    expect(() => v.trigger(0, 'E4')).not.toThrow();
  });

  it('builds a poly synth voice', () => {
    const v = createVoice({ kind: 'synth', synth: 'poly', options: {} });
    expect(() => v.trigger(0, 'G3')).not.toThrow();
  });

  it('uses a default note when none is provided for a synth voice', () => {
    const v = createVoice({ kind: 'synth', synth: 'mono808', options: {} });
    expect(() => v.trigger(0)).not.toThrow();
  });

  it('exposes output, ready, and dispose on a sample voice', () => {
    const v = createVoice({ kind: 'sample', url: '/x.wav' });
    expect(v.output).toBeDefined();
    expect(v.ready).toBe(true);
    expect(() => v.dispose()).not.toThrow();
  });

  it('exposes output, ready, and dispose on a synth voice', () => {
    const v = createVoice({ kind: 'synth', synth: 'poly', options: {} });
    expect(v.output).toBeDefined();
    expect(v.ready).toBe(true);
    expect(() => v.dispose()).not.toThrow();
  });

  it('applies portamento for a mono808 synth voice', () => {
    const v = createVoice({ kind: 'synth', synth: 'mono808', options: {}, portamento: 0.05 });
    expect(() => v.trigger(0, 'C2', 0.8)).not.toThrow();
  });

  it('throws for an unknown synth kind', () => {
    expect(() =>
      // @ts-expect-error - intentionally invalid synth kind for coverage of the default branch
      createVoice({ kind: 'synth', synth: 'nope', options: {} })
    ).toThrow();
  });
});
