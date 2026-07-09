'use client';

import styled from '@emotion/styled';
import { useReducedMotion } from 'motion/react';
import { useGridStore } from '@/stores/useGridStore';
import { SKINS } from '@/theme/skins';

/**
 * Tiny grayscale fractal-noise tile, reused (at different opacities/blend
 * modes) for both the `grain` and `paper` textures below. Encoded once at
 * module scope rather than per-render.
 */
const NOISE_SVG = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">' +
    '<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" result="t"/>' +
    '<feColorMatrix in="t" type="saturate" values="0"/></filter>' +
    '<rect width="100%" height="100%" filter="url(#n)"/></svg>'
);
const NOISE_URL = `url("data:image/svg+xml,${NOISE_SVG}")`;

const Base = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  pointer-events: none;
`;

const GrainLayer = styled(Base)<{ $animate: boolean }>`
  opacity: 0.06;
  mix-blend-mode: overlay;
  background-image: ${NOISE_URL};
  background-size: 180px 180px;
  animation: ${(p) => (p.$animate ? 'ni-texture-grain-drift 1.2s steps(6) infinite' : 'none')};

  @keyframes ni-texture-grain-drift {
    0% {
      transform: translate(0, 0);
    }
    20% {
      transform: translate(-2%, 1%);
    }
    40% {
      transform: translate(1%, -2%);
    }
    60% {
      transform: translate(-1%, 2%);
    }
    80% {
      transform: translate(2%, -1%);
    }
    100% {
      transform: translate(0, 0);
    }
  }
`;

const ScanlinesLayer = styled(Base)`
  opacity: 0.18;
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.08) 0px,
    rgba(255, 255, 255, 0.08) 1px,
    transparent 2px,
    transparent 4px
  );
`;

const PaperLayer = styled(Base)`
  opacity: 0.16;
  mix-blend-mode: overlay;
  background-image: radial-gradient(
      circle at 15% 20%,
      color-mix(in srgb, var(--genre-text) 30%, transparent),
      transparent 55%
    ),
    radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--genre-glow) 45%, transparent), transparent 55%),
    ${NOISE_URL};
  background-size: cover, cover, 220px 220px;
`;

const ChromaticLayer = styled(Base)`
  opacity: 0.55;
  mix-blend-mode: screen;
  box-shadow: inset 10px 0 26px -10px color-mix(in srgb, var(--genre-primary) 65%, transparent),
    inset -10px 0 26px -10px color-mix(in srgb, var(--genre-accent) 65%, transparent);
`;

/**
 * Fixed, full-viewport, `pointer-events: none` texture layer whose look is
 * driven entirely by the active genre's `SKINS[genre].texture` -- never a
 * hardcoded color, always the current skin's own CSS custom properties
 * (`--genre-primary`/`--genre-accent`/`--genre-glow`/`--genre-text`) for
 * any tint. Mounted once inside {@link GenreSkinProvider} so every screen
 * inherits the active genre's finish:
 *
 * - `grain` (trap) -- a faint animated film-grain noise tile.
 * - `scanlines` (drill) -- faint horizontal CRT-style scanlines.
 * - `paper` (lofi) -- a soft warm paper/vinyl-dust texture.
 * - `chromatic` (hyperpop) -- a subtle RGB-split vignette at the edges.
 * - `none` (house) -- renders nothing.
 *
 * The grain animation is skipped under `prefers-reduced-motion` (the noise
 * tile itself still renders, just static) since it's the only texture with
 * any motion.
 */
export default function TextureOverlay() {
  const genre = useGridStore((s) => s.genre);
  const prefersReducedMotion = useReducedMotion();
  const texture = SKINS[genre].texture;

  switch (texture) {
    case 'grain':
      return <GrainLayer aria-hidden="true" data-texture="grain" $animate={!prefersReducedMotion} />;
    case 'scanlines':
      return <ScanlinesLayer aria-hidden="true" data-texture="scanlines" />;
    case 'paper':
      return <PaperLayer aria-hidden="true" data-texture="paper" />;
    case 'chromatic':
      return <ChromaticLayer aria-hidden="true" data-texture="chromatic" />;
    case 'none':
    default:
      return null;
  }
}
