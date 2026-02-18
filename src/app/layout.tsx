import type { Metadata } from 'next';
import ThemeRegistry from '@/components/Layout/ThemeRegistry';

export const metadata: Metadata = {
  title: 'NI Play — Beat Maker',
  description: 'Make beats in your browser. Pick a genre, make a beat, share it.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, backgroundColor: '#0A0A0A' }}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
