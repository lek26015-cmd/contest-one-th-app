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
          <CarouselItem key={competition.id} className="md:basis-1/2">
            <div className="p-1 h-full">
                <Card className="overflow-hidden h-full flex flex-col">
                    <div className="grid md:grid-cols-2 flex-grow">
                        <div className="relative aspect-video md:aspect-square">
                             <Image
                                src={competition.imageUrl || `https://picsum.photos/seed/${competition.id}/800/600`}
                                alt={competition.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <Badge className="absolute top-4 left-4" variant="destructive">แนะนำ</Badge>
                        </div>
                        <div className="flex flex-col justify-center p-6 sm:p-10">
                            <p className="text-sm text-muted-foreground mb-2">{competition.category}</p>
                            <h3 className="text-2xl font-bold font-headline text-primary mb-4 leading-tight">{competition.title}</h3>
                            <p className="text-muted-foreground line-clamp-3 mb-6 flex-grow">{competition.description}</p>
                            <Button asChild className="self-start">
                                <Link href={`/competitions/${competition.id}`}>
                                    ดูรายละเอียด
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex"/>
    </Carousel>
  );
}
