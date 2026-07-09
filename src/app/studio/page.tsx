'use client';

import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import AppShell from '@/components/Layout/AppShell';
import StudioHeader from '@/components/Studio/StudioHeader';
import StepGrid from '@/components/Grid/StepGrid';
import TransportBar from '@/components/Transport/TransportBar';
import TrackControls from '@/components/TrackRow/TrackControls';
import SoundBrowser from '@/components/SoundBrowser/SoundBrowser';
import ShareModal from '@/components/Share/ShareModal';
import ExportModal from '@/components/Export/ExportModal';
import { TRACK_ORDER, TrackCategory } from '@/types';

const StudioLayout = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding-bottom: 12px;
`;

const GridSection = styled.div`
  padding: 8px 2px 4px;
`;

const TrackControlsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px 16px;
`;

/**
 * The beat-making studio: header, step grid + playhead, per-track mixer
 * strips, and the sticky transport bar, plus the sound-browser, share, and
 * export overlays. Sound loading itself lives in {@link TransportBar}
 * (loaded once on mount, reused rather than reloaded on Play).
 */
export default function StudioPage() {
  const [soundBrowserOpen, setSoundBrowserOpen] = useState(false);
  const [soundBrowserTrack, setSoundBrowserTrack] = useState<TrackCategory | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const handleSoundClick = useCallback((track: TrackCategory) => {
    setSoundBrowserTrack(track);
    setSoundBrowserOpen(true);
  }, []);

  return (
    <AppShell>
      <StudioLayout>
        <StudioHeader onShare={() => setShareModalOpen(true)} onExport={() => setExportModalOpen(true)} />

        <GridSection>
          <StepGrid />
        </GridSection>

        <TrackControlsList>
          {TRACK_ORDER.map((track) => (
            <TrackControls key={track} track={track} onSoundClick={handleSoundClick} />
          ))}
        </TrackControlsList>
      </StudioLayout>

      <TransportBar />

      <SoundBrowser
        open={soundBrowserOpen}
        onClose={() => setSoundBrowserOpen(false)}
        track={soundBrowserTrack}
      />

      <ShareModal open={shareModalOpen} onClose={() => setShareModalOpen(false)} />
      <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />
    </AppShell>
  );
}
