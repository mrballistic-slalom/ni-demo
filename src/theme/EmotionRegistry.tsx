'use client';

import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

/**
 * App Router-compatible Emotion SSR registry. Without this, Emotion's
 * `styled()`/`css()` output never gets flushed into the server-rendered
 * HTML, causing a flash of unstyled content and a React hydration warning
 * (styles inserted client-side don't match what the server sent).
 *
 * Standard recipe: create a shared Emotion cache per request, track which
 * style keys have been inserted, and flush the pending ones into a
 * `<style data-emotion>` tag via `useServerInsertedHTML` before the stream
 * closes.
 */
export default function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const emotionCache = createCache({ key: 'ni' });
    emotionCache.compat = true;
    const prevInsert = emotionCache.insert;
    let inserted: string[] = [];
    emotionCache.insert = (...args) => {
      const serialized = args[1];
      if (emotionCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flushFn = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache: emotionCache, flush: flushFn };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;

    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }

    return (
      <style
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
