import { Inter, Archivo, Fraunces, Space_Grotesk, Oswald, Baloo_2 } from 'next/font/google';
import { Genre } from '@/types';

/** Body copy face used across the whole app, regardless of active genre. */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-body',
});

/** Trap display face — condensed, heavy, high-impact. */
const archivo = Archivo({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  display: 'swap',
  variable: '--font-display',
});

/** Lo-Fi display face — warm, editorial serif. */
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
});

/** House display face — clean, geometric, futuristic. */
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});

/** Drill display face — tall, condensed, stencil-like. */
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-display',
});

/** Hyperpop display face — rounded, bubbly, maximalist. */
const baloo2 = Baloo_2({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
  variable: '--font-display',
});

/** Body font class applied to `<body>` in the root layout. */
export const bodyFontClass = inter.className;

/** Genre-specific display font class, applied by `GenreSkinProvider`. */
export const DISPLAY_FONT_CLASS: Record<Genre, string> = {
  trap: archivo.className,
  lofi: fraunces.className,
  house: spaceGrotesk.className,
  drill: oswald.className,
  hyperpop: baloo2.className,
};
