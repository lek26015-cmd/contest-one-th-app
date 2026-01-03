'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { BLOG_CATEGORIES, type BlogPost, type BlogCategory } from '@/lib/types';

interface BlogSectionProps {
    posts: BlogPost[];
}

export default function BlogSection({ posts }: BlogSectionProps) {
    const [activeCategory, setActiveCategory] = useState<BlogCategory | 'All'>('All');

    const filteredPosts = activeCategory === 'All'
        ? posts
        : posts.filter(post => post.category === activeCategory);

    return (
        <section className="py-12 md:py-20 bg-background">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline">
                        บทความแนะนำ
                    </h2>
                    <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-colors" asChild>
                        <Link href="/blog">
                            ดูบทความทั้งหมด
                        </Link>
                    </Button>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
                    <Button
                        variant={activeCategory === 'All' ? 'default' : 'outline'}
                        className={`rounded-full px-6 ${activeCategory === 'All' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-primary hover:border-primary'}`}
                        onClick={() => setActiveCategory('All')}
                    >
                        All
                    </Button>
                    {BLOG_CATEGORIES.map((category) => (
                        <Button
                            key={category}
                            variant={activeCategory === category ? 'default' : 'outline'}
                            className={`rounded-full px-6 ${activeCategory === category ? 'bg-primary text-white' : 'text-muted-foreground hover:text-primary hover:border-primary'}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                {/* Carousel */}
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {filteredPosts.map((post) => (
                            <CarouselItem key={post.id} className="pl-4 md:basis-1/2 lg:basis-1/4">
                                <div className="h-full">
                                    <Card className="flex flex-col h-full overflow-hidden border hover:shadow-lg transition-all duration-300 group">
                                        {/* Image */}
                                        <Link href={`/blog/${post.slug}`} className="relative aspect-[4/3] w-full overflow-hidden block">
                                            <Image
                                                src={post.imageUrl}
                                                alt={post.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                            />

                                        </Link>

                                        {/* Content */}
                                        <CardContent className="flex flex-col flex-grow p-5">
                                            <div className="mb-2">
                                                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                                    {post.category || 'ARTICLE'}
                                                </span>
                                            </div>

                                            <Link href={`/blog/${post.slug}`} className="block mb-2">
                                                <h3 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                                    {post.title}
                                                </h3>
                                            </Link>

                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-grow">
                                                {post.excerpt}
                                            </p>

                                            <div className="mt-auto pt-4">
                                                <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                                                    <Link href={`/blog/${post.slug}`}>
                                                        อ่านต่อ
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <div className="hidden md:block">
                        <CarouselPrevious className="-left-4 h-10 w-10 border-primary text-primary hover:bg-primary hover:text-white" />
                        <CarouselNext className="-right-4 h-10 w-10 border-primary text-primary hover:bg-primary hover:text-white" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
}
