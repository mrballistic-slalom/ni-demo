type ToneModule = typeof import('tone');

let toneModule: ToneModule | null = null;

/**
 * Lazily loads the Tone.js module via dynamic import and caches it.
 * @returns The Tone.js module namespace.
 */
export async function loadTone(): Promise<ToneModule> {
  if (!toneModule) {
    const mod = await import('tone');
    // Handle both ESM default export and namespace import patterns
    const modRecord = mod as Record<string, unknown>;
    toneModule = (modRecord.default as ToneModule) || mod;
  }
  return toneModule!;
}

/**
 * Returns the cached Tone.js module synchronously.
 * @returns The Tone.js module namespace.
 * @throws If Tone.js has not been loaded yet via {@link loadTone}.
 */
export function getTone(): ToneModule {
  if (!toneModule) throw new Error('Tone.js not loaded. Call loadTone() first.');
  return toneModule;
}
