import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StarspaceProvider } from '@/context/StarspaceContext';
import { ManualSessionModal } from '@/components/ManualSessionModal';
import { FocusModeModal } from '@/components/FocusModeModal';

export const metadata: Metadata = {
  title: 'STARSPACE ✧ | Your Personal Study Universe',
  description: 'Your little universe of productivity. All-in-one study companion combining study timer, subject management, notes storage, tasks, calendar, analytics, weekly goals, and achievements.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@500;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#FFDDF0] selection:text-[#55436D]">
        <StarspaceProvider>
          {children}
          {/* Global Modals */}
          <ManualSessionModal />
          <FocusModeModal />
        </StarspaceProvider>
      </body>
    </html>
  );
}
