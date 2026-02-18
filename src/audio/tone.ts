type ToneModule = typeof import('tone');

let toneModule: ToneModule | null = null;

export async function loadTone(): Promise<ToneModule> {
  if (!toneModule) {
    const mod = await import('tone');
    // Handle both ESM default export and namespace import patterns
    toneModule = (mod as any).default || mod;
  }
  return toneModule!;
}

export function getTone(): ToneModule {
  if (!toneModule) throw new Error('Tone.js not loaded. Call loadTone() first.');
  return toneModule;
}
