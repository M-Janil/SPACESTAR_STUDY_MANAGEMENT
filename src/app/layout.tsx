import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { StarspaceProvider } from '@/context/StarspaceContext';
import { ManualSessionModal } from '@/components/ManualSessionModal';
import { FocusModeModal } from '@/components/FocusModeModal';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'STARSPACE ✧ | Your Personal Study Universe',
  description: 'Your little universe of productivity. All-in-one study companion combining study timer, subject management, notes storage, tasks, calendar, analytics, weekly goals, and achievements.',
  applicationName: 'STARSPACE',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'STARSPACE',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#55436D',
  viewportFit: 'cover',
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="STARSPACE" />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#FFDDF0] selection:text-[#55436D]">
        <StarspaceProvider>
          {children}
          {/* Global Modals */}
          <ManualSessionModal />
          <FocusModeModal />
          {/* Progressive Web App Service Worker Registration */}
          <ServiceWorkerRegister />
        </StarspaceProvider>
      </body>
    </html>
  );
}
