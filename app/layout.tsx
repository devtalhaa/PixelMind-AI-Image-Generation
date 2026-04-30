import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/navbar';

import './globals.css';

export const metadata: Metadata = {
  title: 'PixelMind AI — AI-Powered Image Editor',
  description:
    'Remove objects, transfer styles, restore faces, upscale images — all powered by free open-source AI models on Google Colab. No signup needed.',
  keywords: ['AI image editor', 'style transfer', 'image upscale', 'background removal', 'face restoration'],
  openGraph: {
    title: 'PixelMind AI',
    description: 'Free AI-powered image editing — 7 operations, under 90 seconds each',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        {children}

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              borderRadius: 'var(--radius-md)',
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
