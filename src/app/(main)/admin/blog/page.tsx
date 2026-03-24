'use client';
import { useState, useMemo } from 'react';
import { deleteBlogPost, getBlogPostsQuery } from '@/lib/blog-actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import type { BlogPost } from '@/lib/types';
import { Trash2, PlusCircle, Search, Eye, Pencil } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminBlogPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [blogSearchTerm, setBlogSearchTerm] = useState('');

  const blogPostsQuery = useMemoFirebase(() => getBlogPostsQuery(firestore), [firestore]);
  const { data: blogPosts, isLoading: isLoadingBlogPosts } = useCollection<BlogPost>(blogPostsQuery);

  const handleDeleteBlogPost = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteBlogPost(firestore, id);
      toast({ title: 'สำเร็จ', description: 'บทความถูกลบแล้ว' });
    } catch (error) {
      toast({ title: 'เกิดข้อผิดพลาด', description: 'ไม่สามารถลบบทความได้', variant: 'destructive' });
      console.error(error);
    }
  };

  const filteredBlogPosts = useMemo(() => {
    if (!blogPosts) return [];
    if (!blogSearchTerm) return blogPosts;
    return blogPosts.filter(post => 
      post.title.toLowerCase().includes(blogSearchTerm.toLowerCase())
    );
  }, [blogPosts, blogSearchTerm]);

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold font-headline">จัดการบทความ</h1>
                <p className="text-muted-foreground">สร้าง, แก้ไข, และลบบทความในบล็อกของคุณ</p>
            </div>
            <Button asChild>
                <Link href="/admin/blog/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    สร้างบทความใหม่
                </Link>
            </Button>
        </div>

        <Card>
            <CardHeader>
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="ค้นหาบทความ..."
                        value={blogSearchTerm}
                        onChange={(e) => setBlogSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                    {isLoadingBlogPosts ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-[250px]" />
                                        <Skeleton className="h-4 w-[200px]" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-16" />
                            </div>
                        ))
                    ) : (
                        filteredBlogPosts?.map(post => (
                            <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg bg-card-foreground/5">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={post.authorImageUrl} alt={post.authorName} />
                                        <AvatarFallback>{post.authorName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{post.title}</p>
                                        <p className="text-sm text-muted-foreground">โดย {post.authorName} | <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" /> {(post.views || 0).toLocaleString()}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" title="Edit Post" asChild>
                                      <Link href={`/admin/blog/edit/${post.id}`}>
                                        <Pencil className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" title="Delete Post">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the blog post.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteBlogPost(post.id)}>
                                                Delete
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
