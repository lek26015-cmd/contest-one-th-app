'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Competition } from '@/lib/types';
import FeaturedCarousel from '@/components/featured-carousel';
import { Badge } from '@/components/ui/badge';

interface HomeHeroBannerProps {
  totalCompetitions: number;
  featuredCompetitions: Competition[];
  onTagClick: (tag: string) => void;
}

export default function HomeHeroBanner({
  totalCompetitions,
  featuredCompetitions,
  onTagClick
}: HomeHeroBannerProps) {
  return (
    <div className="w-full space-y-10">
      {/* Stats Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black tracking-[0.2em] uppercase text-[9px] px-4 py-1.5 rounded-full shadow-lg shadow-blue-500/20 border-none transition-transform hover:scale-105">
            🔥 Live Updates
          </Badge>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-[0.9]">
            การแข่งขันทั้งหมด <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              {totalCompetitions.toLocaleString()} รายการ
            </span>
          </h2>
          <p className="text-slate-500 font-bold text-lg tracking-tight">โอกาสทองรอให้คุณคว้าไว้ในวันนี้</p>
        </div>
      </div>

      {/* Hero Image Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative group w-full aspect-[21/9] md:aspect-[3/1] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 backdrop-blur-sm bg-gradient-to-br from-blue-500/5 to-purple-500/5"
      >
        <Image
          src="/Users/tawanberkfah/.gemini/antigravity/brain/569b78c0-ea17-4e10-9d1e-b3a105f5fee6/hero_competition_premium_1773776030784.png"
          alt="Premium Competition Hero"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-6 left-8 md:bottom-10 md:left-12">
          <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 text-[10px] uppercase tracking-[0.2em] px-4 py-1">
            Premium Experience
          </Badge>
        </div>
      </motion.div>

      {/* Main Banner / Carousel */}
      <div className="rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(31,38,135,0.1)] border border-white/40">
        {featuredCompetitions && featuredCompetitions.length > 0 ? (
          <FeaturedCarousel competitions={featuredCompetitions} />
        ) : (
          <div className="relative h-[320px] w-full bg-white/20 backdrop-blur-sm animate-pulse flex items-center justify-center">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">กำลังโหลดรายการแนะนำ...</span>
          </div>
        )}
      </div>
    </div>
  );
}
