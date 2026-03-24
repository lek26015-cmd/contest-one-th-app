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
import Image from 'next/image';

export default function CompetitionBrowserV2({ competitions, isLoading }: { competitions: Competition[], isLoading: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const [selectedIdState, setSelectedIdState] = useState<string | null>(null);

  useEffect(() => {
    // Sync local state with URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get('id');
      if (urlId !== selectedIdState) {
        setSelectedIdState(urlId);
      }
      
      // Auto-redirect to full page on mobile if id is present
      if (isMobile && urlId) {
        router.push(`/competitions/${urlId}`);
      }
    }
  }, [searchParams, pathname, isMobile, router]);

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
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        {/* List View */}
        <div className={cn(
          "lg:col-span-4 xl:col-span-3 flex flex-col h-[calc(100vh-10rem)] overflow-y-auto pr-4 block no-scrollbar"
        )}>
          <AnimatePresence mode="popLayout">
            {competitions.length > 0 ? (
              competitions.map((comp, index) => (
                <motion.div
                  key={comp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <CompetitionListItem
                    competition={comp}
                    onSelect={() => handleSelectCompetition(comp.id)}
                    isSelected={!isMobile && selectedIdState === comp.id}
                  />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-bold">ไม่พบการแข่งขันที่ท่านค้นหา</p>
                <p className="text-slate-400 text-sm mt-1">ลูกลองปรับเปลี่ยนคำค้นหาหรือตัวกรองดูนะ</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Detail View (Desktop) */}
        <div className="hidden lg:block lg:col-span-8 xl:col-span-9 h-[calc(100vh-10rem)] sticky top-24">
          <div className="h-full bg-white rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col transition-all">
            {selectedCompetition ? (
              <CompetitionDetailView competition={selectedCompetition} />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
                <div className="w-48 h-48 bg-slate-50 rounded-full flex items-center justify-center mb-6 overflow-hidden">
                   <Image 
                    src="/logo-contestone_icon-grey-transparent.png" 
                    alt="ContestOne" 
                    width={120} 
                    height={120} 
                    className="opacity-20 grayscale"
                   />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">เลือกงานที่สนใจเพื่อดูรายละเอียด</h3>
                <p className="text-slate-500 font-bold max-w-sm">
                  คลิกที่รายการด้านซ้ายมือเพื่อเปิดดูข้อมูล กติกา และเงื่อนไขทั้งหมดของการแข่งขัน
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
