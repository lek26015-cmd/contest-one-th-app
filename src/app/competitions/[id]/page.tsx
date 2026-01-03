
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '@/components/icons';
import { Calendar, Clock, ArrowLeft, Download, Share2, Award, Gavel, Users, Trophy as TrophyIcon, Link as LinkIcon, HandCoins, Star } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { th } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import RelatedCompetitions from '@/components/related-competitions';
import { getCompetitionQuery, getRelatedCompetitionsQuery, incrementCompetitionView } from '@/lib/competition-actions';
import type { Competition } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { getSavedCompetitionStatus } from '@/lib/user-actions';
import SaveCompetitionButton from '@/components/save-competition-button';
import LogSubmissionButton from '@/components/log-submission-button';


import { useSearchParams } from 'next/navigation';

export default function CompetitionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const source = searchParams.get('source');
  const { user } = useUser();
  const firestore = useFirestore();

  const competitionQuery = useMemoFirebase(() => getCompetitionQuery(firestore, id), [firestore, id]);
  const { data: competition, isLoading } = useDoc<Competition>(competitionQuery);

  const relatedQuery = useMemoFirebase(() => {
    if (!competition) return null;
    return getRelatedCompetitionsQuery(firestore, competition.category, competition.id, 3);
  }, [firestore, competition]);

  const { data: related } = useCollection<Competition>(relatedQuery);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id && firestore) {
      incrementCompetitionView(firestore, id, source || undefined);
    }
  }, [id, firestore, source]);

  useEffect(() => {
    if (user && id) {
      getSavedCompetitionStatus(user.uid, id).then(setIsSaved);
    }
  }, [user, id]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  if (!competition) {
    notFound();
  }

  const Icon = getCategoryIcon(competition.category);
  const deadlineDate = new Date(competition.deadline);
  const isExpired = isPast(deadlineDate);

  const hasResources = competition.rulesUrls?.length > 0 || competition.socialUrls?.length > 0;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center text-sm text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าการแข่งขันทั้งหมด
          </Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-6 sm:p-8 shadow-sm">
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
                <h1 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
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
              <div className="flex justify-start items-center flex-wrap gap-4 mt-2">
                {user && (
                  <>
                    <SaveCompetitionButton
                      userId={user.uid}
                      competitionId={id}
                      isInitiallySaved={isSaved}
                    />
                    {!isExpired && <LogSubmissionButton competition={competition} user={user} />}
                  </>
                )}
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
          <h2 className="text-xl font-semibold mb-4 flex items-center"><Award className="mr-3 h-5 w-5 text-primary" /> รางวัล</h2>
          <ul className="list-disc pl-5 space-y-2 text-foreground/80">
            {competition.prizes.map((prize, index) => (
              <li key={index}>{prize}</li>
            ))}
          </ul>
        </div>

        <Separator className="my-6" />

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center"><Gavel className="mr-3 h-5 w-5 text-primary" /> กติกา</h2>
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

        <Separator className="my-6" />

      </div>

      {related && related.length > 0 && (
        <>
          <Separator className="my-12" />
          <RelatedCompetitions competitions={related} />
        </>
      )}
    </div>
  );
}
