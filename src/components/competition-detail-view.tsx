'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryIcon } from '@/components/icons';
import { Calendar, Clock, Download, Share2, ArrowRight, Award, Gavel, Users, HandCoins, MapPin, Upload } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { th } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import type { Competition } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import RelatedCompetitions from './related-competitions';
import { getRelatedCompetitionsQuery, incrementCompetitionView } from '@/lib/competition-actions';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import SaveCompetitionButton from './save-competition-button';
import LogSubmissionButton from './log-submission-button';
import SubmissionForm from './submission-form';
import { getSavedCompetitionStatus } from '@/lib/user-actions';

export default function CompetitionDetailView({
    competition,
}: {
    competition: Competition;
}) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [isSaved, setIsSaved] = useState(false);
    const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);

    const relatedQuery = useMemoFirebase(() => {
        if (!competition || !firestore) return null;
        return getRelatedCompetitionsQuery(firestore, competition.category, competition.id, 3);
    }, [firestore, competition]);

    const { data: related } = useCollection<Competition>(relatedQuery);

    useEffect(() => {
        if (competition?.id && firestore) {
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
    const isPastDeadline = isPast(deadlineDate);
    const hasResources = (competition.rulesUrls && competition.rulesUrls.length > 0) || (competition.socialUrls && competition.socialUrls.length > 0);

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col min-h-full bg-white">
                {/* Header Section */}
                <div className="p-8 pb-4">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {competition.imageUrl && (
                            <div className="w-full lg:w-[240px] flex-shrink-0">
                                <div className="aspect-[3/4] relative rounded-xl overflow-hidden shadow-md border border-slate-100">
                                    <Image
                                        src={competition.imageUrl}
                                        alt={competition.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 240px"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex-grow space-y-4">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 leading-tight mb-2">
                                        {competition.title}
                                    </h1>
                                    <p className="text-xl font-bold text-primary">
                                        {competition.organizer || "ผู้จัดงาน"}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-4 py-1.5 rounded-full border-none">
                                    <Icon className="mr-2 h-4 w-4" />
                                    {competition.category}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center text-slate-500 font-bold">
                                    <MapPin className="mr-3 h-5 w-5 text-primary" />
                                    <span>ออนไลน์ • กรุงเทพและปริมณฑล</span>
                                </div>
                                <div className="flex items-center text-slate-500 font-bold">
                                    <Users className="mr-3 h-5 w-5 text-primary" />
                                    <span>{Array.isArray(competition.participantType) ? competition.participantType.join(', ') : competition.participantType}</span>
                                </div>
                                <div className="flex items-center text-slate-500 font-bold">
                                    <Calendar className="mr-3 h-5 w-5 text-primary" />
                                    <span>{format(deadlineDate, 'd MMMM yyyy', { locale: th })}</span>
                                </div>
                                <div className={cn("flex items-center font-black", isPastDeadline ? 'text-slate-400' : 'text-primary')}>
                                    <Clock className="mr-3 h-5 w-5" />
                                    <span>{isPastDeadline ? 'หมดเขตแล้ว' : `ปิดรับสมัคร ${formatDistanceToNow(deadlineDate, { addSuffix: true, locale: th })}`}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 pt-4">
                                {user && (
                                    <>
                                        <SaveCompetitionButton
                                            userId={user.uid}
                                            competitionId={competition.id}
                                            isInitiallySaved={competition.isSaved || isSaved}
                                        />
                                        {!isPastDeadline && (
                                            competition.isApplicationEnabled ? (
                                                <Button 
                                                    size="lg" 
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 rounded-xl shadow-lg shadow-emerald-600/20"
                                                    onClick={() => setIsSubmissionFormOpen(true)}
                                                >
                                                    <Upload className="mr-2 h-5 w-5" />
                                                    สมัครผ่านเว็บไซต์
                                                </Button>
                                            ) : (
                                                <LogSubmissionButton competition={competition} user={user} />
                                            )
                                        )}
                                    </>
                                )}
                                {competition.id && (
                                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 rounded-xl" asChild>
                                        <Link href={`/competitions/${competition.id}`}>
                                            ดูรายละเอียดเต็ม
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 space-y-10">
                    <Separator />
                    
                    {/* Prizes Section */}
                    {competition.totalPrize > 0 && (
                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                             <h2 className="text-xl font-black text-primary mb-4 flex items-center">
                                <HandCoins className="mr-3 h-6 w-6" /> รางวัลรวม {competition.totalPrize.toLocaleString()} บาท
                             </h2>
                             <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {competition.prizes.map((prize, index) => (
                                    <li key={index} className="flex items-start gap-3 text-slate-700 font-bold">
                                        <Award className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                        {prize}
                                    </li>
                                ))}
                             </ul>
                        </div>
                    )}

                    {/* Description Section */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">รายละเอียดการแข่งขัน</h2>
                        <div className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed text-lg">
                            {competition.description}
                        </div>
                    </section>

                    {/* Rules Section */}
                    <section>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter flex items-center">
                            <Gavel className="mr-3 h-6 w-6 text-primary" /> กติกาและเงื่อนไข
                        </h2>
                        <div className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            {competition.rules}
                        </div>
                    </section>

                    {/* Resources Section */}
                    {hasResources && (
                        <section>
                            <h2 className="text-xl font-black text-slate-900 mb-4">แหล่งข้อมูลเพิ่มเติม</h2>
                            <div className="flex flex-wrap gap-4">
                                {competition.rulesUrls?.map((url, index) => (
                                    <Button variant="outline" asChild key={`rule-${index}`} className="font-bold rounded-xl border-slate-200">
                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                            <Download className="mr-2 h-4 w-4 text-primary" />
                                            กติกาแบบละเอียด #{index + 1}
                                        </a>
                                    </Button>
                                ))}
                                {competition.socialUrls?.map((url, index) => (
                                    <Button variant="outline" asChild key={`social-${index}`} className="font-bold rounded-xl border-slate-200">
                                        <a href={url} target="_blank" rel="noopener noreferrer">
                                            <Share2 className="mr-2 h-4 w-4 text-primary" />
                                            ติดตามข่าวสาร #{index + 1}
                                        </a>
                                    </Button>
                                ))}
                            </div>
                        </section>
                    )}

                    {related && related.length > 0 && (
                        <div className="pt-10">
                            <Separator className="mb-10" />
                            <h2 className="text-2xl font-black text-slate-900 mb-6 font-headline">การแข่งขันที่เกี่ยวข้อง</h2>
                            <RelatedCompetitions competitions={related} />
                        </div>
                    )}
                </div>
                
                {/* Footer space */}
                <div className="h-20" />
            </div>

            <SubmissionForm 
                competition={competition} 
                isOpen={isSubmissionFormOpen} 
                onOpenChange={setIsSubmissionFormOpen} 
            />
        </ScrollArea>
    );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
