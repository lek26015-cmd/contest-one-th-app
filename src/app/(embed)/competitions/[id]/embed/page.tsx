'use client';

import { useParams } from 'next/navigation';
import { getCategoryIcon } from '@/components/icons';
import { Calendar, Users, HandCoins, ArrowRight, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { getCompetitionQuery } from '@/lib/competition-actions';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { Competition } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function CompetitionEmbedPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();

  const competitionQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return getCompetitionQuery(firestore, id);
  }, [firestore, id]);

  const { data: competition, isLoading } = useDoc<Competition>(competitionQuery);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent p-4 flex items-center justify-center">
        <div className="w-full max-w-sm rounded-[2rem] border bg-white p-8 space-y-4">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-transparent p-4 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border text-center font-bold text-slate-400">
          ไม่พบข้อมูลการแข่งขัน
        </div>
      </div>
    );
  }

  const Icon = getCategoryIcon(competition.category);
  const deadlineDate = new Date(competition.deadline);

  return (
    <div className="min-h-screen bg-transparent p-4 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col group transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
        {/* Cover Image */}
        <div className="relative h-48 flex-shrink-0">
          <img 
            src={competition.imageUrl || "https://picsum.photos/800/600"} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            alt={competition.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
             <Badge className="bg-white/90 backdrop-blur-md text-primary border-none font-black px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider">
                <Icon className="mr-1.5 h-3 w-3" />
                {competition.category}
             </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 line-clamp-2 leading-tight font-headline group-hover:text-primary transition-colors">
              {competition.title}
            </h3>
            <p className="text-sm font-bold text-slate-400 mt-2 uppercase tracking-wide">
              โดย {competition.organizer || "ผู้จัดงาน"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="flex items-center gap-2 text-slate-500">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-300 tracking-tighter">หมดเขต</p>
                   <p className="text-xs font-black">{format(deadlineDate, 'd MMM yy', { locale: th })}</p>
                </div>
             </div>
             <div className="flex items-center gap-2 text-slate-500">
                <div className="p-2 bg-primary/5 rounded-lg text-primary/40">
                  <HandCoins className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-primary/30 tracking-tighter">รางวัลรวม</p>
                   <p className="text-xs font-black text-primary">฿{competition.totalPrize.toLocaleString()}</p>
                </div>
             </div>
          </div>

          <Button 
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-200 gap-2 transition-all active:scale-95 group-hover:bg-primary group-hover:shadow-primary/20"
            onClick={() => window.open(`${window.location.origin}/competitions/${competition.id}`, '_blank')}
          >
            ดูรายละเอียดและสมัคร
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-50">
             <img src="/logo_3_th.png" className="h-4 grayscale opacity-30" alt="Logo" />
             <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em]">Contest One</span>
          </div>
        </div>
      </div>
    </div>
  );
}
