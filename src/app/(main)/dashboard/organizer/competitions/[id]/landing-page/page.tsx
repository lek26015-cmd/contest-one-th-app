import { notFound, redirect } from 'next/navigation';
import { getLandingPagesForCompetition } from '@/lib/landing-page-actions';
import LandingPageBuilder from '@/components/landing-page/LandingPageBuilder';
import { getCompetitionServer } from '@/lib/server/competition-actions';
import { requireAdminOrOwner } from '@/lib/server/auth-util';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizerLandingPageEditor({ params }: Props) {
  const { id } = await params;
  const competition = await getCompetitionServer(id);
  
  if (!competition) notFound();

  // Security Check: Ensure the current user is the owner of the competition or an admin
  try {
    await requireAdminOrOwner(competition.userId || '');
  } catch (error) {
    console.error('Unauthorized access to landing page editor:', error);
    redirect('/dashboard/organizer');
  }

  const landingPages = await getLandingPagesForCompetition(id);
  
  // Create a default page if none exists
  const initialPage = landingPages[0] || {
    id: crypto.randomUUID(),
    competitionId: id,
    slug: competition.title.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20),
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
