'use client';

import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Download } from 'lucide-react';
import IconButton from '@/components/common/IconButton';
import { useGridStore } from '@/stores/useGridStore';
import { GENRES } from '@/data/genres';

/** Props for {@link StudioHeader}. */
export interface StudioHeaderProps {
  /** Callback invoked when the Share icon is tapped. */
  onShare: () => void;
  /** Callback invoked when the Export icon is tapped. */
  onExport: () => void;
}

const HeaderRoot = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const Wordmark = styled.h1`
  margin: 0;
  font-family: var(--font-display, inherit);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--genre-primary);
  text-shadow: 0 0 var(--genre-glow-blur, 12px) var(--genre-glow);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`;

/**
 * Studio page header: a back button to the genre picker, the current
 * genre's wordmark rendered in its display font, and Share/Export actions.
 * There is deliberately no Save action -- there's no backend to save to.
 */
export default function StudioHeader({ onShare, onExport }: StudioHeaderProps) {
  const router = useRouter();
  const genre = useGridStore((s) => s.genre);
  const genreDef = GENRES[genre];

  return (
    <HeaderRoot>
      <LeftGroup>
        <IconButton icon={ArrowLeft} label="Back to genres" size={40} onClick={() => router.push('/')} />
        <Wordmark>{genreDef.label}</Wordmark>
      </LeftGroup>
      <Actions>
        <IconButton icon={Share2} label="Share beat" size={40} onClick={onShare} />
        <IconButton icon={Download} label="Export beat" size={40} onClick={onExport} />
      </Actions>
    </HeaderRoot>
  );
}
