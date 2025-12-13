'use client';
import { useParams, notFound } from 'next/navigation';
import BlogPostForm from '@/components/blog-post-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { BlogPost } from '@/lib/types';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { getBlogPostQuery } from '@/lib/blog-actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBlogPostPage() {
    const params = useParams();
    const id = params.id as string;
    const firestore = useFirestore();
    
    const postQuery = useMemoFirebase(() => {
        if (!id || !firestore) return null;
        return getBlogPostQuery(firestore, id);
    }, [id, firestore]);

    const { data: post, isLoading } = useDoc<BlogPost>(postQuery);

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-12">
                 <Skeleton className="h-[80vh] w-full" />
            </div>
        )
    }

    if (!post) {
       notFound();
    }


  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
          <Button variant="ghost" asChild>
          <Link href="/admin/blog" className="flex items-center text-sm text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าจัดการบทความ
          </Link>
          </Button>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline">
          แก้ไขบทความ
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          แก้ไขรายละเอียดบทความของคุณด้านล่าง
        </p>
      </div>
      <BlogPostForm mode="edit" post={post} />
    </div>
  );
}
    