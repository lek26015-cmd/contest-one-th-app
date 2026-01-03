
'use client';

import { useState, useMemo, useEffect } from 'react';
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


type SortOrder = 'deadline-soonest' | 'deadline-latest' | 'newest';

export default function Home() {
  const { user } = useUser();
  const firestore = useFirestore();
  // State for filter controls
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CompetitionCategory | 'all'>('all');
  const [participantTypeFilter, setParticipantTypeFilter] = useState<ParticipantType | 'all'>('all');
  const [prizeFilter, setPrizeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // State to hold the active filters after search button is clicked
  const [activeFilters, setActiveFilters] = useState({
    searchTerm: '',
    category: 'all',
    participantType: 'all',
    prize: 'all',
    sort: 'newest',
  });

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

  const handleSearch = () => {
    setActiveFilters({
      searchTerm,
      category: categoryFilter,
      participantType: participantTypeFilter,
      prize: prizeFilter,
      sort: sortOrder,
    });
    setIsFilterSheetOpen(false); // Close sheet after search on mobile
  };

  const handleMobileSearchOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

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
      filtered = filtered.filter(c => c.title.toLowerCase().includes(activeFilters.searchTerm.toLowerCase()));
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

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        id="search-term"
        placeholder="ค้นหาชื่อการแข่งขัน..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
        onKeyDown={handleMobileSearchOnEnter}
      />
    </div>
  );




  const filterControls = (
    <div className='flex flex-col lg:flex-row gap-2'>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 flex-grow">
        <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CompetitionCategory | 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="หมวดหมู่งาน" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
            {CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={participantTypeFilter} onValueChange={(value) => setParticipantTypeFilter(value as ParticipantType | 'all')}>
          <SelectTrigger>
            <SelectValue placeholder="ประเภทผู้เข้าแข่งขัน" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกประเภท</SelectItem>
            {PARTICIPANT_TYPES.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={prizeFilter} onValueChange={(value) => setPrizeFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder="รางวัลรวมขั้นต่ำ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {PRIZE_RANGES.map(prize => (
              <SelectItem key={prize} value={String(prize)}>
                &gt; {prize.toLocaleString()} บาท
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
          <SelectTrigger>
            <SelectValue placeholder="เรียงตาม" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">ใหม่ล่าสุด</SelectItem>
            <SelectItem value="deadline-soonest">วันสิ้นสุด (เร็วที่สุด)</SelectItem>
            <SelectItem value="deadline-latest">วันสิ้นสุด (ช้าที่สุด)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSearch} className="w-full lg:w-auto px-8">
        <Search className="mr-2 h-4 w-4" />
        ค้นหา
      </Button>
    </div>
  );

  const mobileSheetFilters = (
    <div className='space-y-4'>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category-filter-mobile">หมวดหมู่งาน</Label>
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CompetitionCategory | 'all')}>
            <SelectTrigger id="category-filter-mobile">
              <SelectValue placeholder="หมวดหมู่งาน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="participant-filter-mobile">ประเภทผู้เข้าแข่งขัน</Label>
          <Select value={participantTypeFilter} onValueChange={(value) => setParticipantTypeFilter(value as ParticipantType | 'all')}>
            <SelectTrigger id="participant-filter-mobile">
              <SelectValue placeholder="ประเภทผู้เข้าแข่งขัน" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกประเภท</SelectItem>
              {PARTICIPANT_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="prize-filter-mobile">รางวัลรวมขั้นต่ำ</Label>
        <Select value={prizeFilter} onValueChange={(value) => setPrizeFilter(value)}>
          <SelectTrigger id="prize-filter-mobile">
            <SelectValue placeholder="รางวัลรวมขั้นต่ำ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {PRIZE_RANGES.map(prize => (
              <SelectItem key={prize} value={String(prize)}>
                &gt; {prize.toLocaleString()} บาท
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sort-order-mobile">เรียงตาม</Label>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
          <SelectTrigger id="sort-order-mobile">
            <SelectValue placeholder="เรียงตาม" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">ใหม่ล่าสุด</SelectItem>
            <SelectItem value="deadline-soonest">วันสิ้นสุด (เร็วที่สุด)</SelectItem>
            <SelectItem value="deadline-latest">วันสิ้นสุด (ช้าที่สุด)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );


  return (
    <>
      <section className="relative bg-[#020617] pb-12 pt-12 md:pb-32 overflow-hidden">
        <div className="container relative mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-left z-10"
            >
              <h1 className="text-4xl font-extrabold tracking-tight text-white md:drop-shadow-lg font-headline sm:text-5xl mb-6 leading-tight">
                รวมทุกเวทีประกวด<br />
                <span className="text-primary-foreground/90">เพื่อคนมีของ</span>
              </h1>
              <p className="max-w-lg text-lg text-white/80 md:drop-shadow-sm mb-8 leading-relaxed">
                ไม่ว่าจะเป็น Startup, Hackathon, ออกแบบ, ถ่ายภาพ, หรือดนตรี ค้นหาโอกาสแสดงศักยภาพและเติบโตในเส้นทางของคุณได้ที่นี่
              </p>

              {/* Search Bar integrated into Hero for Desktop */}
              <div className="hidden md:block max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="คุณอยากพัฒนาทักษะอะไร?"
                    className="pl-10 h-12 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button
                    className="absolute right-1 top-1 bottom-1 rounded-full px-6"
                    onClick={handleSearch}
                  >
                    ค้นหา
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center"
            >
              <div className="relative w-full h-full max-w-md">
                <Image
                  src="/hero_competition_graphic_1765619144232.png"
                  alt="Competition Graphic"
                  fill
                  className="object-contain drop-shadow-2xl mix-blend-lighten"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-muted/20 pb-12 md:bg-transparent md:pb-0">
        <div className="container mx-auto px-4">
          <div className="relative md:-mt-16 z-10 mx-auto max-w-5xl">
            {/* Desktop Filters (Floating) */}
            <div className="hidden md:block p-4 bg-card border rounded-lg shadow-lg">
              {filterControls}
            </div>

            {/* Mobile Filter */}
            <div className="md:hidden bg-primary/10 p-3 rounded-lg shadow-lg">
              <div className="flex gap-2">
                <div className='flex-grow'>
                  {searchInput}
                </div>
                <Button onClick={handleSearch} className="flex-shrink-0">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">ค้นหา</span>
                </Button>
                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="secondary" className="flex-shrink-0">
                      <SlidersHorizontal className="h-5 w-5" />
                      <span className="sr-only">เปิดฟิลเตอร์</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="rounded-t-lg">
                    <SheetHeader className="mb-4">
                      <SheetTitle>กรองการแข่งขัน</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4">
                      {mobileSheetFilters}
                    </div>
                    <SheetFooter className="mt-6">
                      <Button onClick={handleSearch} className="w-full">
                        แสดงผลลัพธ์
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-12">
        {featuredCompetitions && featuredCompetitions.length > 0 && (
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold tracking-tight text-primary mb-6 font-headline">การแข่งขันแนะนำ</h2>
            <FeaturedCarousel competitions={featuredCompetitions} />
          </div>
        )}
      </section>

      <div id="competitions" className="container mx-auto px-4 mt-12">
        <CompetitionBrowserV2 competitions={filteredAndSortedCompetitions} isLoading={isLoading} />
      </div>

      <BlogSection posts={latestPosts || []} />
    </>
  );
}
