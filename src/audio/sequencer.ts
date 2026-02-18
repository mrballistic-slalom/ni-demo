import type * as ToneTypes from 'tone';
import { getTone } from './tone';
import { useGridStore } from '@/stores/useGridStore';
import { useTransportStore } from '@/stores/useTransportStore';
import { TrackCategory, TRACK_ORDER } from '@/types';

const players: Record<string, ToneTypes.Player> = {};
let sequence: ToneTypes.Sequence | null = null;

export function createSequence() {
  const Tone = getTone();

  if (sequence) {
    sequence.dispose();
  }

  const totalSteps = useGridStore.getState().patternLength * 16;
  const stepIndices = Array.from({ length: totalSteps }, (_, i) => i);

  sequence = new Tone.Sequence(
    (time, step) => {
      const { grid, volumes, mutes, solos } = useGridStore.getState();
      useTransportStore.getState().setCurrentStep(step);

      const hasSolo = TRACK_ORDER.some(t => solos[t]);

      for (const track of TRACK_ORDER) {
        if (mutes[track]) continue;
        if (hasSolo && !solos[track]) continue;

        if (grid[track][step] === 1) {
          const player = players[track];
          if (player?.loaded) {
            player.volume.value = Tone.gainToDb(volumes[track]);
            player.start(time);
          }
        }
      }
    },
    stepIndices,
    '16n'
  );

  sequence.loop = true;
  return sequence;
}

export async function loadSound(track: TrackCategory, url: string) {
  const Tone = getTone();
  if (players[track]) {
    players[track].dispose();
  }
  players[track] = new Tone.Player(url).toDestination();
  await Tone.loaded();
}

export function startPlayback() {
  const Tone = getTone();
  Tone.getTransport().bpm.value = useGridStore.getState().bpm;
  Tone.getTransport().swing = useGridStore.getState().swing / 200;
  if (!sequence) createSequence();
  sequence!.start(0);
  Tone.getTransport().start();
}

export function stopPlayback() {
  const Tone = getTone();
  Tone.getTransport().stop();
  Tone.getTransport().position = 0;
  sequence?.stop();
  useTransportStore.getState().setCurrentStep(-1);
}

export function updateBpm(bpm: number) {
  const Tone = getTone();
  Tone.getTransport().bpm.value = bpm;
}

export function disposeSequence() {
  if (sequence) {
    sequence.dispose();
    sequence = null;
  }
}

export function getPlayer(track: TrackCategory): ToneTypes.Player | undefined {
  return players[track];
}
