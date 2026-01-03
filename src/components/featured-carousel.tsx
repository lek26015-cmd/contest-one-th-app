'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Competition } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay"

export default function FeaturedCarousel({ competitions }: { competitions: Competition[] }) {
  return (
    <Carousel
      plugins={[
        Autoplay({
          delay: 5000,
          stopOnInteraction: true,
        }),
      ]}
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {competitions.map((competition) => (
          <CarouselItem key={competition.id} className="md:basis-1/2 lg:basis-1/3 pl-4">
            <div className="p-1 h-full">
              <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300 border-primary border-2">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={competition.imageUrl || `https://picsum.photos/seed/${competition.id}/800/600`}
                    alt={competition.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                  <Badge className="absolute top-3 left-3" variant="destructive">ผู้สนับสนุน</Badge>
                </div>
                <CardContent className="flex flex-col flex-grow p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs font-normal">{competition.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {competition.totalPrize > 0 ? `฿${competition.totalPrize.toLocaleString()}` : ''}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-headline text-primary mb-2 line-clamp-2 leading-tight min-h-[3rem]">
                    {competition.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                    {competition.description}
                  </p>
                  <Button asChild variant="default" className="w-full mt-auto">
                    <Link href={`/competitions/${competition.id}?source=featured`}>
                      ดูรายละเอียด
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
}
