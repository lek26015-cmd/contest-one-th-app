import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ComparisonBar from '@/components/comparison-bar';
import { Toaster } from '@/components/ui/toaster';
import CookieConsentBanner from '@/components/cookie-consent-banner';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
      <ComparisonBar />
      <Toaster />
      <CookieConsentBanner />
    </>
  );
}
