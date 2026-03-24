import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { ComparisonProvider } from '@/providers/comparison-provider';
import { SearchProvider } from '@/providers/search-provider';

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
      <body className={cn('font-body antialiased flex flex-col min-h-screen bg-slate-50/30')}>
        <FirebaseClientProvider>
          <SearchProvider>
            <ComparisonProvider>
              {children}
            </ComparisonProvider>
          </SearchProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
