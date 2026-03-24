'use client';

import { Search, MapPin, Briefcase, Sparkles, ArrowRight, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, PARTICIPANT_TYPES, HeroAd } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import Link from 'next/link';

import { useSearch } from '@/providers/search-provider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { getActiveHeroAdsFromD1 } from '@/lib/d1-actions';
import { Skeleton } from '@/components/ui/skeleton';

interface HeroSearchHorizontalProps {
  scrollY?: number;
}

export default function HeroSearchHorizontal({
  scrollY = 0
}: HeroSearchHorizontalProps) {
  const {
    searchTerm, setSearchTerm,
    categoryFilter, setCategoryFilter,
    participantTypeFilter, setParticipantTypeFilter,
    handleSearch
  } = useSearch();
  
  const [isOpen, setIsOpen] = useState(false);

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  const [ads, setAds] = useState<HeroAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAds() {
      try {
        const data = await getActiveHeroAdsFromD1();
        setAds(data);
      } catch (e) {
        console.error("Failed to load ads from D1:", e);
        // Fallback or empty state is handled by isLoading
      } finally {
        setIsLoading(false);
      }
    }
    loadAds();
  }, []);

  // Carousel Logic
  const nextSlide = useCallback(() => {
    if (!ads || ads.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % ads.length);
  }, [ads]);

  const prevSlide = useCallback(() => {
    if (!ads || ads.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + ads.length) % ads.length);
  }, [ads]);

  useEffect(() => {
    if (!ads || ads.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [ads, nextSlide]);

  const suggestions = [
    "ประกวดออกแบบโลโก้",
    "แข่งขันเขียนโปรแกรม",
    "ประกวดเรียงความ",
    "Pitching Startup",
    "แข่งขันหุ่นยนต์"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setTimeout(() => {
        handleSearch();
    }, 100);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Featured Ad Carousel */}
      <motion.div 
        className="w-full px-0 md:px-4 mb-6 relative z-20"
        style={{
          transform: `translateY(${Math.max(0, scrollY * 0.2)}px)`,
        }}
      >
        <div className="relative w-full aspect-[21/9] md:aspect-[24/7] bg-white rounded-none md:rounded-[2.5rem] shadow-2xl overflow-hidden flex items-center justify-center group">
          {isLoading ? (
            <Skeleton className="absolute inset-0 w-full h-full" />
          ) : ads && ads.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={ads[currentSlide].id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Link href={ads[currentSlide].linkUrl} className="block w-full h-full">
                    <img 
                      src={ads[currentSlide].imageUrl} 
                      alt={ads[currentSlide].title}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                </motion.div>
              </AnimatePresence>

              {ads.length > 1 && (
                <>
                  {/* Controls */}
                  <button 
                    onClick={(e) => { e.preventDefault(); prevSlide(); }}
                    className="absolute left-4 md:left-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/30 hover:bg-white/80 flex items-center justify-center backdrop-blur-sm text-slate-800 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-sm z-30"
                  >
                    <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); nextSlide(); }}
                    className="absolute right-4 md:right-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/30 hover:bg-white/80 flex items-center justify-center backdrop-blur-sm text-slate-800 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-sm z-30"
                  >
                    <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                  </button>
                  
                  {/* Indicators */}
                  <div className="absolute bottom-4 md:bottom-6 flex gap-2.5 z-30">
                    {ads.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={cn(
                          "w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-all",
                          idx === currentSlide ? "bg-white w-6 md:w-8" : "bg-white/60"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 bg-slate-50 text-center p-4 sm:p-8">
              <div className="relative mb-2">
                <Award className="h-16 w-16 sm:h-24 sm:w-24 md:h-28 md:w-28 text-slate-300 drop-shadow-sm" strokeWidth={1.5} />
              </div>
              <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight z-10 text-slate-400 px-4">ยังไม่มีโฆษณาขณะนี้</h2>
            </div>
          )}
        </div>
      </motion.div>

      {/* Premium Search Bar Section */}
      <div className="w-full relative px-4 z-30">
        {/* Desktop Search Bar */}
        <div className="hidden md:block">
          <div className="relative group max-w-[50rem] mx-auto">
            {/* Ambient Glow */}
            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative flex items-center bg-white/95 backdrop-blur-2xl rounded-full p-2 pl-6 shadow-xl transition-all border border-slate-100/50">
                <Sparkles className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                
                {/* Keyword Search */}
                <div className="flex-grow min-w-[200px]">
                  <Input 
                    type="text"
                    placeholder="ค้นหาการแข่งขัน..."
                    className="bg-transparent border-none text-slate-900 text-base placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 font-medium px-0"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>

                <div className="w-[1px] h-8 bg-slate-200 mx-2 flex-shrink-0" />

                {/* Category Search */}
                <div className="w-40 flex-shrink-0">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-transparent border-none text-slate-700 font-bold h-12 focus:ring-0 shadow-none px-4 text-left">
                      <Briefcase className="h-4 w-4 mr-2 text-primary/60" />
                      <SelectValue placeholder="ทุกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-100 rounded-xl shadow-2xl">
                      <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-[1px] h-8 bg-slate-200 mx-2 flex-shrink-0" />

                {/* Participant Type Search */}
                <div className="w-36 flex-shrink-0">
                  <Select value={participantTypeFilter} onValueChange={setParticipantTypeFilter}>
                    <SelectTrigger className="bg-transparent border-none text-slate-700 font-bold h-12 focus:ring-0 shadow-none px-4 text-left">
                      <MapPin className="h-4 w-4 mr-2 text-primary/60" />
                      <SelectValue placeholder="ทุกระดับ" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-100 rounded-xl shadow-2xl">
                      <SelectItem value="all">ทุกระดับ</SelectItem>
                      {PARTICIPANT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                   onClick={handleSearch}
                   className="h-12 px-6 rounded-full bg-[#226ab3] hover:bg-[#1f60a2] text-white font-bold text-base flex items-center gap-2 group/btn transition-all active:scale-95 flex-shrink-0 ml-2"
                >
                  <span className="whitespace-nowrap inline-block mt-0.5">ค้นหา</span>
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
            </div>
          </div>

          {/* Search Suggestions labels */}
          <div className="mt-6 flex items-center justify-center gap-4 px-6">
            <span className="text-white/80 text-[13px] font-bold">ลองค้นหา:</span>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
                {suggestions.map((s) => (
                <button
                    key={s}
                    onClick={() => handleSuggestionClick(s)}
                    className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/10 text-white text-[13px] font-medium hover:bg-white/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    {s}
                </button>
                ))}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar Trigger */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsOpen(true)}
            className="w-full flex items-center bg-white border border-slate-200 rounded-full p-3 pl-5 shadow-xl text-left active:scale-[0.98] transition-all"
          >
            <Sparkles className="h-5 w-5 text-primary mr-3 shrink-0" />
            <span className="text-slate-400 text-base flex-grow font-medium truncate">ค้นหาการแข่งขัน...</span>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Search className="h-5 w-5 text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[92dvh] rounded-t-[2.5rem] bg-white border-slate-100 p-0 overflow-hidden shadow-2xl">
          <div className="p-8 h-full flex flex-col">
            <SheetHeader className="pb-8">
              <div className="flex justify-between items-center mb-2">
                 <SheetTitle className="text-slate-900 text-3xl font-black text-left flex items-center gap-3">
                    <Sparkles className="h-7 w-7 text-primary" />
                    ค้นหาการแข่งขัน
                </SheetTitle>
              </div>
              <p className="text-slate-500 text-sm text-left font-medium">ค้นหาการแข่งขันที่ใช่ ในหมวดหมู่ที่ชอบ</p>
            </SheetHeader>

            <div className="space-y-8 flex-grow overflow-y-auto pr-1 no-scrollbar text-left">
              <div className="space-y-3">
                <label className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] pl-1">ชื่อการแข่งขัน หรือ คำค้นหา</label>
                <div className="relative">
                  <Input 
                    placeholder="เช่น 'ประกวดออกแบบโลโก้'..."
                    className="h-16 bg-slate-50 border-slate-100 rounded-2xl text-slate-900 pl-5 text-lg placeholder:text-slate-400 focus:border-primary/50 focus:ring-primary/10 focus:bg-white transition-all shadow-inner"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <label className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] pl-1">หมวดหมู่</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-16 bg-slate-50 border-slate-100 rounded-2xl text-slate-900 font-bold px-5 focus:ring-0">
                      <SelectValue placeholder="ทุกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900 rounded-2xl shadow-2xl p-2">
                      <SelectItem value="all" className="rounded-xl focus:bg-slate-50">ทุกหมวดหมู่</SelectItem>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat} className="rounded-xl focus:bg-slate-50">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <label className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] pl-1">ระดับผู้แข่งขัน</label>
                  <Select value={participantTypeFilter} onValueChange={setParticipantTypeFilter}>
                    <SelectTrigger className="h-16 bg-slate-50 border-slate-100 rounded-2xl text-slate-900 font-bold px-5 focus:ring-0">
                      <SelectValue placeholder="ทุกระดับ" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-900 rounded-2xl shadow-2xl p-2">
                      <SelectItem value="all" className="rounded-xl focus:bg-slate-50">ทุกระดับ</SelectItem>
                      {PARTICIPANT_TYPES.map(type => (
                        <SelectItem key={type} value={type} className="rounded-xl focus:bg-slate-50">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

               {/* Mobile Suggestions */}
              <div className="space-y-4 pt-4">
                <label className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] pl-1">ลองค้นหา</label>
                <div className="flex flex-wrap gap-2.5">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSearchTerm(s)}
                      className="px-5 py-2.5 rounded-full border border-slate-100 bg-slate-50 text-slate-600 text-sm font-bold active:bg-slate-100 active:scale-95 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <SheetFooter className="mt-auto pt-8 border-t border-slate-100 bg-white">
              <Button 
                onClick={() => {
                  handleSearch();
                  setIsOpen(false);
                }}
                className="w-full h-18 rounded-[1.25rem] bg-primary hover:bg-primary/90 text-white font-black text-xl py-8 shadow-[0_10px_30px_rgba(34,106,179,0.2)] active:scale-[0.97] transition-all flex items-center justify-center gap-3"
              >
                <span>ค้นหาการแข่งขัน</span>
                <ArrowRight className="h-6 w-6" />
              </Button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
