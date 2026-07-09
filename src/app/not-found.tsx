'use client';

import styled from '@emotion/styled';
import Link from 'next/link';
import { focusRing } from '@/components/common/focusRing';

const Wrapper = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
  background: var(--genre-bg, #0a0a0a);
  color: var(--genre-text, #ffffff);
`;

const Code = styled.h1`
  margin: 0;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--genre-primary, #ff1744);
`;

const Message = styled.p`
  margin: 0 0 16px;
  font-size: 1rem;
  color: var(--genre-text-dim, rgba(255, 255, 255, 0.6));
`;

const HomeLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  background: var(--genre-primary, #ff1744);
  color: var(--genre-surface, #0a0a0a);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-decoration: none;

  &:focus-visible {
    ${focusRing()}
  }
`;

export default function NotFound() {
  return (
    <Wrapper>
      <Code>404</Code>
      <Message>Page not found</Message>
      <HomeLink href="/">Back to home</HomeLink>
    </Wrapper>
  );
}
