
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '@/components/icons';
import { Calendar, Clock, ArrowLeft, ArrowRight, Download, Share2, Award, Gavel, Users, Trophy as TrophyIcon, Link as LinkIcon, HandCoins, Star, MapPin } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { th } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { getCompetitionQuery, getRelatedCompetitionsQuery, incrementCompetitionView } from '@/lib/competition-actions';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import type { Competition } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { getSavedCompetitionStatus } from '@/lib/user-actions';
import SaveCompetitionButton from '@/components/save-competition-button';
import LogSubmissionButton from '@/components/log-submission-button';
import { getCompetitionWinners } from '@/lib/d1-actions';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ShareDialog } from '@/components/share-dialog';

export default function CompetitionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const source = searchParams.get('source');
  const { user } = useUser();
  const firestore = useFirestore();
  const [winnerList, setWinnerList] = useState<any[]>([]);

  // Search by document key (ID from URL)
  const competitionQuery = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return getCompetitionQuery(firestore, id);
  }, [firestore, id]);

  const { data: competition, isLoading } = useDoc<Competition>(competitionQuery);
  
  // Also try searching by id field if not found by doc key (legacy/sync issue handling)
  const [extraCompetition, setExtraCompetition] = useState<Competition | null>(null);
  const [isExtraLoading, setIsExtraLoading] = useState(false);
  const [hasCheckedExtra, setHasCheckedExtra] = useState(false);

  useEffect(() => {
    if (!isLoading && !competition && id) {
      // If not found by document key, try searching for a document where id field matches
      const findByIdField = async () => {
        setIsExtraLoading(true);
        try {
          const q = query(collection(firestore, 'competitions'), where('id', '==', id), limit(1));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            setExtraCompetition({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Competition);
          }
        } catch (err) {
          console.error("Error searching for competition by field:", err);
        } finally {
          setIsExtraLoading(false);
          setHasCheckedExtra(true);
        }
      };
      findByIdField();
    } else if (competition) {
      setHasCheckedExtra(true);
    }
  }, [isLoading, competition, id, firestore]);

  const activeCompetition = competition || extraCompetition;
  const activeLoading = isLoading || (isExtraLoading && !competition) || (!activeCompetition && !hasCheckedExtra && id && !isLoading);

  const relatedQuery = useMemoFirebase(() => {
    if (!activeCompetition) return null;
    return getRelatedCompetitionsQuery(firestore, activeCompetition.category, activeCompetition.id, 3);
  }, [firestore, activeCompetition]);

  const { data: related } = useCollection<Competition>(relatedQuery);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (activeCompetition?.id && firestore) {
      incrementCompetitionView(firestore, activeCompetition.id, source || undefined);
    }
  }, [activeCompetition?.id, firestore, source]);

  useEffect(() => {
    if (user && activeCompetition?.id) {
      getSavedCompetitionStatus(user.uid, activeCompetition.id).then(setIsSaved);
    }
  }, [user, activeCompetition?.id]);

  useEffect(() => {
    if (activeCompetition?.winnersAnnounced && activeCompetition.id) {
      getCompetitionWinners(activeCompetition.id).then(setWinnerList);
    }
  }, [activeCompetition?.id, activeCompetition?.winnersAnnounced]);

  if (activeLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Skeleton className="h-[80vh] w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-[40vh] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!activeCompetition) {
    notFound();
  }

  const Icon = getCategoryIcon(activeCompetition.category);
  const deadlineDate = new Date(activeCompetition.deadline);
  const isExpired = isPast(deadlineDate);

  const hasResources = (activeCompetition.rulesUrls?.length ?? 0) > 0 || (activeCompetition.socialUrls?.length ?? 0) > 0;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าการแข่งขันทั้งหมด
          </Link>
        </Button>
        <div className="flex gap-2">
            <ShareDialog 
                url={`/competitions/${activeCompetition?.id || id}`}
                title={activeCompetition?.title || "การแข่งขันใหม่"}
                competitionId={activeCompetition?.id || id}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="rounded-2xl border bg-card p-6 sm:p-10 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row gap-10">
              {activeCompetition.imageUrl && (
                <div className="w-full md:w-[280px] flex-shrink-0">
                  <div className="aspect-[3/4] relative rounded-xl overflow-hidden shadow-md border border-slate-100">
                    <Image
                      src={activeCompetition.imageUrl}
                      alt={activeCompetition.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, 280px"
                    />
                  </div>
                </div>
              )}
              <div className="flex-grow space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row">
                    <h1 className="font-headline text-3xl font-black tracking-tight text-slate-900 sm:text-4xl leading-tight">
                      {activeCompetition.title}
                    </h1>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-4 py-1.5 rounded-full border-none flex-shrink-0">
                      <Icon className="mr-2 h-4 w-4" />
                      {activeCompetition.category}
                    </Badge>
                  </div>

                  <div className="text-xl font-bold text-primary mb-2">
                    {activeCompetition.organizer || "ผู้จัดงานอเนกประสงค์"}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                    <div className="flex items-center text-slate-600 font-bold">
                      <MapPin className="mr-3 h-5 w-5 text-primary" />
                      <span>ออนไลน์ • กรุงเทพและปริมณฑล</span>
                    </div>
                    <div className="flex items-center text-slate-600 font-bold">
                      <Users className="mr-3 h-5 w-5 text-primary" />
                      <span>{Array.isArray(activeCompetition.participantType) ? activeCompetition.participantType.join(', ') : activeCompetition.participantType}</span>
                    </div>
                    <div className="flex items-center text-slate-600 font-bold">
                      <Calendar className="mr-3 h-5 w-5 text-primary" />
                      <span>{format(deadlineDate, 'd MMMM yyyy', { locale: th })}</span>
                    </div>
                    <div className={cn("flex items-center font-black", isExpired ? 'text-slate-400' : 'text-primary')}>
                      <Clock className="mr-3 h-5 w-5" />
                      <span>{isExpired ? 'หมดเขตแล้ว' : `ปิดรับสมัคร ${formatDistanceToNow(deadlineDate, { addSuffix: true, locale: th })}`}</span>
                    </div>
                  </div>
                  
                   <div className="flex justify-start items-center flex-wrap gap-4 pt-4">
                     {user && (
                       <>
                         <SaveCompetitionButton
                           userId={user.uid}
                           competitionId={activeCompetition.id}
                           isInitiallySaved={isSaved}
                         />
                         {!isExpired && <LogSubmissionButton competition={activeCompetition} user={user} />}
                       </>
                     )}
                     {activeCompetition.id && !isExpired && (
                         <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-black px-10 py-6 rounded-xl shadow-lg transition-transform hover:scale-105" asChild>
                             <Link href={`/competitions/${activeCompetition.id}/apply`}>
                                 สมัครเข้าร่วมแข่งขัน
                                 <ArrowRight className="ml-2 h-5 w-5" />
                             </Link>
                         </Button>
                     )}
                     {isExpired && (
                       <Button size="lg" disabled className="bg-slate-200 text-slate-500 font-black px-10 py-6 rounded-xl">
                          ปิดรับสมัครแล้ว
                       </Button>
                     )}
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-primary">
                            <HandCoins className="h-8 w-8" />
                            <div>
                                <p className="text-xs font-black uppercase tracking-wider opacity-70">เงินรางวัลรวม</p>
                                <p className="text-2xl font-black">{activeCompetition.totalPrize.toLocaleString()} บาท</p>
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <Award className="h-10 w-10 text-primary opacity-20" />
                        </div>
                    </div>
                </div>
              </div>
            </div>

            <Separator className="my-10" />

            <div className="space-y-12">
              {activeCompetition.winnersAnnounced && (
                <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-100 shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <TrophyIcon className="h-40 w-40 text-amber-500" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-3 relative z-10">
                    <TrophyIcon className="h-8 w-8 text-amber-500" />
                    หอเกียรติยศ (Hall of Fame)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {winnerList.length > 0 ? (
                      winnerList.map((winner) => (
                        <div key={winner.id} className={cn(
                          "bg-white/80 backdrop-blur-sm p-6 rounded-2xl border flex flex-col items-center text-center gap-4 transition-all hover:translate-y-[-4px]",
                          winner.winnerRank === 1 ? "border-amber-200 shadow-md ring-2 ring-amber-400/20" : "border-slate-100"
                        )}>
                          <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl shadow-inner text-white",
                            winner.winnerRank === 1 ? "bg-amber-400" :
                            winner.winnerRank === 2 ? "bg-slate-400" :
                            winner.winnerRank === 3 ? "bg-orange-400" :
                            "bg-primary"
                          )}>
                            {winner.winnerRank || '★'}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                              {winner.winnerAwardName || (winner.winnerRank ? `อันดับที่ ${winner.winnerRank}` : 'รางวัล')}
                            </p>
                            <h4 className="text-lg font-black text-slate-900 leading-tight">
                                {winner.userName}
                            </h4>
                            {winner.isTeamSubmission && winner.teamName && (
                              <p className="text-xs font-bold text-primary mt-1 truncate max-w-[150px]">ทีม: {winner.teamName}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-10 text-center text-slate-400 font-bold">
                        กำลังโหลดรายชื่อผู้ชนะ...
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3">
                  <TrophyIcon className="h-6 w-6 text-primary" />
                  รางวัลการแข่งขัน
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeCompetition.prizes.map((prize, index) => (
                    <li key={index} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold text-slate-700">
                      <Star className="h-5 w-5 text-primary shrink-0 mt-0.5 fill-primary" />
                      {prize}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">รายละเอียดการแข่งขัน</h2>
                <p className="text-lg text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">{activeCompetition.description}</p>
              </section>

              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3">
                    <Gavel className="h-6 w-6 text-primary" />
                    กติกาและเงื่อนไข
                </h2>
                <div className="text-base text-slate-700 whitespace-pre-wrap leading-relaxed bg-slate-50 p-8 rounded-2xl border border-slate-100 font-medium">
                    {activeCompetition.rules}
                </div>
              </section>

              {hasResources && (
                <section>
                  <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">แหล่งข้อมูลและลิงก์ที่เกี่ยวข้อง</h2>
                  <div className="flex flex-wrap gap-4">
                    {activeCompetition.rulesUrls?.map((url, index) => (
                      <Button variant="outline" asChild key={`rule-${index}`} className="font-bold py-6 px-6 rounded-xl border-slate-200 hover:border-primary hover:text-primary transition-all">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-5 w-5" />
                          กติกาการแข่งขัน #{index + 1}
                        </a>
                      </Button>
                    ))}
                    {activeCompetition.socialUrls?.map((url, index) => (
                      <Button variant="outline" asChild key={`social-${index}`} className="font-bold py-6 px-6 rounded-xl border-slate-200 hover:border-primary hover:text-primary transition-all">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <Share2 className="mr-2 h-5 w-5" />
                          ติดตามข่าวสาร #{index + 1}
                        </a>
                      </Button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <aside className="lg:col-span-4 space-y-8 sticky top-28">
           {related && related.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-primary" />
                การแข่งขันอื่น ๆ
              </h2>
              <div className="space-y-4">
                 {related.map(rel => (
                    <Link key={rel.id} href={`/competitions/${rel.id}`} className="block group">
                        <div className="flex gap-4 p-3 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                                <Image 
                                    src={rel.imageUrl || `https://picsum.photos/seed/${rel.id}/200/200`} 
                                    alt={rel.title} 
                                    fill 
                                    className="object-cover group-hover:scale-110 transition-transform"
                                />
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors truncate">
                                    {rel.title}
                                </p>
                                <p className="text-xs font-bold text-primary mt-1">
                                    {rel.organizer || "ผู้จัดงาน"}
                                </p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                                    {format(new Date(rel.deadline), 'd MMM yyyy', { locale: th })}
                                </p>
                            </div>
                        </div>
                    </Link>
                 ))}
                 
                 <Button variant="ghost" className="w-full mt-2 font-bold text-primary hover:bg-primary/5 rounded-xl transition-all" asChild>
                    <Link href="/">
                        ดูทั้งหมด
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                 </Button>
              </div>
            </div>
          )}
          
          <div className="bg-primary p-8 rounded-2xl text-white shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
             <h3 className="text-xl font-black mb-2 relative z-10">ไม่พลาดทุกงานแข่ง</h3>
             <p className="text-white/80 text-sm font-bold mb-6 relative z-10">สมัครสมาชิกเพื่อรับการแจ้งเตือนและการแข่งขันใหม่ล่าสุดก่อนใคร!</p>
             <Button className="w-full bg-white text-primary hover:bg-slate-100 font-black rounded-xl relative z-10 shadow-lg" asChild>
                 <Link href="/login">สมัครตอนนี้</Link>
             </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
