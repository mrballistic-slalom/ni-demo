'use client';

import styled from '@emotion/styled';
import { Disc3, MousePointerClick, Share2, ChevronRight, type LucideIcon } from 'lucide-react';

const Section = styled.section`
  padding: 8px 20px 40px;
  max-width: 720px;
  margin: 0 auto;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
`;

const Group = styled.div`
  display: contents;
`;

const Beat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.88);
  flex: 1 1 140px;
  max-width: 160px;
`;

const IconBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
`;

const StepLabel = styled.p`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
`;

const Connector = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  margin-top: 26px;
  color: rgba(255, 255, 255, 0.3);

  @media (max-width: 480px) {
    display: none;
  }
`;

interface Step {
  icon: LucideIcon;
  label: string;
}

const STEPS: Step[] = [
  { icon: Disc3, label: 'Pick a genre' },
  { icon: MousePointerClick, label: 'Tap the squares' },
  { icon: Share2, label: 'Share it' },
];

/**
 * Three compact "how it works" beats between the hero and the genre
 * picker — an icon and a short label per step, connected by chevrons on
 * wide screens (stacked, connector-free on narrow ones). No paragraphs,
 * just the flow: pick, tap, share.
 */
export default function HowItWorks() {
  return (
    <Section aria-label="How it works">
      <Row>
        {STEPS.map(({ icon: Icon, label }, i) => (
          <Group key={label}>
            <Beat>
              <IconBadge aria-hidden="true">
                <Icon size={24} strokeWidth={2.25} />
              </IconBadge>
              <StepLabel>{label}</StepLabel>
            </Beat>
            {i < STEPS.length - 1 && (
              <Connector aria-hidden="true">
                <ChevronRight size={20} strokeWidth={2} />
              </Connector>
            )}
          </Group>
        ))}
      </Row>
    </Section>
  );
}
