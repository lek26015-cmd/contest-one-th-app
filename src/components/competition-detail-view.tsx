
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '@/components/icons';
import { Calendar, Clock, Download, Share2, ArrowRight, Award, Gavel, Users, HandCoins, Star } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { th } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import type { Competition } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent } from './ui/card';
import RelatedCompetitions from './related-competitions';
import { getRelatedCompetitionsQuery, incrementCompetitionView } from '@/lib/competition-actions';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import SaveCompetitionButton from './save-competition-button';
import LogSubmissionButton from './log-submission-button';
import { getSavedCompetitionStatus } from '@/lib/user-actions';

export default function CompetitionDetailView({
  competition,
}: {
  competition: Competition;
}) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isSaved, setIsSaved] = useState(false);
  
  const relatedQuery = useMemoFirebase(() => {
    if (!competition || !firestore) return null;
    return getRelatedCompetitionsQuery(firestore, competition.category, competition.id, 3);
  }, [firestore, competition]);
  
  const { data: related } = useCollection<Competition>(relatedQuery);

  useEffect(() => {
    if (competition?.id && firestore) {
      // Use a timeout to avoid incrementing on rapid selection changes
      const timer = setTimeout(() => {
        incrementCompetitionView(firestore, competition.id);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [competition?.id, firestore]);
  
  useEffect(() => {
    if (user && competition?.id) {
      getSavedCompetitionStatus(user.uid, competition.id).then(setIsSaved);
    }
  }, [user, competition?.id]);
  

  if (!competition) return null;

  const Icon = getCategoryIcon(competition.category);
  const deadlineDate = new Date(competition.deadline);
  const isExpired = isPast(deadlineDate);
  const hasResources = (competition.rulesUrls && competition.rulesUrls.length > 0) || (competition.socialUrls && competition.socialUrls.length > 0);


  return (
    <ScrollArea className="h-full max-h-[calc(100vh-8rem)]">
        <Card className="flex flex-col shadow-sm overflow-hidden border">
            <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {competition.imageUrl && (
                        <div className="w-full md:w-1/3 flex-shrink-0">
                            <div className="aspect-[3/4] relative">
                                <Image
                                    src={competition.imageUrl}
                                    alt={competition.title}
                                    fill
                                    className="object-cover rounded-md"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    data-ai-hint="competition poster"
                                />
                            </div>
                        </div>
                    )}
                    <div className="flex-grow">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col-reverse items-start justify-between gap-4 sm:flex-row">
                                <h1 className="font-headline text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                                    {competition.title}
                                </h1>
                                <Badge variant="outline" className="text-base flex-shrink-0">
                                    <Icon className="mr-2 h-4 w-4" />
                                    {competition.category}
                                </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                                <div className="flex items-center">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>{format(deadlineDate, 'd MMMM yyyy', { locale: th })}</span>
                                </div>
                                <div className={`flex items-center ${isExpired ? 'text-destructive font-medium' : ''}`}>
                                    <Clock className="mr-2 h-4 w-4" />
                                    <span>{isExpired ? 'หมดเขตแล้ว' : `ปิดรับสมัคร ${formatDistanceToNow(deadlineDate, { addSuffix: true, locale: th })}`}</span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                                 {competition.participantType && <div className="flex items-center">
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>{competition.participantType}</span>
                                </div>}
                                {competition.totalPrize > 0 && <div className="flex items-center font-medium text-primary/90">
                                    <HandCoins className="mr-2 h-4 w-4" />
                                    <span>รางวัลรวม {competition.totalPrize.toLocaleString()} บาท</span>
                                </div>}
                            </div>
                             <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-start items-center w-full mt-2">
                                {user && (
                                  <>
                                    <SaveCompetitionButton
                                        userId={user.uid}
                                        competitionId={competition.id}
                                        isInitiallySaved={competition.isSaved || false}
                                    />
                                    {!isExpired && <LogSubmissionButton competition={competition} user={user} />}
                                  </>
                                )}
                                 <Button size="lg" variant="secondary" asChild>
                                    <Link href={`/competitions/${competition.id}`}>
                                        ดูหน้าเต็ม
                                        <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        
                        <Separator className="my-6" />

                        <div>
                            <h2 className="text-xl font-semibold mb-4">รายละเอียด</h2>
                            <p className="text-base text-foreground/80 whitespace-pre-wrap leading-relaxed">{competition.description}</p>
                        </div>
                    </div>
                </div>

                <Separator className="my-6" />

                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><Award className="mr-3 h-5 w-5 text-primary"/> รางวัล</h2>
                    <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                        {competition.prizes.map((prize, index) => (
                            <li key={index}>{prize}</li>
                        ))}
                    </ul>
                </div>

                <Separator className="my-6" />

                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center"><Gavel className="mr-3 h-5 w-5 text-primary"/> กติกา</h2>
                    <p className="text-base text-foreground/80 whitespace-pre-wrap leading-relaxed">{competition.rules}</p>
                </div>


                {hasResources && (
                    <>
                        <Separator className="my-6" />
                        <div>
                            <h2 className="text-xl font-semibold mb-4">แหล่งข้อมูล</h2>
                             <div className="flex flex-wrap gap-4">
                                {competition.rulesUrls?.map((url, index) => (
                                    <Button variant="outline" asChild key={`rule-${index}`}>
                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                            <Download className="mr-2 h-4 w-4" />
                                            ดาวน์โหลดกติกา #{index + 1}
                                        </a>
                                    </Button>
                                ))}
                                {competition.socialUrls?.map((url, index) => (
                                    <Button variant="outline" asChild key={`social-${index}`}>
                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                            <Share2 className="mr-2 h-4 w-4" />
                                            โซเชียล/ประกาศ #{index + 1}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

            </CardContent>
             {related && related.length > 0 && (
                <>
                  <Separator />
                  <div className="p-6 sm:p-8">
                    <RelatedCompetitions competitions={related} />
                  </div>
                </>
              )}
        </Card>
    </ScrollArea>
  );
}
