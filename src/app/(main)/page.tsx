
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import BlogSection from '@/components/blog-section';
import CompetitionBrowserV2 from '@/components/competition-browser-v2';
import type { Competition, CompetitionCategory, ParticipantType, PrizeRange, BlogPost } from '@/lib/types';
import { CATEGORIES, PARTICIPANT_TYPES, PRIZE_RANGES } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { getCompetitionsQuery, getFeaturedCompetitionsQuery } from '@/lib/competition-actions';
import { getBlogPostsQuery } from '@/lib/blog-actions';
import FeaturedCarousel from '@/components/featured-carousel';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getSavedCompetitionStatus } from '@/lib/user-actions';
import { formatDate } from '@/lib/utils';
import { useSearch } from '@/providers/search-provider';
import HeroSearchHorizontal from '@/components/home/HeroSearchHorizontal';

type SortOrder = 'deadline-soonest' | 'deadline-latest' | 'newest';

export default function Home() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { 
    searchTerm, setSearchTerm, 
    categoryFilter, setCategoryFilter, 
    participantTypeFilter, setParticipantTypeFilter,
    handleSearch, activeFilters
  } = useSearch();

  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const competitionsQuery = useMemoFirebase(() => getCompetitionsQuery(firestore), [firestore]);
  const { data: competitions, isLoading } = useCollection<Competition>(competitionsQuery);

  const featuredCompetitionsQuery = useMemoFirebase(() => getFeaturedCompetitionsQuery(firestore), [firestore]);
  const { data: featuredCompetitions, isLoading: isLoadingFeatured } = useCollection<Competition>(featuredCompetitionsQuery);

  const blogPostsQuery = useMemoFirebase(() => getBlogPostsQuery(firestore), [firestore]);
  const { data: latestPosts, isLoading: isLoadingBlogPosts } = useCollection<BlogPost>(blogPostsQuery);

  const [competitionsWithSavedStatus, setCompetitionsWithSavedStatus] = useState<Competition[]>([]);
  const [isSavedStatusLoading, setIsSavedStatusLoading] = useState(false);

  useEffect(() => {
    if (user?.uid && competitions && competitions.length > 0) {
      setIsSavedStatusLoading(true);
      const checkSavedStatus = async () => {
        const savedChecks = competitions.map(async (comp) => {
          const isSaved = await getSavedCompetitionStatus(user.uid, comp.id);
          return { ...comp, isSaved };
        });
        const updatedComps = await Promise.all(savedChecks);
        setCompetitionsWithSavedStatus(updatedComps);
        setIsSavedStatusLoading(false);
      };
      checkSavedStatus();
    } else if (competitions) {
      setCompetitionsWithSavedStatus(competitions.map(c => ({ ...c, isSaved: false })));
    }
  }, [user, competitions]);

  const filteredAndSortedCompetitions = useMemo(() => {
    let filtered = competitionsWithSavedStatus;

    if (activeFilters.category !== 'all') {
      filtered = filtered.filter(c => c.category === activeFilters.category);
    }
    if (activeFilters.participantType !== 'all') {
      filtered = filtered.filter(c => Array.isArray(c.participantType) ? c.participantType.includes(activeFilters.participantType as ParticipantType) : c.participantType === activeFilters.participantType);
    }
    if (activeFilters.prize !== 'all') {
      filtered = filtered.filter(c => c.totalPrize >= parseInt(activeFilters.prize));
    }
    if (activeFilters.searchTerm) {
      const lowerSearch = activeFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(lowerSearch) || 
        c.description.toLowerCase().includes(lowerSearch)
      );
    }

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      const idA = a.id || "";
      const idB = b.id || "";

      if (activeFilters.sort === 'deadline-soonest') return dateA - dateB;
      if (activeFilters.sort === 'deadline-latest') return dateB - dateA;
      if (activeFilters.sort === 'newest') return idB.localeCompare(idA);
      return 0;
    });
  }, [competitionsWithSavedStatus, activeFilters]);

  const isMobile = useIsMobile();

  return (
    <>
      <section className="relative bg-gradient-to-br from-[#226ab3] via-[#226ab3] to-[#26aa79] pt-20 pb-16 overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-1/2" />
        <div className="absolute top-[20%] right-[10%] w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute bottom-[10%] right-[5%] w-12 h-12 bg-white/10 rounded-full" />
        
        {/* Bottom Fade Gradient to blend with content */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F2F2F2] to-transparent pointer-events-none" />
        
        <div className="container relative mx-auto px-4 z-10">
          <HeroSearchHorizontal 
            scrollY={scrollY}
          />
        </div>
      </section>

      <div className="bg-[#F2F2F2] min-h-screen">
        <div className="mx-auto px-4 py-8 w-full max-w-[1400px] 2xl:max-w-[1600px]">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 relative inline-block">
              งานแข่งขันสำหรับคุณ
              <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-primary/20 rounded-full" />
            </h2>
            <p className="text-slate-500 font-bold mt-2 text-center">ค้นพบโอกาสใหม่ๆ ในการแสดงความสามารถของคุณ</p>
          </div>

          <div id="competitions" className="relative h-full">
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
                <div className="md:col-span-1 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 w-full bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
                <div className="hidden md:block md:col-span-2">
                  <div className="h-full w-full bg-slate-100 rounded-lg animate-pulse" />
                </div>
              </div>
            }>
              <CompetitionBrowserV2 
                competitions={filteredAndSortedCompetitions} 
                isLoading={isLoading} 
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
