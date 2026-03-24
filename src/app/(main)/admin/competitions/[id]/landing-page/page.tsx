import { notFound } from 'next/navigation';
import { getLandingPagesForCompetition } from '@/lib/landing-page-actions';
import LandingPageBuilder from '@/components/landing-page/LandingPageBuilder';
import { getCompetitionServer } from '@/lib/server/competition-actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function landingPageAdmin({ params }: Props) {
  const { id } = await params;
  const competition = await getCompetitionServer(id);
  if (!competition) notFound();

  const landingPages = await getLandingPagesForCompetition(id);
  
  // Create a default page if none exists
  const initialPage = landingPages[0] || {
    id: crypto.randomUUID(),
    competitionId: id,
    slug: competition.title.toLowerCase().replace(/ /g, '-').substring(0, 20),
    title: competition.title,
    sections: [
      {
        id: crypto.randomUUID(),
        type: 'hero',
        content: { 
          title: competition.title, 
          subtitle: competition.description.substring(0, 150) + '...',
          ctaText: 'สมัครเข้าร่วมแข่งขัน',
          ctaLink: `/competitions/${id}/apply`
        },
        settings: { padding: 'large', backgroundColor: 'bg-slate-900' }
      }
    ],
    theme: {
      primaryColor: '#3b82f6',
      fontFamily: 'Inter',
      borderRadius: '1rem',
      showHeader: true,
      showFooter: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <LandingPageBuilder initialData={initialPage} />
    </div>
  );
}
