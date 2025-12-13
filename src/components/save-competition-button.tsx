'use client';

import { useOptimistic, useTransition, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { setDocumentNonBlocking, deleteDocumentNonBlocking, useFirestore, useUser } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getSavedCompetitionStatus } from '@/lib/user-actions';


type SaveCompetitionButtonProps = {
  userId: string;
  competitionId: string;
  isInitiallySaved: boolean;
};

export default function SaveCompetitionButton({
  userId,
  competitionId,
  isInitiallySaved,
}: SaveCompetitionButtonProps) {
  const [optimisticSaved, toggleOptimisticSaved] = useOptimistic(
    isInitiallySaved,
    (state) => !state
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();


  const handleClick = () => {
    if (!userId) {
      router.push('/login');
      return;
    }
    
    startTransition(() => {
      const wasSaved = optimisticSaved;
      toggleOptimisticSaved(wasSaved);

      const savedCompRef = doc(firestore, `users/${userId}/savedCompetitions`, competitionId);

      if (wasSaved) {
        // It was saved, so now we unsave it
        deleteDocumentNonBlocking(savedCompRef);
        toast({ description: 'ยกเลิกการบันทึกการแข่งขันแล้ว' });
      } else {
        // It was not saved, so now we save it
        const data = {
          competitionId: competitionId,
          savedAt: serverTimestamp(),
        };
        setDocumentNonBlocking(savedCompRef, data, { merge: false });
        toast({ description: 'บันทึกการแข่งขันแล้ว' });
      }
      // Note: Revalidation is not needed here as we are using client-side updates
      // and optimistic UI updates.
    });
  };

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleClick}
      disabled={isPending}
    >
      <Star
        className={cn(
          'mr-2 h-4 w-4',
          optimisticSaved && 'text-yellow-400 fill-yellow-400'
        )}
      />
      {optimisticSaved ? 'บันทึกแล้ว' : 'บันทึก'}
    </Button>
  );
}
