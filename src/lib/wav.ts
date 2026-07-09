/**
 * Minimal AudioBuffer-like shape accepted by {@link audioBufferToWav}. Matches
 * the subset of the real `AudioBuffer`/Tone.js `ToneAudioBuffer` API this
 * module needs, so the encoder is unit-testable without a real (Offline)
 * AudioContext.
 */
export interface AudioBufferLike {
  numberOfChannels: number;
  sampleRate: number;
  length: number;
  getChannelData(channel: number): Float32Array;
}

/** Number of bytes in a canonical 16-bit PCM WAV header (RIFF/WAVE/fmt /data). */
const WAV_HEADER_BYTES = 44;
/** Bit depth this encoder writes samples at. */
const BITS_PER_SAMPLE = 16;
/** Bytes per sample at {@link BITS_PER_SAMPLE}. */
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;
/** WAVE format tag for linear PCM. */
const PCM_FORMAT = 1;

/**
 * Writes an ASCII string into a `DataView` at the given byte offset, one
 * character per byte (used for the 4-character RIFF chunk IDs).
 * @param view - Destination view.
 * @param offset - Byte offset to start writing at.
 * @param value - ASCII string to write.
 */
function writeAscii(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i++) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

/**
 * Converts a single Float32 sample in the range [-1, 1] to a clamped,
 * rounded 16-bit signed PCM integer. Values outside [-1, 1] are clamped
 * first so out-of-range input can't wrap around to the opposite polarity.
 * @param sample - The Float32 sample value.
 * @returns An integer in the range [-32768, 32767].
 */
function floatTo16BitPCM(sample: number): number {
  const clamped = Math.max(-1, Math.min(1, sample));
  return clamped < 0 ? Math.round(clamped * 32768) : Math.round(clamped * 32767);
}

/**
 * Encodes an AudioBuffer-like source into a 16-bit PCM WAV file
 * (RIFF/WAVE/fmt /data), interleaving channels when there's more than one.
 * @param buffer - The audio data to encode; see {@link AudioBufferLike}.
 * @returns An `ArrayBuffer` containing the complete WAV file bytes.
 */
export function audioBufferToWav(buffer: AudioBufferLike): ArrayBuffer {
  const { numberOfChannels, sampleRate, length } = buffer;
  const blockAlign = numberOfChannels * BYTES_PER_SAMPLE;
  const dataSize = length * blockAlign;
  const totalSize = WAV_HEADER_BYTES + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // RIFF chunk descriptor
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');

  // fmt subchunk
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size (16 for PCM)
  view.setUint16(20, PCM_FORMAT, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);

  // data subchunk
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numberOfChannels; ch++) {
    channelData.push(buffer.getChannelData(ch));
  }

  let offset = WAV_HEADER_BYTES;
  for (let frame = 0; frame < length; frame++) {
    for (let ch = 0; ch < numberOfChannels; ch++) {
      view.setInt16(offset, floatTo16BitPCM(channelData[ch][frame]), true);
      offset += BYTES_PER_SAMPLE;
    }
  }

  return arrayBuffer;
}
