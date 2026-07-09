import type { Metadata } from 'next';
import EmotionRegistry from '@/theme/EmotionRegistry';
import GenreSkinProvider from '@/theme/GenreSkinProvider';
import { bodyFontClass } from '@/theme/fonts';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'NI Play — Beat Maker',
  description: 'Make beats in your browser — pick a genre, build a beat, and share it.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={bodyFontClass} style={{ margin: 0 }}>
        <EmotionRegistry>
          <GenreSkinProvider>{children}</GenreSkinProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
