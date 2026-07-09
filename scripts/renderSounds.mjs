import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_RATE = 44100;

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

/** White noise buffer of `n` samples in [-1, 1]. */
function noise(n) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = Math.random() * 2 - 1;
  return out;
}

/** Soft-clip saturation. `amount` > 1 drives the signal harder into the curve. */
function tanhSat(x, amount = 1) {
  return Math.tanh(x * amount);
}

/** One-pole exponential decay envelope, `rate` in 1/seconds. */
function expDecayEnv(n, rate, sampleRate = SAMPLE_RATE) {
  const env = new Float32Array(n);
  for (let i = 0; i < n; i++) env[i] = Math.exp(-(i / sampleRate) * rate);
  return env;
}

/** One-pole lowpass filter (RC-style), cutoff in Hz. */
function onePoleLowpass(x, cutoffHz, sampleRate = SAMPLE_RATE) {
  const rc = 1 / (2 * Math.PI * Math.max(1, cutoffHz));
  const dt = 1 / sampleRate;
  const alpha = dt / (rc + dt);
  const y = new Float32Array(x.length);
  let prev = 0;
  for (let i = 0; i < x.length; i++) {
    prev = prev + alpha * (x[i] - prev);
    y[i] = prev;
  }
  return y;
}

/** One-pole highpass filter, cutoff in Hz. */
function onePoleHighpass(x, cutoffHz, sampleRate = SAMPLE_RATE) {
  const rc = 1 / (2 * Math.PI * Math.max(1, cutoffHz));
  const dt = 1 / sampleRate;
  const alpha = rc / (rc + dt);
  const y = new Float32Array(x.length);
  let prevX = 0;
  let prevY = 0;
  for (let i = 0; i < x.length; i++) {
    const yi = alpha * (prevY + x[i] - prevX);
    y[i] = yi;
    prevX = x[i];
    prevY = yi;
  }
  return y;
}

/** Bandpass = highpass(lowpass(x)). */
function bandpass(x, lowHz, highHz, sampleRate = SAMPLE_RATE) {
  return onePoleHighpass(onePoleLowpass(x, highHz, sampleRate), lowHz, sampleRate);
}

/** Lowpass whose cutoff sweeps linearly from f0 to f1 across the buffer. Used for fx risers/sweeps. */
function sweepLowpass(x, f0, f1, sampleRate = SAMPLE_RATE) {
  const y = new Float32Array(x.length);
  let prev = 0;
  const dt = 1 / sampleRate;
  for (let i = 0; i < x.length; i++) {
    const frac = x.length > 1 ? i / (x.length - 1) : 0;
    const cutoff = f0 + (f1 - f0) * frac;
    const rc = 1 / (2 * Math.PI * Math.max(1, cutoff));
    const alpha = dt / (rc + dt);
    prev = prev + alpha * (x[i] - prev);
    y[i] = prev;
  }
  return y;
}

// ---------------------------------------------------------------------------
// Per-genre tuning
// ---------------------------------------------------------------------------

const KICK_PARAMS = {
  trap: { f0: 130, f1: 45, pitchTau: 0.07, ampDecay: 4.2, duration: 0.6, click: 0.35, sat: 1.4 },
  house: { f0: 150, f1: 58, pitchTau: 0.025, ampDecay: 9.5, duration: 0.32, click: 0.55, sat: 1.1 },
  lofi: { f0: 105, f1: 50, pitchTau: 0.05, ampDecay: 6, duration: 0.5, click: 0.12, sat: 2.4 },
  drill: { f0: 140, f1: 40, pitchTau: 0.08, ampDecay: 3.8, duration: 0.65, click: 0.4, sat: 1.6 },
  hyperpop: { f0: 185, f1: 72, pitchTau: 0.02, ampDecay: 11, duration: 0.28, click: 0.6, sat: 1.0 },
};

