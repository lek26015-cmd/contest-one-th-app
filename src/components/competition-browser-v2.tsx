'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Competition } from '@/lib/types';
import CompetitionListItem from './competition-list-item';
import CompetitionDetailView from './competition-detail-view';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Trophy, MousePointerClick } from 'lucide-react';

export default function CompetitionBrowserV2({ competitions, isLoading }: { competitions: Competition[], isLoading: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const [selectedIdState, setSelectedIdState] = useState<string | null>(null);

  useEffect(() => {
    // Sync local state with URL, but prefer window.location to avoid stale Next.js params
    // when using history.replaceState
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      if (urlId !== selectedIdState) {
        setSelectedIdState(urlId);
      }
    }
  }, [searchParams, pathname]); // Depend on pathname/searchParams to trigger on nav changes

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleSelectCompetition = (id: string) => {
    if (isMobile) {
      router.push(`/competitions/${id}`);
    } else {
      setSelectedIdState(id);
      const params = new URLSearchParams(window.location.search);
      params.set('id', id);
      const newUrl = `${pathname}?${params.toString()}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    }
  };

  const selectedCompetition = useMemo(() => {
    if (!selectedIdState) return null;
    return competitions.find(c => c.id === selectedIdState) || null;
  }, [selectedIdState, competitions]);

  useEffect(() => {
    if (!isMobile && competitions.length > 0 && !selectedIdState) {
      // Optional: Auto-select first item if nothing selected
    }
  }, [isMobile, competitions, selectedIdState]);

  if (!hydrated || isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        <div className="md:col-span-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
        <div className="hidden md:block md:col-span-2">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative group w-full">
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/50 via-purple-500/50 to-secondary/50 rounded-3xl blur-3xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full relative">
        {/* List View */}
        {/* List View */}
        <div className={`md:col-span-1 flex flex-col h-[calc(100vh-8rem)] rounded-lg border bg-card/90 overflow-hidden ${isMobile && selectedIdState ? 'hidden' : 'block'}`}>
          <ScrollArea className="flex-grow">
            <div className="space-y-2 p-2">
              <AnimatePresence mode="popLayout">
                {competitions.length > 0 ? (
                  competitions.map((comp, index) => (
                    <motion.div
                      key={comp.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <CompetitionListItem
                        competition={comp}
                        onSelect={() => handleSelectCompetition(comp.id)}
                        isSelected={!isMobile && selectedIdState === comp.id}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    ไม่พบการแข่งขันที่ค้นหา
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Detail View (Desktop) */}
        <div className="hidden md:block md:col-span-2 h-[calc(100vh-8rem)] sticky top-24">
          {selectedCompetition ? (
            <CompetitionDetailView competition={selectedCompetition} />
          ) : selectedIdState ? (
            // Loading state when ID is selected but data not found yet
            <div className="h-full w-full flex items-center justify-center border rounded-lg bg-card">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <div className="flex h-full min-h-[60vh] items-center justify-center rounded-lg border bg-card text-center">
              <div>
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <Trophy className="h-24 w-24 text-muted-foreground/20" />
                    <MousePointerClick className="absolute -bottom-2 -right-2 h-8 w-8 text-primary animate-bounce" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">เลือกการแข่งขันที่สนใจ</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                  คลิกที่รายการทางด้านซ้ายเพื่อดูรายละเอียด กติกา และของรางวัล
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
