import { getServerCompetition } from '@/lib/judging-actions';
import { notFound, redirect } from 'next/navigation';
import JudgingPanel from '@/components/dashboard/JudgingPanel';
import { canAccessJudging } from '@/lib/plan-utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function CompetitionJudgingPage({ params }: { params: { id: string } }) {
  const competition = await getServerCompetition(params.id);

  if (!competition) {
    notFound();
  }

  // Check access level
  if (!canAccessJudging(competition.planLevel)) {
    redirect('/pricing');
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Link href={`/dashboard/organizer/competitions/${params.id}`} className="inline-flex items-center text-slate-400 hover:text-primary font-bold mb-8 transition-colors group">
        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> กลับสู่หน้าแดชบอร์ด
      </Link>
      
      <JudgingPanel competition={competition} />
    </div>
  );
}
