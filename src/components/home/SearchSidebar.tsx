'use client';

import { Search, Briefcase, Code, Cpu, Lightbulb, Train, Bus, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, PARTICIPANT_TYPES, CompetitionCategory, ParticipantType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SearchSidebarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: any) => void;
  participantTypeFilter: string;
  setParticipantTypeFilter: (value: any) => void;
  handleSearch: () => void;
}

export default function SearchSidebar({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  participantTypeFilter,
  setParticipantTypeFilter,
  handleSearch
}: SearchSidebarProps) {
  return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.1)] border border-white/50 p-7 w-full max-w-[340px] relative overflow-hidden group">
      {/* Accent Glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
      
      {/* Category Icons */}
      <div className="grid grid-cols-3 gap-3 mb-8 relative z-10">
        {[
          { id: 'Hackathon', icon: Code, label: 'Hackathon', color: 'bg-blue-500', text: 'text-blue-600' },
          { id: 'Business Plan', icon: Briefcase, label: 'Business', color: 'bg-indigo-500', text: 'text-indigo-600' },
          { id: 'Technology', icon: Cpu, label: 'Tech', color: 'bg-purple-500', text: 'text-purple-600' }
        ].map(({ id, icon: Icon, label, color, text }) => (
          <button 
            key={id}
            onClick={() => setCategoryFilter(id as any)}
            className={cn(
              "flex flex-col items-center gap-2 transition-all p-3 rounded-2xl",
              categoryFilter === id 
                ? "bg-white shadow-[0_8px_16px_rgba(0,0,0,0.05)] scale-105" 
                : "hover:bg-white/40 grayscale opacity-70 hover:grayscale-0 hover:opacity-100"
            )}
          >
            <div className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg",
              categoryFilter === id ? color : "bg-slate-200"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              categoryFilter === id ? text : "text-slate-400"
            )}>{label}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-6 relative z-10">
        <div className="space-y-2">
          <Label className="text-slate-500 font-extrabold text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> หมวดหมู่งาน
          </Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-white/80 border-white/20 rounded-[1.25rem] h-12 focus:ring-primary/20 shadow-sm font-semibold text-slate-700">
              <SelectValue placeholder="ทั้งหมด" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-white/20 backdrop-blur-xl bg-white/90">
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-500 font-extrabold text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> ประเภทผู้สมัคร
          </Label>
          <Select value={participantTypeFilter} onValueChange={setParticipantTypeFilter}>
            <SelectTrigger className="bg-white/80 border-white/20 rounded-[1.25rem] h-12 focus:ring-primary/20 shadow-sm font-semibold text-slate-700">
              <SelectValue placeholder="ทั้งหมด" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-white/20 backdrop-blur-xl bg-white/90">
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {PARTICIPANT_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-500 font-extrabold text-[10px] uppercase tracking-[0.2em] px-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> ค้นหา
          </Label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input 
              placeholder="คีย์เวิร์ด..." 
              className="pl-11 bg-white/80 border-white/20 rounded-[1.25rem] h-12 focus:ring-primary/20 shadow-sm placeholder:text-slate-400 font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-4">
          <Button 
            onClick={handleSearch}
            className="bg-primary hover:bg-black text-white w-full h-14 rounded-[1.25rem] shadow-xl shadow-primary/25 font-black uppercase tracking-[0.15em] transition-all hover:scale-[1.02] active:scale-[0.98] border-b-4 border-black/20"
          >
            ค้นหาเดี๋ยวนี้
          </Button>
          <button 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setParticipantTypeFilter('all');
            }}
            className="text-[10px] font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-[0.2em] text-center"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}
