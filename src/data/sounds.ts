import { SoundDefinition, Genre, TrackCategory } from '@/types';

export const SOUND_CATALOG: SoundDefinition[] = [
  // ── Trap ──────────────────────────────────────────────────
  { id: 'trap_kick_01', name: 'Trap Deep Kick', category: 'kick', genre: 'trap', file_ogg: '/sounds/trap/trap_kick_01.wav', file_aac: '/sounds/trap/trap_kick_01.wav' },
  { id: 'trap_kick_02', name: 'Trap Punchy Kick', category: 'kick', genre: 'trap', file_ogg: '/sounds/trap/trap_kick_02.wav', file_aac: '/sounds/trap/trap_kick_02.wav' },
  { id: 'trap_kick_03', name: 'Trap Tight Kick', category: 'kick', genre: 'trap', file_ogg: '/sounds/trap/trap_kick_03.wav', file_aac: '/sounds/trap/trap_kick_03.wav' },
  { id: 'trap_snare_01', name: 'Trap Crack Snare', category: 'snare', genre: 'trap', file_ogg: '/sounds/trap/trap_snare_01.wav', file_aac: '/sounds/trap/trap_snare_01.wav' },
  { id: 'trap_snare_02', name: 'Trap Rim Snare', category: 'snare', genre: 'trap', file_ogg: '/sounds/trap/trap_snare_02.wav', file_aac: '/sounds/trap/trap_snare_02.wav' },
  { id: 'trap_snare_03', name: 'Trap Soft Snare', category: 'snare', genre: 'trap', file_ogg: '/sounds/trap/trap_snare_03.wav', file_aac: '/sounds/trap/trap_snare_03.wav' },
  { id: 'trap_hihat_01', name: 'Trap Closed Hat', category: 'hihat', genre: 'trap', file_ogg: '/sounds/trap/trap_hihat_01.wav', file_aac: '/sounds/trap/trap_hihat_01.wav' },
  { id: 'trap_hihat_02', name: 'Trap Open Hat', category: 'hihat', genre: 'trap', file_ogg: '/sounds/trap/trap_hihat_02.wav', file_aac: '/sounds/trap/trap_hihat_02.wav' },
  { id: 'trap_hihat_03', name: 'Trap Pedal Hat', category: 'hihat', genre: 'trap', file_ogg: '/sounds/trap/trap_hihat_03.wav', file_aac: '/sounds/trap/trap_hihat_03.wav' },
  { id: 'trap_melody_01', name: 'Trap Dark Pad', category: 'melody', genre: 'trap', file_ogg: '/sounds/trap/trap_melody_01.wav', file_aac: '/sounds/trap/trap_melody_01.wav' },
  { id: 'trap_melody_02', name: 'Trap Bright Keys', category: 'melody', genre: 'trap', file_ogg: '/sounds/trap/trap_melody_02.wav', file_aac: '/sounds/trap/trap_melody_02.wav' },
  { id: 'trap_melody_03', name: 'Trap Soft Pluck', category: 'melody', genre: 'trap', file_ogg: '/sounds/trap/trap_melody_03.wav', file_aac: '/sounds/trap/trap_melody_03.wav' },
  { id: 'trap_bass_01', name: 'Trap Deep Bass', category: 'bass', genre: 'trap', file_ogg: '/sounds/trap/trap_bass_01.wav', file_aac: '/sounds/trap/trap_bass_01.wav' },
  { id: 'trap_bass_02', name: 'Trap Sub Bass', category: 'bass', genre: 'trap', file_ogg: '/sounds/trap/trap_bass_02.wav', file_aac: '/sounds/trap/trap_bass_02.wav' },
  { id: 'trap_bass_03', name: 'Trap Round Bass', category: 'bass', genre: 'trap', file_ogg: '/sounds/trap/trap_bass_03.wav', file_aac: '/sounds/trap/trap_bass_03.wav' },
  { id: 'trap_fx_01', name: 'Trap Riser', category: 'fx', genre: 'trap', file_ogg: '/sounds/trap/trap_fx_01.wav', file_aac: '/sounds/trap/trap_fx_01.wav' },
  { id: 'trap_fx_02', name: 'Trap Impact', category: 'fx', genre: 'trap', file_ogg: '/sounds/trap/trap_fx_02.wav', file_aac: '/sounds/trap/trap_fx_02.wav' },
  { id: 'trap_fx_03', name: 'Trap Sweep', category: 'fx', genre: 'trap', file_ogg: '/sounds/trap/trap_fx_03.wav', file_aac: '/sounds/trap/trap_fx_03.wav' },

  // ── Lo-fi ─────────────────────────────────────────────────
  { id: 'lofi_kick_01', name: 'Lo-fi Deep Kick', category: 'kick', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_kick_01.wav', file_aac: '/sounds/lofi/lofi_kick_01.wav' },
  { id: 'lofi_kick_02', name: 'Lo-fi Punchy Kick', category: 'kick', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_kick_02.wav', file_aac: '/sounds/lofi/lofi_kick_02.wav' },
  { id: 'lofi_kick_03', name: 'Lo-fi Tight Kick', category: 'kick', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_kick_03.wav', file_aac: '/sounds/lofi/lofi_kick_03.wav' },
  { id: 'lofi_snare_01', name: 'Lo-fi Crack Snare', category: 'snare', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_snare_01.wav', file_aac: '/sounds/lofi/lofi_snare_01.wav' },
  { id: 'lofi_snare_02', name: 'Lo-fi Rim Snare', category: 'snare', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_snare_02.wav', file_aac: '/sounds/lofi/lofi_snare_02.wav' },
  { id: 'lofi_snare_03', name: 'Lo-fi Soft Snare', category: 'snare', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_snare_03.wav', file_aac: '/sounds/lofi/lofi_snare_03.wav' },
  { id: 'lofi_hihat_01', name: 'Lo-fi Closed Hat', category: 'hihat', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_hihat_01.wav', file_aac: '/sounds/lofi/lofi_hihat_01.wav' },
  { id: 'lofi_hihat_02', name: 'Lo-fi Open Hat', category: 'hihat', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_hihat_02.wav', file_aac: '/sounds/lofi/lofi_hihat_02.wav' },
  { id: 'lofi_hihat_03', name: 'Lo-fi Pedal Hat', category: 'hihat', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_hihat_03.wav', file_aac: '/sounds/lofi/lofi_hihat_03.wav' },
  { id: 'lofi_melody_01', name: 'Lo-fi Dark Pad', category: 'melody', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_melody_01.wav', file_aac: '/sounds/lofi/lofi_melody_01.wav' },
  { id: 'lofi_melody_02', name: 'Lo-fi Bright Keys', category: 'melody', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_melody_02.wav', file_aac: '/sounds/lofi/lofi_melody_02.wav' },
  { id: 'lofi_melody_03', name: 'Lo-fi Soft Pluck', category: 'melody', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_melody_03.wav', file_aac: '/sounds/lofi/lofi_melody_03.wav' },
  { id: 'lofi_bass_01', name: 'Lo-fi Deep Bass', category: 'bass', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_bass_01.wav', file_aac: '/sounds/lofi/lofi_bass_01.wav' },
  { id: 'lofi_bass_02', name: 'Lo-fi Sub Bass', category: 'bass', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_bass_02.wav', file_aac: '/sounds/lofi/lofi_bass_02.wav' },
  { id: 'lofi_bass_03', name: 'Lo-fi Round Bass', category: 'bass', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_bass_03.wav', file_aac: '/sounds/lofi/lofi_bass_03.wav' },
  { id: 'lofi_fx_01', name: 'Lo-fi Riser', category: 'fx', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_fx_01.wav', file_aac: '/sounds/lofi/lofi_fx_01.wav' },
  { id: 'lofi_fx_02', name: 'Lo-fi Impact', category: 'fx', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_fx_02.wav', file_aac: '/sounds/lofi/lofi_fx_02.wav' },
  { id: 'lofi_fx_03', name: 'Lo-fi Sweep', category: 'fx', genre: 'lofi', file_ogg: '/sounds/lofi/lofi_fx_03.wav', file_aac: '/sounds/lofi/lofi_fx_03.wav' },

  // ── House ─────────────────────────────────────────────────
  { id: 'house_kick_01', name: 'House Deep Kick', category: 'kick', genre: 'house', file_ogg: '/sounds/house/house_kick_01.wav', file_aac: '/sounds/house/house_kick_01.wav' },
  { id: 'house_kick_02', name: 'House Punchy Kick', category: 'kick', genre: 'house', file_ogg: '/sounds/house/house_kick_02.wav', file_aac: '/sounds/house/house_kick_02.wav' },
  { id: 'house_kick_03', name: 'House Tight Kick', category: 'kick', genre: 'house', file_ogg: '/sounds/house/house_kick_03.wav', file_aac: '/sounds/house/house_kick_03.wav' },
  { id: 'house_snare_01', name: 'House Crack Snare', category: 'snare', genre: 'house', file_ogg: '/sounds/house/house_snare_01.wav', file_aac: '/sounds/house/house_snare_01.wav' },
  { id: 'house_snare_02', name: 'House Rim Snare', category: 'snare', genre: 'house', file_ogg: '/sounds/house/house_snare_02.wav', file_aac: '/sounds/house/house_snare_02.wav' },
  { id: 'house_snare_03', name: 'House Soft Snare', category: 'snare', genre: 'house', file_ogg: '/sounds/house/house_snare_03.wav', file_aac: '/sounds/house/house_snare_03.wav' },
  { id: 'house_hihat_01', name: 'House Closed Hat', category: 'hihat', genre: 'house', file_ogg: '/sounds/house/house_hihat_01.wav', file_aac: '/sounds/house/house_hihat_01.wav' },
  { id: 'house_hihat_02', name: 'House Open Hat', category: 'hihat', genre: 'house', file_ogg: '/sounds/house/house_hihat_02.wav', file_aac: '/sounds/house/house_hihat_02.wav' },
  { id: 'house_hihat_03', name: 'House Pedal Hat', category: 'hihat', genre: 'house', file_ogg: '/sounds/house/house_hihat_03.wav', file_aac: '/sounds/house/house_hihat_03.wav' },
  { id: 'house_melody_01', name: 'House Dark Pad', category: 'melody', genre: 'house', file_ogg: '/sounds/house/house_melody_01.wav', file_aac: '/sounds/house/house_melody_01.wav' },
  { id: 'house_melody_02', name: 'House Bright Keys', category: 'melody', genre: 'house', file_ogg: '/sounds/house/house_melody_02.wav', file_aac: '/sounds/house/house_melody_02.wav' },
  { id: 'house_melody_03', name: 'House Soft Pluck', category: 'melody', genre: 'house', file_ogg: '/sounds/house/house_melody_03.wav', file_aac: '/sounds/house/house_melody_03.wav' },
  { id: 'house_bass_01', name: 'House Deep Bass', category: 'bass', genre: 'house', file_ogg: '/sounds/house/house_bass_01.wav', file_aac: '/sounds/house/house_bass_01.wav' },
  { id: 'house_bass_02', name: 'House Sub Bass', category: 'bass', genre: 'house', file_ogg: '/sounds/house/house_bass_02.wav', file_aac: '/sounds/house/house_bass_02.wav' },
  { id: 'house_bass_03', name: 'House Round Bass', category: 'bass', genre: 'house', file_ogg: '/sounds/house/house_bass_03.wav', file_aac: '/sounds/house/house_bass_03.wav' },
  { id: 'house_fx_01', name: 'House Riser', category: 'fx', genre: 'house', file_ogg: '/sounds/house/house_fx_01.wav', file_aac: '/sounds/house/house_fx_01.wav' },
  { id: 'house_fx_02', name: 'House Impact', category: 'fx', genre: 'house', file_ogg: '/sounds/house/house_fx_02.wav', file_aac: '/sounds/house/house_fx_02.wav' },
  { id: 'house_fx_03', name: 'House Sweep', category: 'fx', genre: 'house', file_ogg: '/sounds/house/house_fx_03.wav', file_aac: '/sounds/house/house_fx_03.wav' },

  // ── Drill ─────────────────────────────────────────────────
  { id: 'drill_kick_01', name: 'Drill Deep Kick', category: 'kick', genre: 'drill', file_ogg: '/sounds/drill/drill_kick_01.wav', file_aac: '/sounds/drill/drill_kick_01.wav' },
  { id: 'drill_kick_02', name: 'Drill Punchy Kick', category: 'kick', genre: 'drill', file_ogg: '/sounds/drill/drill_kick_02.wav', file_aac: '/sounds/drill/drill_kick_02.wav' },
  { id: 'drill_kick_03', name: 'Drill Tight Kick', category: 'kick', genre: 'drill', file_ogg: '/sounds/drill/drill_kick_03.wav', file_aac: '/sounds/drill/drill_kick_03.wav' },
  { id: 'drill_snare_01', name: 'Drill Crack Snare', category: 'snare', genre: 'drill', file_ogg: '/sounds/drill/drill_snare_01.wav', file_aac: '/sounds/drill/drill_snare_01.wav' },
  { id: 'drill_snare_02', name: 'Drill Rim Snare', category: 'snare', genre: 'drill', file_ogg: '/sounds/drill/drill_snare_02.wav', file_aac: '/sounds/drill/drill_snare_02.wav' },
  { id: 'drill_snare_03', name: 'Drill Soft Snare', category: 'snare', genre: 'drill', file_ogg: '/sounds/drill/drill_snare_03.wav', file_aac: '/sounds/drill/drill_snare_03.wav' },
  { id: 'drill_hihat_01', name: 'Drill Closed Hat', category: 'hihat', genre: 'drill', file_ogg: '/sounds/drill/drill_hihat_01.wav', file_aac: '/sounds/drill/drill_hihat_01.wav' },
  { id: 'drill_hihat_02', name: 'Drill Open Hat', category: 'hihat', genre: 'drill', file_ogg: '/sounds/drill/drill_hihat_02.wav', file_aac: '/sounds/drill/drill_hihat_02.wav' },
  { id: 'drill_hihat_03', name: 'Drill Pedal Hat', category: 'hihat', genre: 'drill', file_ogg: '/sounds/drill/drill_hihat_03.wav', file_aac: '/sounds/drill/drill_hihat_03.wav' },
  { id: 'drill_melody_01', name: 'Drill Dark Pad', category: 'melody', genre: 'drill', file_ogg: '/sounds/drill/drill_melody_01.wav', file_aac: '/sounds/drill/drill_melody_01.wav' },
  { id: 'drill_melody_02', name: 'Drill Bright Keys', category: 'melody', genre: 'drill', file_ogg: '/sounds/drill/drill_melody_02.wav', file_aac: '/sounds/drill/drill_melody_02.wav' },
  { id: 'drill_melody_03', name: 'Drill Soft Pluck', category: 'melody', genre: 'drill', file_ogg: '/sounds/drill/drill_melody_03.wav', file_aac: '/sounds/drill/drill_melody_03.wav' },
  { id: 'drill_bass_01', name: 'Drill Deep Bass', category: 'bass', genre: 'drill', file_ogg: '/sounds/drill/drill_bass_01.wav', file_aac: '/sounds/drill/drill_bass_01.wav' },
  { id: 'drill_bass_02', name: 'Drill Sub Bass', category: 'bass', genre: 'drill', file_ogg: '/sounds/drill/drill_bass_02.wav', file_aac: '/sounds/drill/drill_bass_02.wav' },
  { id: 'drill_bass_03', name: 'Drill Round Bass', category: 'bass', genre: 'drill', file_ogg: '/sounds/drill/drill_bass_03.wav', file_aac: '/sounds/drill/drill_bass_03.wav' },
  { id: 'drill_fx_01', name: 'Drill Riser', category: 'fx', genre: 'drill', file_ogg: '/sounds/drill/drill_fx_01.wav', file_aac: '/sounds/drill/drill_fx_01.wav' },
  { id: 'drill_fx_02', name: 'Drill Impact', category: 'fx', genre: 'drill', file_ogg: '/sounds/drill/drill_fx_02.wav', file_aac: '/sounds/drill/drill_fx_02.wav' },
  { id: 'drill_fx_03', name: 'Drill Sweep', category: 'fx', genre: 'drill', file_ogg: '/sounds/drill/drill_fx_03.wav', file_aac: '/sounds/drill/drill_fx_03.wav' },

  // ── Hyperpop ──────────────────────────────────────────────
  { id: 'hyperpop_kick_01', name: 'Hyperpop Deep Kick', category: 'kick', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_kick_01.wav', file_aac: '/sounds/hyperpop/hyperpop_kick_01.wav' },
  { id: 'hyperpop_kick_02', name: 'Hyperpop Punchy Kick', category: 'kick', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_kick_02.wav', file_aac: '/sounds/hyperpop/hyperpop_kick_02.wav' },
  { id: 'hyperpop_kick_03', name: 'Hyperpop Tight Kick', category: 'kick', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_kick_03.wav', file_aac: '/sounds/hyperpop/hyperpop_kick_03.wav' },
  { id: 'hyperpop_snare_01', name: 'Hyperpop Crack Snare', category: 'snare', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_snare_01.wav', file_aac: '/sounds/hyperpop/hyperpop_snare_01.wav' },
  { id: 'hyperpop_snare_02', name: 'Hyperpop Rim Snare', category: 'snare', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_snare_02.wav', file_aac: '/sounds/hyperpop/hyperpop_snare_02.wav' },
  { id: 'hyperpop_snare_03', name: 'Hyperpop Soft Snare', category: 'snare', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_snare_03.wav', file_aac: '/sounds/hyperpop/hyperpop_snare_03.wav' },
  { id: 'hyperpop_hihat_01', name: 'Hyperpop Closed Hat', category: 'hihat', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_hihat_01.wav', file_aac: '/sounds/hyperpop/hyperpop_hihat_01.wav' },
  { id: 'hyperpop_hihat_02', name: 'Hyperpop Open Hat', category: 'hihat', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_hihat_02.wav', file_aac: '/sounds/hyperpop/hyperpop_hihat_02.wav' },
  { id: 'hyperpop_hihat_03', name: 'Hyperpop Pedal Hat', category: 'hihat', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_hihat_03.wav', file_aac: '/sounds/hyperpop/hyperpop_hihat_03.wav' },
  { id: 'hyperpop_melody_01', name: 'Hyperpop Dark Pad', category: 'melody', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_melody_01.wav', file_aac: '/sounds/hyperpop/hyperpop_melody_01.wav' },
  { id: 'hyperpop_melody_02', name: 'Hyperpop Bright Keys', category: 'melody', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_melody_02.wav', file_aac: '/sounds/hyperpop/hyperpop_melody_02.wav' },
  { id: 'hyperpop_melody_03', name: 'Hyperpop Soft Pluck', category: 'melody', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_melody_03.wav', file_aac: '/sounds/hyperpop/hyperpop_melody_03.wav' },
  { id: 'hyperpop_bass_01', name: 'Hyperpop Deep Bass', category: 'bass', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_bass_01.wav', file_aac: '/sounds/hyperpop/hyperpop_bass_01.wav' },
  { id: 'hyperpop_bass_02', name: 'Hyperpop Sub Bass', category: 'bass', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_bass_02.wav', file_aac: '/sounds/hyperpop/hyperpop_bass_02.wav' },
  { id: 'hyperpop_bass_03', name: 'Hyperpop Round Bass', category: 'bass', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_bass_03.wav', file_aac: '/sounds/hyperpop/hyperpop_bass_03.wav' },
  { id: 'hyperpop_fx_01', name: 'Hyperpop Riser', category: 'fx', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_fx_01.wav', file_aac: '/sounds/hyperpop/hyperpop_fx_01.wav' },
  { id: 'hyperpop_fx_02', name: 'Hyperpop Impact', category: 'fx', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_fx_02.wav', file_aac: '/sounds/hyperpop/hyperpop_fx_02.wav' },
  { id: 'hyperpop_fx_03', name: 'Hyperpop Sweep', category: 'fx', genre: 'hyperpop', file_ogg: '/sounds/hyperpop/hyperpop_fx_03.wav', file_aac: '/sounds/hyperpop/hyperpop_fx_03.wav' },
];

export function getSounds(genre: Genre, category: TrackCategory): SoundDefinition[] {
  return SOUND_CATALOG.filter(s => s.genre === genre && s.category === category);
}

export function getSound(id: string): SoundDefinition | undefined {
  return SOUND_CATALOG.find(s => s.id === id);
}

export function getSoundUrl(sound: SoundDefinition): string {
  return sound.file_ogg;
}
