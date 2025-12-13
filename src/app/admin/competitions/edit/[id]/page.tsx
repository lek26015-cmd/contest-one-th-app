
'use client';
import { useParams, notFound } from 'next/navigation';
import CompetitionForm from '@/components/competition-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Competition } from '@/lib/types';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { getCompetitionQuery } from '@/lib/competition-actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditCompetitionPage() {
    const params = useParams();
    const id = params.id as string;
    const firestore = useFirestore();

    const competitionQuery = useMemoFirebase(() => {
        if (!id || !firestore) return null;
        return getCompetitionQuery(firestore, id);
    }, [id, firestore]);

    const { data: competition, isLoading } = useDoc<Competition>(competitionQuery);

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-12">
                 <Skeleton className="h-[80vh] w-full" />
            </div>
        )
    }

    if (!competition) {
       notFound();
    }


  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
          <Button variant="ghost" asChild>
          <Link href="/admin/competitions" className="flex items-center text-sm text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าจัดการแข่งขัน
          </Link>
          </Button>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline">
          แก้ไขการแข่งขัน
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          แก้ไขรายละเอียดการแข่งขันด้านล่าง
        </p>
      </div>
      <CompetitionForm mode="edit" competition={competition} />
    </div>
  );
}
