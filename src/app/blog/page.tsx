'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BLOG_CATEGORIES, BlogCategory, BlogPost } from '@/lib/types';
import { getBlogPostsQuery } from '@/lib/blog-actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogPage() {
  const firestore = useFirestore();
  const blogPostsQuery = useMemoFirebase(() => getBlogPostsQuery(firestore), [firestore]);
  const { data: allPosts, isLoading } = useCollection<BlogPost>(blogPostsQuery);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BlogCategory | 'all'>('all');

  const filteredPosts = useMemo(() => {
    if (!allPosts) return [];
    return allPosts.filter(post => {
      const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
      const matchesSearch = searchTerm.trim() === '' ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allPosts, searchTerm, categoryFilter]);


  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline sm:text-5xl">
          บล็อกของเรา
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
          เคล็ดลับ, แรงบันดาลใจ, และเรื่องราวเบื้องหลังการแข่งขันต่างๆ
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาบทความ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex w-full sm:w-auto">
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as BlogCategory | 'all')}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="เลือกหมวดหมู่" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกหมวดหมู่</SelectItem>
              {BLOG_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative h-48 w-full">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </Link>
              <CardHeader>
                <CardTitle className="leading-tight text-lg font-bold">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={post.authorImageUrl} alt={post.authorName} />
                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{post.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(post.date, 'd MMMM yyyy')}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/blog/${post.slug}`}>
                    อ่านต่อ <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg font-semibold">ไม่พบบทความ</p>
          <p className="text-muted-foreground mt-2">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่ของคุณ</p>
        </div>
      )}
    </div>
  );
}
