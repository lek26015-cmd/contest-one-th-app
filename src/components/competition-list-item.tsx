
'use client';

import type { Competition } from '@/lib/types';
import { getCategoryIcon } from '@/components/icons';
import { Calendar, Clock, Star } from 'lucide-react';
import { format, formatDistanceToNowStrict, isPast } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type Props = {
  competition: Competition;
  isSelected: boolean;
  onSelect: () => void;
};

export default function CompetitionListItem({ competition, isSelected, onSelect }: Props) {
  const Icon = getCategoryIcon(competition.category);
  const deadlineDate = new Date(competition.deadline);
  const isExpired = isPast(deadlineDate);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-colors",
        "flex flex-row items-start gap-4",
        isSelected ? "bg-muted border-primary/50" : "border-transparent hover:bg-muted/50 hover:border-border",
      )}
    >
      {competition.imageUrl && (
        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
          <Image
            src={competition.imageUrl}
            alt={competition.title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <p className="font-semibold text-primary mb-1 pr-2">{competition.title}</p>
          {competition.isSaved && (
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center text-xs text-muted-foreground mb-2">
          <Icon className="mr-1.5 h-3 w-3" />
          {competition.category}
        </div>
        <div className="text-sm font-medium text-primary mb-2">
          💰 {competition.totalPrize > 0 ? `${competition.totalPrize.toLocaleString()} บาท` : 'ไม่ระบุ'}
        </div>
        <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="mr-1.5 h-3 w-3" />
            <span>{format(deadlineDate, 'd MMM yyyy', { locale: th })}</span>
          </div>
          <div className={`flex items-center ${isExpired ? 'text-destructive/90' : ''}`}>
            <Clock className="mr-1.5 h-3 w-3" />
            {isExpired ? 'หมดเขตแล้ว' : `เหลือ ${formatDistanceToNowStrict(deadlineDate, { locale: th })}`}
          </div>
        </div>
      </div>
    </button>
  );
}
