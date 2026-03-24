
'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BLOG_CATEGORIES, BlogCategory, BlogPost } from '@/lib/types';
import { getBlogPostsQuery } from '@/lib/blog-actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search, Filter, Calendar, User, BookOpen, Sparkles, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getBlogPostsFromD1 } from '@/lib/d1-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function BlogPage() {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getBlogPostsFromD1();
        setAllPosts(data);
      } catch (e) {
        console.error("Failed to load blog posts from D1:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, []);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Hero Header Section */}
      <section className="relative bg-gradient-to-br from-[#226ab3] via-[#226ab3] to-[#26aa79] pt-20 pb-32 overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 transform translate-x-1/2" />
        <div className="absolute top-[20%] right-[10%] w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute bottom-[10%] right-[5%] w-12 h-12 bg-white/10 rounded-full" />
        
        {/* Bottom Fade Gradient to blend with content */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F2F2F2] to-transparent pointer-events-none" />
        
        <div className="container mx-auto max-w-7xl px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm font-bold mb-6 border border-white/20"
          >
            <Sparkles className="h-4 w-4 text-sky-300" />
            เคล็ดลับและแรงบันดาลใจเพื่อชัยชนะ
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight font-headline drop-shadow-lg"
          >
            บล็อกของเรา
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl text-white/80 max-w-2xl mx-auto font-medium drop-shadow-md"
          >
            แรงบันดาลใจ และเรื่องราวเบื้องหลังการแข่งขันที่น่าสนใจ พร้อมเคล็ดลับที่จะช่วยให้คุณพิชิตรางวัลใหญ่
          </motion.p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <div className="container mx-auto max-w-5xl px-4 -mt-10 relative z-30">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="group relative"
        >
          {/* Ambient Glow */}
          <div className="absolute -inset-1 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
          
          <div className="relative bg-white/95 backdrop-blur-2xl rounded-full border border-slate-200 shadow-2xl p-2 pl-8 flex flex-col md:flex-row items-center transition-all group-focus-within:border-primary/30">
            <div className="relative flex-grow flex items-center w-full">
              <Search className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
              <Input
                placeholder="ค้นหาบทความที่น่าสนใจ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-slate-900 text-lg placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 font-bold transition-all w-full"
              />
            </div>
            
            <div className="hidden md:block w-[1px] h-8 bg-slate-200 mx-4 flex-shrink-0" />
            
            <div className="flex items-center w-full md:w-auto px-4 md:px-0 mt-2 md:mt-0">
                <div className="flex items-center gap-2 h-14 min-w-[180px] w-full md:w-auto">
                    <Filter className="h-4 w-4 text-primary/60" />
                    <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as BlogCategory | 'all')}>
                        <SelectTrigger className="border-none bg-transparent h-full w-full focus:ring-0 p-0 text-base font-black text-slate-700 shadow-none">
                            <SelectValue placeholder="ทุกหมวดหมู่" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                            <SelectItem value="all" className="font-bold py-3">ทุกหมวดหมู่</SelectItem>
                            {BLOG_CATEGORIES.map(category => (
                                <SelectItem key={category} value={category} className="font-bold py-3">{category}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                <Button 
                    variant="default"
                    className="hidden md:flex h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg items-center gap-3 transition-all shadow-[0_10px_20px_rgba(34,106,179,0.3)] active:scale-95 ml-4"
                >
                    ค้นหา
                </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Blog Cards Grid */}
      <div className="container mx-auto max-w-7xl px-4 py-16">
        {isLoading ? (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col space-y-4">
                <Skeleton className="h-64 w-full rounded-3xl" />
                <Skeleton className="h-8 w-3/4 rounded-xl" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPosts.map((post) => (
              <motion.div key={post.id} variants={itemVariants}>
                <Card className="group flex flex-col h-full overflow-hidden border-none bg-white rounded-3xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                  <Link href={`/blog/${post.slug || post.id}`} className="relative h-64 w-full overflow-hidden block">
                    <Image
                      src={post.imageUrl || `https://picsum.photos/seed/${post.id}/600/400`}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-primary font-black py-1.5 px-4 rounded-xl shadow-lg border-none">
                        {post.category}
                    </Badge>
                  </Link>
                  
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="leading-tight text-xl font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                      <Link href={`/blog/${post.slug || post.id}`}>
                        {post.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="px-8 flex-grow">
                    <CardDescription className="line-clamp-3 text-base font-medium text-slate-500 leading-relaxed">
                        {post.excerpt}
                    </CardDescription>
                  </CardContent>
                  
                  <CardFooter className="p-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-slate-50 ring-2 ring-primary/5">
                        <AvatarImage src={post.authorImageUrl} alt={post.authorName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-black">{post.authorName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-black text-slate-900 leading-none mb-1">{post.authorName}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                          {formatDate(post.date, 'd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all group/btn" asChild>
                      <Link href={`/blog/${post.slug || post.id}`}>
                        <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200"
          >
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">ไม่พบบทความที่คุณค้นหา</h3>
            <p className="text-slate-400 text-lg font-medium max-w-sm mx-auto">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่ใหม่อีกครั้งเพื่อค้นหาสิ่งที่น่าสนใจ</p>
            <Button onClick={() => {setSearchTerm(''); setCategoryFilter('all');}} variant="outline" className="mt-8 rounded-2xl font-black px-8 py-6 h-auto">
                รีเซ็ตการค้นหาทั้งหมด
            </Button>
          </motion.div>
        )}
      </div>

      {/* Newsletter / Call to Action Section */}
      <section className="container mx-auto max-w-7xl px-4 py-24">
          <div className="bg-gradient-to-br from-[#226ab3] via-[#226ab3] to-[#26aa79] rounded-[40px] p-8 md:p-16 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-sky-400/20 rounded-full blur-3xl -ml-16 -mb-16" />
              
              <div className="relative z-10 max-w-2xl mx-auto">
                  <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
                      <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">รับความรู้และเทคนิคใหม่ๆ ทุกสัปดาห์</h2>
                  <p className="text-white/80 text-xl font-medium mb-10 leading-relaxed">ร่วมเป็นส่วนหนึ่งในชุมชนของเรา และรับข่าวสารล่าสุด เคล็ดลับจากผู้ชนะ และโปรโมชันพิเศษส่งตรงถึงอีเมลคุณ</p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                      <Input placeholder="ระบุอีเมลของคุณ" className="h-14 rounded-2xl border-white/20 bg-white/10 text-white placeholder:text-white/50 text-lg font-bold" />
                      <Button className="h-14 px-8 rounded-2xl bg-white text-primary hover:bg-slate-100 font-black text-lg transition-transform hover:scale-105 active:scale-95 shadow-xl">
                          ติดตามเลย
                      </Button>
                  </div>
                  <p className="mt-6 text-white/40 text-sm font-bold uppercase tracking-widest">ไม่มีสแปม • ยกเลิกได้ตลอดเวลา</p>
              </div>
          </div>
      </section>
    </div>
  );
}
