import { nanoid } from 'nanoid';

export function generateShareId(): string {
  return nanoid(8);
}

export function formatBPM(bpm: number): string {
  return `${Math.round(bpm)} BPM`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
