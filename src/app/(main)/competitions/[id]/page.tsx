import { Metadata, ResolvingMetadata } from 'next';
import { getCompetitionServer } from '@/lib/server/competition-actions';
import CompetitionClient from './CompetitionClient';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const competition = await getCompetitionServer(id);

  if (!competition) {
    return {
      title: 'ไม่พบการแข่งขัน | Contest One',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${competition.title} | Contest One`,
    description: competition.description?.substring(0, 160),
    openGraph: {
      title: competition.title,
      description: competition.description?.substring(0, 160),
      url: `https://contestone.th/competitions/${id}`,
      siteName: 'Contest One',
      images: [
        {
          url: competition.imageUrl || '/logo_3_th.png',
          width: 1200,
          height: 630,
        },
        ...previousImages,
      ],
      locale: 'th_TH',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: competition.title,
      description: competition.description?.substring(0, 160),
      images: [competition.imageUrl || '/logo_3_th.png'],
    },
  };
}

export default async function CompetitionPage({ params }: Props) {
  const { id } = await params;
  return <CompetitionClient />;
}
