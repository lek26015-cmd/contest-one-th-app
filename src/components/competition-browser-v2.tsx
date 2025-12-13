'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Competition } from '@/lib/types';
import CompetitionListItem from './competition-list-item';
import CompetitionDetailView from './competition-detail-view';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';

export default function CompetitionBrowserV2({ competitions, isLoading }: { competitions: Competition[], isLoading: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const selectedId = searchParams.get('id');

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleSelectCompetition = (id: string) => {
    if (isMobile) {
      router.push(`/competitions/${id}`);
    } else {
      const params = new URLSearchParams(window.location.search);
      params.set('id', id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  };

  const selectedCompetition = useMemo(() => {
    if (!selectedId) return null;
    return competitions.find(c => c.id === selectedId) || null;
  }, [selectedId, competitions]);

  useEffect(() => {
    if (!isMobile && competitions.length > 0 && !selectedId) {
        // By default, do not select any competition. User has to click.
        // const params = new URLSearchParams(window.location.search);
        // params.set('id', competitions[0].id);
        // router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [isMobile, competitions, selectedId, router, pathname]);

  if (!hydrated || isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start py-12">
        <div className="md:col-span-1 lg:col-span-1 rounded-lg border bg-card/80 flex flex-col h-full max-h-[calc(100vh-8rem)]">
          <div className="flex flex-col p-2 gap-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        </div>
        <div className="md:col-span-2 lg:col-span-3 h-full sticky top-24">
          <Skeleton className="h-[80vh] w-full" />
        </div>
      </div>
    )
  }

  if (isMobile) {
    return (
        <div className="py-8">
            {renderCompetitionList(true)}
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start py-12">
      <div className="md:col-span-1 lg:col-span-1 rounded-lg border bg-card/80 flex flex-col h-full max-h-[calc(100vh-8rem)]">
        {renderCompetitionList()}
      </div>
      <div className="md:col-span-2 lg:col-span-3 h-full sticky top-24">
        {selectedCompetition ? (
          <CompetitionDetailView competition={selectedCompetition} />
        ) : (
          <div className="flex h-full min-h-[60vh] items-center justify-center rounded-lg border bg-card text-center">
            <div>
              <p className="text-lg font-medium">ไม่มีการแข่งขันที่เลือก</p>
              <p className="text-muted-foreground">เลือกการแข่งขันจากรายการเพื่อดูรายละเอียด</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderCompetitionList(isMobileView = false) {
    const listContent = (
      <>
        {competitions.length > 0 ? (
          competitions.map(comp => (
            <CompetitionListItem
              key={comp.id}
              competition={comp}
              onSelect={() => handleSelectCompetition(comp.id)}
              isSelected={!isMobileView && selectedCompetition?.id === comp.id}
            />
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>ไม่พบการแข่งขัน</p>
          </div>
        )}
      </>
    );

    if (isMobileView) {
        return (
            <div className="grid grid-cols-1 gap-4 mt-8">
                {listContent}
            </div>
        )
    }

    return (
        <ScrollArea className="flex-grow">
            <div className="flex flex-col p-2 gap-2">
              {listContent}
            </div>
        </ScrollArea>
    )
  }
}
