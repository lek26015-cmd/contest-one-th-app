'use client';

import { useParams, notFound } from 'next/navigation';
import { getBlogPostsQuery, incrementBlogPostView } from '@/lib/blog-actions';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getCompetitions } from '@/lib/mock-data';
import RelatedCompetitions from '@/components/related-competitions';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { BlogPost } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useMemo } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { formatDate } from '@/lib/utils';

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;
    const firestore = useFirestore();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // This is not efficient, but it's the simplest way for now.
    // A better approach would be a direct query on the slug.
    useEffect(() => {
        if (firestore && slug) {
            const q = getBlogPostsQuery(firestore);
            if (!q) {
                setIsLoading(false);
                notFound();
                return;
            }
            const unsubscribe = onSnapshot(q, (snapshot) => {
                let foundPost: BlogPost | null = null;
                snapshot.forEach(doc => {
                    const data = doc.data() as Omit<BlogPost, 'id'>;
                    if (data.slug === slug) {
                        foundPost = { ...data, id: doc.id };
                    }
                });

                if (foundPost) {
                    if (!post) { // Only increment view on initial load
                        // @ts-ignore
                        incrementBlogPostView(firestore, foundPost.id);
                    }
                    setPost(foundPost);
                }

                setIsLoading(false);
                if (!foundPost && !snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) {
                    // If we've checked the server and found nothing, it's a 404
                    notFound();
                }
            }, () => {
                setIsLoading(false);
                notFound();
            });
            return () => unsubscribe();
        }
    }, [firestore, slug, post]);


    const otherPostsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return getBlogPostsQuery(firestore); // We'll filter client-side for simplicity
    }, [firestore]);

    const { data: allPosts, isLoading: isLoadingAllPosts } = useCollection<BlogPost>(otherPostsQuery);

    const otherPosts = useMemo(() => {
        if (!allPosts || !post) return [];
        return allPosts.filter(p => p.id !== post.id).slice(0, 2);
    }, [allPosts, post]);

    const featuredCompetitions = useMemo(() => getCompetitions().filter(c => c.featured).slice(0, 1), []);

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                <Skeleton className="h-screen w-full" />
            </div>
        )
    }

    if (!post) {
        // This is handled by the effect, but as a fallback
        notFound();
    }

    return (
        <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Button variant="ghost" asChild>
                    <Link href="/blog" className="flex items-center text-sm text-muted-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        กลับไปหน้าบล็อก
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <article className="lg:col-span-2">
                    <header className="mb-8">
                        <div className="relative aspect-video w-full mb-8 rounded-lg overflow-hidden">
                            <Image
                                src={post.imageUrl}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 1024px) 100vw, 66vw"
                            />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-primary font-headline mb-4">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={post.authorImageUrl} alt={post.authorName} />
                                    <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{post.authorName}</p>
                                    <p className="text-xs">
                                        เผยแพร่เมื่อ {formatDate(post.date, 'd MMMM yyyy')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 text-base leading-relaxed">
                        <p>{post.content}</p>
                    </div>
                </article>

                <aside className="lg:col-span-1">
                    <div className="sticky top-24 space-y-12">
                        <div>
                            <h3 className="text-xl font-bold mb-6 font-headline">บทความอื่น ๆ</h3>
                            <div className="space-y-6">
                                {otherPosts.map(otherPost => (
                                    <Link href={`/blog/${otherPost.slug}`} key={otherPost.slug} className="group block">
                                        <Card className="overflow-hidden hover:border-primary/50 transition-colors">
                                            <CardContent className="p-0">
                                                <div className="flex items-start gap-4 p-4">
                                                    <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                                                        <Image
                                                            src={otherPost.imageUrl}
                                                            alt={otherPost.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="80px"
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-primary leading-tight mb-1 group-hover:underline">{otherPost.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDate(otherPost.date, 'd MMM yy')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {featuredCompetitions.length > 0 && (
                            <div>
                                <RelatedCompetitions competitions={featuredCompetitions} />
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