const SNARE_PARAMS = {
  trap: { tone: 200, bpLow: 700, bpHigh: 6000, ampDecay: 9, noiseDecay: 11, toneAmt: 0.35, noiseAmt: 0.85, duration: 0.26, sat: 1.3 },
  house: { tone: 220, bpLow: 1000, bpHigh: 8000, ampDecay: 16, noiseDecay: 18, toneAmt: 0.3, noiseAmt: 0.9, duration: 0.16, sat: 1.1 },
  lofi: { tone: 170, bpLow: 300, bpHigh: 3200, ampDecay: 10, noiseDecay: 12, toneAmt: 0.4, noiseAmt: 0.7, duration: 0.22, sat: 2.0 },
  drill: { tone: 190, bpLow: 650, bpHigh: 5500, ampDecay: 7, noiseDecay: 9, toneAmt: 0.3, noiseAmt: 0.9, duration: 0.3, sat: 1.5 },
  hyperpop: { tone: 260, bpLow: 1500, bpHigh: 10000, ampDecay: 19, noiseDecay: 21, toneAmt: 0.25, noiseAmt: 1.0, duration: 0.15, sat: 1.0 },
};

const HAT_PARAMS = {
  trap: { cutoff: 7000, decay: 38, duration: 0.09, sat: 1.2 },
  house: { cutoff: 8500, decay: 55, duration: 0.05, sat: 1.0 },
  lofi: { cutoff: 5000, decay: 28, duration: 0.1, sat: 1.8 },
  drill: { cutoff: 9200, decay: 62, duration: 0.045, sat: 1.3 },
  hyperpop: { cutoff: 10500, decay: 70, duration: 0.04, sat: 1.0 },
};

const FX_PARAMS = {
  trap: { f0: 300, f1: 6000, duration: 1.0, rising: true, decay: 1.5, sat: 1.2, gain: 0.9 },
  house: { f0: 200, f1: 9000, duration: 1.3, rising: true, decay: 1.2, sat: 1.0, gain: 0.85 },
  lofi: { f0: 200, f1: 2200, duration: 1.1, rising: false, decay: 2.2, sat: 2.0, gain: 0.8 },
  drill: { f0: 8000, f1: 250, duration: 0.7, rising: false, decay: 3.0, sat: 1.6, gain: 0.95 },
  hyperpop: { f0: 500, f1: 12000, duration: 0.6, rising: true, decay: 2.0, sat: 1.0, gain: 0.95 },
};

const GENRES = ['trap', 'lofi', 'house', 'drill', 'hyperpop'];
const VARIANT_FREQ_STEP = 0.05;
const VARIANT_DUR_STEP = 0.06;

// ---------------------------------------------------------------------------
// Instrument synths
// ---------------------------------------------------------------------------

/** Pitch-enveloped layered kick: sine body sweeping f0 -> f1 + a short noise click, saturated. */
function synthKick({ genre, variant = 1 }) {
  const p = KICK_PARAMS[genre] || KICK_PARAMS.trap;
  const freqMult = 1 + (variant - 1) * VARIANT_FREQ_STEP;
  const duration = p.duration * (1 + (variant - 1) * VARIANT_DUR_STEP);
  const n = Math.max(1, Math.floor(SAMPLE_RATE * duration));
  const out = new Float32Array(n);
  const f0 = p.f0 * freqMult;
  const f1 = p.f1;
  const clickLen = Math.floor(SAMPLE_RATE * 0.003);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const freq = f1 + (f0 - f1) * Math.exp(-t / p.pitchTau);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const body = Math.sin(phase);
    const ampEnv = Math.exp(-t * p.ampDecay);
    const click = i < clickLen ? (Math.random() * 2 - 1) * (1 - i / clickLen) * p.click : 0;
    out[i] = tanhSat(body * ampEnv + click, p.sat);
  }
  return out;
}

