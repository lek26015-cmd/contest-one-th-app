import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Script from 'next/script';
import { FirebaseClientProvider } from '@/firebase';
import CookieConsentBanner from '@/components/cookie-consent-banner';

export const metadata: Metadata = {
  title: 'ContestOne-th - ค้นหาการแข่งขันครั้งต่อไปของคุณ',
  description: 'แพลตฟอร์มสำหรับประกาศและค้นหาการแข่งขันต่างๆ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <title>ContestOne&lt;sup&gt;th&lt;/sup&gt; - ค้นหาการแข่งขันครั้งต่อไปของคุณ</title>
      </head>
      <body className={cn('font-body antialiased flex flex-col min-h-screen')}>
        <FirebaseClientProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
          <CookieConsentBanner />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
