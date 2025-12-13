
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Competition } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { getCategoryIcon } from './icons';
import { format, formatDistanceToNowStrict, isPast } from 'date-fns';
import { th } from 'date-fns/locale';
import { Clock } from 'lucide-react';

export default function RelatedCompetitions({ competitions }: { competitions: Competition[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">การแข่งขันอื่น ๆ ที่น่าสนใจ</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {competitions.map((competition) => (
            <CarouselItem key={competition.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1 h-full">
                <Link href={`/competitions/${competition.id}`} className="block h-full">
                  <Card className="h-full flex flex-col hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex flex-row items-start gap-4">
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
                            <p className="font-semibold text-primary mb-1 leading-tight">{competition.title}</p>
                            <div className="text-xs text-muted-foreground mb-2">
                                <p>{competition.category}</p>
                            </div>
                             <div className={`flex items-center text-xs text-muted-foreground ${isPast(new Date(competition.deadline)) ? 'text-destructive/90' : ''}`}>
                                <Clock className="mr-1.5 h-3 w-3" />
                                {isPast(new Date(competition.deadline)) ? 'หมดเขตแล้ว' : `เหลือ ${formatDistanceToNowStrict(new Date(competition.deadline), { locale: th })}`}
                            </div>
                        </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  );
}