/** Bandpassed noise body + tuned tone, genre-tuned brightness/decay. */
function synthSnare({ genre, variant = 1 }) {
  const p = SNARE_PARAMS[genre] || SNARE_PARAMS.trap;
  const freqMult = 1 + (variant - 1) * VARIANT_FREQ_STEP;
  const duration = p.duration * (1 + (variant - 1) * VARIANT_DUR_STEP);
  const n = Math.max(1, Math.floor(SAMPLE_RATE * duration));
  const rawNoise = noise(n);
  const filteredNoise = bandpass(rawNoise, p.bpLow * freqMult, p.bpHigh * freqMult);
  const noiseEnv = expDecayEnv(n, p.noiseDecay);
  const out = new Float32Array(n);
  let phase = 0;
  const toneFreq = p.tone * freqMult;
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    phase += (2 * Math.PI * toneFreq) / SAMPLE_RATE;
    const tone = Math.sin(phase) * Math.exp(-t * p.ampDecay * 1.4);
    const val = tone * p.toneAmt + filteredNoise[i] * noiseEnv[i] * p.noiseAmt;
    out[i] = tanhSat(val, p.sat);
  }
  return out;
}

/** Highpassed noise, very short — genre varies brightness (cutoff) and decay. */
function synthHat({ genre, variant = 1 }) {
  const p = HAT_PARAMS[genre] || HAT_PARAMS.trap;
  const freqMult = 1 + (variant - 1) * VARIANT_FREQ_STEP;
  const duration = p.duration * (1 + (variant - 1) * VARIANT_DUR_STEP);
  const n = Math.max(1, Math.floor(SAMPLE_RATE * duration));
  const raw = noise(n);
  const filtered = onePoleHighpass(raw, p.cutoff * freqMult);
  const env = expDecayEnv(n, p.decay);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = tanhSat(filtered[i] * env[i], p.sat);
  }
  return out;
}

/** Filtered-noise sweep / riser used for genre fx one-shots. */
function synthFx({ genre, variant = 1 }) {
  const p = FX_PARAMS[genre] || FX_PARAMS.trap;
  const freqMult = 1 + (variant - 1) * VARIANT_FREQ_STEP;
  const duration = p.duration * (1 + (variant - 1) * VARIANT_DUR_STEP);
  const n = Math.max(1, Math.floor(SAMPLE_RATE * duration));
  const raw = noise(n);
  const swept = p.rising
    ? sweepLowpass(raw, p.f0 * freqMult, p.f1)
    : sweepLowpass(raw, p.f1 * freqMult, p.f0);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const ampEnv = p.rising ? Math.min(1, t / (duration * 0.6)) * Math.exp(-t * (p.decay * 0.3)) : Math.exp(-t * p.decay);
    out[i] = tanhSat(swept[i] * ampEnv * p.gain, p.sat);
  }
  return out;
}

// ---------------------------------------------------------------------------
// WAV encoding
// ---------------------------------------------------------------------------

/** 16-bit PCM mono WAV encoder. */
function encodeWAV(samples) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * numChannels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s * 32767), 44 + i * 2);
  }
  return buffer;
}

// ---------------------------------------------------------------------------
// Main run block (file I/O) — guarded so importing this module for tests
// does not write anything to disk.
// ---------------------------------------------------------------------------

const CATEGORY_SYNTHS = {
  kick: synthKick,
  snare: synthSnare,
  hihat: synthHat,
  fx: synthFx,
};

function renderAll() {
  let fileCount = 0;
  for (const genre of GENRES) {
    const dir = path.join(__dirname, '..', 'public', 'sounds', genre);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    for (const [cat, synth] of Object.entries(CATEGORY_SYNTHS)) {
      for (let variant = 1; variant <= 3; variant++) {
        const samples = synth({ genre, variant });
        const wav = encodeWAV(samples);
        const filename = `${genre}_${cat}_${String(variant).padStart(2, '0')}.wav`;
        fs.writeFileSync(path.join(dir, filename), wav);
        fileCount++;
      }
    }
  }
  console.log(`Rendered ${fileCount} DSP one-shots in public/sounds/`);
  return fileCount;
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  renderAll();
}

export {
  encodeWAV,
  synthKick,
  synthSnare,
  synthHat,
  synthFx,
  renderAll,
  noise,
  tanhSat,
  expDecayEnv,
  onePoleLowpass,
  onePoleHighpass,
  bandpass,
  sweepLowpass,
};
