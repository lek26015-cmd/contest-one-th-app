
'use client';

import type { Competition } from '@/lib/types';
import { getCategoryIcon } from '@/components/icons';
import { Calendar, Clock, Star, MapPin, Briefcase } from 'lucide-react';
import { format, formatDistanceToNowStrict, isPast } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';

import { useComparison } from '@/providers/comparison-provider';
import { Checkbox } from './ui/checkbox';

type Props = {
  competition: Competition;
  isSelected: boolean;
  onSelect: () => void;
};

export default function CompetitionListItem({ competition, isSelected, onSelect }: Props) {
  const { toggleComparison, isComparing } = useComparison();
  const Icon = getCategoryIcon(competition.category);
  const deadlineDate = new Date(competition.deadline);
  const isExpired = isPast(deadlineDate);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "w-full text-left p-6 rounded-xl border transition-all duration-200 bg-white mb-4 cursor-pointer",
        isSelected 
          ? "border-l-4 border-l-primary border-slate-200 shadow-md ring-1 ring-primary/10" 
          : "border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md"
      )}
    >
      <div className="flex flex-row items-start gap-6">
        {/* Logo Section */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100 p-2 flex items-center justify-center">
          {competition.imageUrl ? (
            <Image
              src={competition.imageUrl}
              alt={competition.title}
              width={80}
              height={80}
              className="object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200/50 rounded-md">
               <Icon className="h-8 w-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="font-black text-xl text-slate-900 mb-1 leading-tight line-clamp-2">
                {competition.title}
              </h3>
              <p className="text-slate-600 font-bold mb-3 truncate">
                {competition.organizer || "ผู้จัดงานอเนกประสงค์"}
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Bookmark Button */}
              <button
                className="p-1 rounded-full hover:bg-slate-50 transition-all active:scale-90"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // For now, toggle a local or competition property
                  // In a real app, this would call a backend/provider
                  competition.isSaved = !competition.isSaved;
                  // Force a re-render if needed, but for now we'll just toggle the UI
                  // Ideally this would be managed by a 'SavedProvider'
                  const btn = e.currentTarget;
                  const img = btn.querySelector('img');
                  if (img) {
                    img.src = competition.isSaved 
                      ? "/logo-contestone_icon-color-transparent.png" 
                      : "/logo-contestone_icon-grey-transparent.png";
                  }
                }}
                title={competition.isSaved ? "Saved" : "Save"}
              >
                <Image
                  src={competition.isSaved 
                    ? "/logo-contestone_icon-color-transparent.png" 
                    : "/logo-contestone_icon-grey-transparent.png"
                  }
                  alt="Bookmark"
                  width={24}
                  height={24}
                  className={cn(
                    "transition-all duration-300",
                    competition.isSaved ? "scale-110" : "opacity-60 grayscale hover:opacity-100"
                  )}
                />
              </button>

              <div 
                className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleComparison(competition.id);
                }}
              >
                <Checkbox 
                  id={`compare-${competition.id}`}
                  checked={isComparing(competition.id)}
                  onCheckedChange={() => toggleComparison(competition.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-slate-300"
                />
                <label 
                  htmlFor={`compare-${competition.id}`}
                  className="text-[10px] font-black uppercase tracking-wider text-slate-400 cursor-pointer"
                >
                  เปรียบเทียบ
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-4">
            <div className="flex items-center text-sm text-slate-500 font-medium">
              <MapPin className="mr-1.5 h-4 w-4 text-primary" />
              <span>ออนไลน์ • กรุงเทพและปริมณฑล</span>
            </div>
            <div className="flex items-center text-sm text-slate-500 font-medium">
              <Briefcase className="mr-1.5 h-4 w-4 text-primary" />
              <span>{competition.category}</span>
            </div>
          </div>

          <div className="bg-primary/10 inline-flex items-center px-4 py-2 rounded-lg">
             <span className="text-sm font-black text-primary">
               💰 {competition.totalPrize > 0 ? `${competition.totalPrize.toLocaleString()} บาท` : 'ไม่ระบุรางวัล'}
             </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
             {format(deadlineDate, 'd MMM yyyy', { locale: th })}
           </div>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest",
          isExpired ? "bg-slate-100 text-slate-400" : "bg-primary/10 text-primary"
        )}>
          {isExpired ? 'CLOSED' : `ENDS IN ${formatDistanceToNowStrict(deadlineDate, { locale: th })}`}
        </div>
      </div>
    </div>
  );
}
