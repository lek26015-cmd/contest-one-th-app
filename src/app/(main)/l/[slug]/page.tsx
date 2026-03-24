import { notFound } from 'next/navigation';
import { getLandingPageBySlug } from '@/lib/landing-page-actions';
import { Renderer } from '@/components/landing-page/LandingPageSections';
import { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);
  if (!page) return { title: 'Not Found' };

  return {
    title: page.title,
    openGraph: {
      title: page.title,
      type: 'website',
    },
  };
}

export default async function PublicLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = await getLandingPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <Renderer sections={page.sections} theme={page.theme} />
    </main>
  );
}
