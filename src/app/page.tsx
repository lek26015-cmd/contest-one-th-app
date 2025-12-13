
'use client';

import { useState, useMemo, useEffect } from 'react';
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
      filtered = filtered.filter(c => c.participantType === activeFilters.participantType);
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
      <div className="relative flex-grow">
        <Input
          placeholder="ค้นหาชื่อการแข่งขัน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
      <Button onClick={handleSearch} className="w-full lg:w-auto">
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
      <section className="relative bg-muted/20 pb-12 pt-12">
        <div className="absolute inset-0 hidden md:block">
          <Image
            src="https://picsum.photos/seed/hero-trophy/1920/1080"
            alt="glowing trophy"
            fill
            className="object-cover"
            data-ai-hint="glowing trophy dark background"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary md:text-white md:drop-shadow-lg font-headline sm:text-5xl">
              เปลี่ยนไอเดียให้เป็นธุรกิจจริง
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80 md:text-white/90 md:drop-shadow-sm">
              รวมเวทีประกวด Startup, Hackathon และแหล่งเงินทุนสำหรับผู้ประกอบการรุ่นใหม่ ค้นหาโอกาสเติบโตทางธุรกิจของคุณได้ที่นี่
            </p>
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

      <div id="competitions" className="container mx-auto px-4">
        <CompetitionBrowserV2 competitions={filteredAndSortedCompetitions} isLoading={isLoading || isSavedStatusLoading} />
      </div>

      <section className="py-12 md:py-20 bg-primary/5 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">
              บทความล่าสุด
            </h2>
            <Button variant="ghost" asChild>
              <Link href="/blog">
                ดูทั้งหมด <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts?.slice(0, 3).map((post) => (
              <Card key={post.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card">
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="relative h-40 w-full">
                    <Image
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </Link>
                <CardHeader className="p-4">
                  <CardTitle className="leading-tight text-base font-bold">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-4 pt-0">
                  <CardDescription className="line-clamp-2 text-xs">{post.excerpt}</CardDescription>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.authorImageUrl} alt={post.authorName} />
                      <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{post.authorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(post.date), 'd MMM yy', { locale: th })}
                      </p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
