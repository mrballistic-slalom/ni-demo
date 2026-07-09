import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { decodeBeatFromUrl } from '@/lib/utils';
import { GENRES } from '@/data/genres';
import { SKINS, GenreSkin } from '@/theme/skins';
import { GenreDefinition, GridState, STEPS_PER_BAR, TRACK_ORDER } from '@/types';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/** Trims a decoded beat's grid down to its first bar (16 steps) per track, matching the preview shown on the beat page itself. */
function firstBar(grid: GridState): GridState {
  const trimmed = {} as GridState;
  for (const track of TRACK_ORDER) {
    trimmed[track] = grid[track].slice(0, STEPS_PER_BAR);
  }
  return trimmed;
}

/** Generic branded card used when `b` is missing, malformed, or names an unknown genre. */
function FallbackCard() {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 20%, #1a0a1a, #050505)',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 96,
          fontWeight: 900,
          letterSpacing: -3,
          color: '#FF5FBE',
        }}
      >
        NI Play
      </div>
      <div style={{ display: 'flex', fontSize: 32, marginTop: 22, color: 'rgba(255,255,255,0.7)' }}>
        Make a beat in your browser
      </div>
    </div>
  );
}

/** Genre-skinned card: wordmark, genre label + tagline, BPM, and a dot-grid rendering of the beat's first bar. */
function BeatCard({
  genreDef,
  skin,
  grid,
  bpm,
}: {
  genreDef: GenreDefinition;
  skin: GenreSkin;
  grid: GridState;
  bpm: number;
}) {
  const p = skin.palette;

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        background: p.bg,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 30, fontWeight: 900, letterSpacing: -1, color: p.primary }}>
          NI PLAY
        </div>
        <div style={{ display: 'flex', fontSize: 68, fontWeight: 800, marginTop: 14, color: p.text }}>
          {genreDef.label} beat
        </div>
        <div style={{ display: 'flex', fontSize: 28, marginTop: 14, color: p.textDim, maxWidth: 760 }}>
          {genreDef.tagline}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {TRACK_ORDER.map((track) => (
            <div key={track} style={{ display: 'flex', gap: 6 }}>
              {grid[track].map((on, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    background: on === 1 ? p.cellOn : p.cellOff,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, color: p.primary }}>
          {Math.round(bpm)} BPM
        </div>
      </div>
    </div>
  );
}

/**
 * Dynamic per-beat OG image. Decodes `?b=` the same way the beat page does
 * and renders a branded card in that beat's genre skin — wordmark, genre
 * label/tagline, BPM, and a dot-grid of the pattern's first bar — falling
 * back to a generic branded card on a missing, malformed, or unknown-genre
 * `b` so a bad share link never breaks the preview image.
 */
export async function GET(request: NextRequest) {
  const b = request.nextUrl.searchParams.get('b');
  const decoded = b ? decodeBeatFromUrl(b) : null;

  if (!decoded || !(decoded.genre in GENRES)) {
    return new ImageResponse(<FallbackCard />, { width: OG_WIDTH, height: OG_HEIGHT });
  }

  return new ImageResponse(
    (
      <BeatCard
        genreDef={GENRES[decoded.genre]}
        skin={SKINS[decoded.genre]}
        grid={firstBar(decoded.grid)}
        bpm={decoded.bpm}
      />
    ),
    { width: OG_WIDTH, height: OG_HEIGHT }
  );
}
