import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAMPLE_RATE = 44100;

function generateTone(freq, duration, type = 'sine', decayRate = 8) {
  const samples = Math.floor(SAMPLE_RATE * duration);
  const buffer = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = Math.exp(-t * decayRate);
    let wave;
    switch (type) {
      case 'noise': wave = Math.random() * 2 - 1; break;
      case 'square': wave = Math.sign(Math.sin(2 * Math.PI * freq * t)); break;
      default: wave = Math.sin(2 * Math.PI * freq * t);
    }
    buffer[i] = wave * envelope * 0.8;
  }
  return buffer;
}

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

const soundDefs = {
  kick:   { freq: 60,   duration: 0.5, type: 'sine',   decayRate: 6 },
  snare:  { freq: 200,  duration: 0.2, type: 'noise',  decayRate: 12 },
  hihat:  { freq: 800,  duration: 0.1, type: 'noise',  decayRate: 20 },
  melody: { freq: 440,  duration: 0.8, type: 'sine',   decayRate: 3 },
  bass:   { freq: 80,   duration: 0.6, type: 'square', decayRate: 5 },
  fx:     { freq: 1200, duration: 0.3, type: 'sine',   decayRate: 10 },
};

const genres = ['trap', 'lofi', 'house', 'drill', 'hyperpop'];
const categories = ['kick', 'snare', 'hihat', 'melody', 'bass', 'fx'];

// Genre-specific frequency multipliers to make each genre sound slightly different
const genreMultipliers = {
  trap: 1.0,
  lofi: 0.85,
  house: 1.1,
  drill: 0.95,
  hyperpop: 1.2,
};

let fileCount = 0;

for (const genre of genres) {
  const dir = path.join(__dirname, '..', 'public', 'sounds', genre);
  fs.mkdirSync(dir, { recursive: true });

  for (const cat of categories) {
    for (let v = 1; v <= 3; v++) {
      const def = soundDefs[cat];
      const freq = def.freq * genreMultipliers[genre] * (1 + (v - 1) * 0.15);
      const samples = generateTone(freq, def.duration, def.type, def.decayRate);
      const wav = encodeWAV(samples);
      const filename = `${genre}_${cat}_${String(v).padStart(2, '0')}.wav`;
      fs.writeFileSync(path.join(dir, filename), wav);
      fileCount++;
    }
  }
}

console.log(`Generated ${fileCount} placeholder sounds in public/sounds/`);
