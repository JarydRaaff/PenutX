import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Penutx',
  description: 'Your containers, at a glance. Update with one click.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-hull-950 text-hull-300 font-sans antialiased">{children}</body>
    </html>
  );
}
