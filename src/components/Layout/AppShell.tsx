'use client';

import styled from '@emotion/styled';

/**
 * Thin structural wrapper for page content. Genre theming (CSS custom
 * properties, background, display font) now lives in `GenreSkinProvider`
 * at the root layout, which wraps every page — `AppShell` no longer owns
 * any theming logic itself, just a relatively-positioned full-height
 * container for page-level content to sit in.
 */
const ShellRoot = styled.div`
  position: relative;
  min-height: 100dvh;
  width: 100%;
`;

export default function AppShell({ children }: { children: React.ReactNode }) {
  return <ShellRoot>{children}</ShellRoot>;
}
