'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useTransition, useState, useEffect } from 'react';
import { BLOG_CATEGORIES } from '@/lib/types';
import type { BlogPost } from '@/lib/types';
import { createBlogPost, updateBlogPost } from '@/lib/blog-actions';
import { useFirestore, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const blogPostFormSchema = z.object({
  title: z.string().min(5, 'ชื่อเรื่องต้องมีอย่างน้อย 5 ตัวอักษร'),
  excerpt: z.string().min(10, 'คำโปรยต้องมีอย่างน้อย 10 ตัวอักษร'),
  content: z.string().min(50, 'เนื้อหาต้องมีอย่างน้อย 50 ตัวอักษร'),
  category: z.enum(BLOG_CATEGORIES, { required_error: 'กรุณาเลือกหมวดหมู่' }),
  imageUrl: z.string().min(1, { message: "กรุณาใส่รูปภาพ" }),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []),
  slug: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type BlogPostFormData = z.infer<typeof blogPostFormSchema>;

type BlogPostFormProps = {
  mode?: 'create' | 'edit';
  post?: BlogPost;
};

export default function BlogPostForm({ mode = 'create', post }: BlogPostFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(post?.imageUrl || null);
  const [imageError, setImageError] = useState<string | null>(null);

  const isExistingPostWithUrl = post?.imageUrl && !post.imageUrl.startsWith('data:');
  const [imageSource, setImageSource] = useState<'upload' | 'url'>(isExistingPostWithUrl ? 'url' : 'upload');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: post?.title || '',
      excerpt: post?.excerpt || '',
      content: post?.content || '',
      category: post?.category,
      imageUrl: post?.imageUrl || '',
      tags: post?.tags?.join(', ') || '',
      slug: post?.slug || '',
      metaTitle: post?.metaTitle || '',
      metaDescription: post?.metaDescription || '',
    },
  });

  const titleValue = watch('title');
  const slugValue = watch('slug');

  // Auto-generate slug from title if slug is empty or was auto-generated
  useEffect(() => {
    if (mode === 'create' && titleValue && !slugValue) {
      const generatedSlug = titleValue
        .toLowerCase()
        .replace(/^\s+|\s+$/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      setValue('slug', generatedSlug);
    }
  }, [titleValue, mode, setValue, slugValue]);

  const imageUrlValue = watch('imageUrl');

  useEffect(() => {
    if (imageUrlValue) {
      setImagePreview(imageUrlValue);
    } else {
      setImagePreview(null);
    }
  }, [imageUrlValue]);


  const onFormSubmit = (data: BlogPostFormData) => {
    if (!user) {
      toast({ title: "ไม่ได้รับอนุญาต", description: "คุณต้องเข้าสู่ระบบเพื่อสร้างบทความ", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      try {
        if (mode === 'create') {
          await createBlogPost(firestore, user, data);
          toast({ title: 'สำเร็จ!', description: 'สร้างบทความใหม่เรียบร้อยแล้ว' });
        } else if (post?.id) {
          await updateBlogPost(firestore, post.id, data);
          toast({ title: 'สำเร็จ!', description: 'อัปเดตบทความเรียบร้อยแล้ว' });
        }
        router.push('/admin');
        router.refresh(); // To reflect changes
      } catch (error: any) {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: error.message,
          variant: 'destructive',
        });
      }
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageError(null);
    setValue('imageUrl', '', { shouldValidate: true });

    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setImageError(`ขนาดไฟล์ต้องไม่เกิน ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImageError('ประเภทไฟล์ไม่ถูกต้อง (ต้องเป็น jpeg, png, หรือ webp เท่านั้น)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setValue('imageUrl', dataUrl, { shouldValidate: true });
    };
    reader.readAsDataURL(file);
  };

  const handleSourceChange = (source: 'upload' | 'url') => {
    setImageSource(source);
    setValue('imageUrl', '', { shouldValidate: true }); // Clear image on source change
    setImageError(null);
  }


  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 rounded-lg border bg-card p-8 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="title">ชื่อบทความ</Label>
        <Input id="title" {...register('title')} placeholder="หัวข้อที่น่าสนใจ..." required />
        {errors.title && <p className="text-sm font-medium text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">คำโปรย (Excerpt)</Label>
        <Textarea id="excerpt" {...register('excerpt')} placeholder="สรุปสั้นๆ เกี่ยวกับบทความ..." className="min-h-[80px]" required />
        {errors.excerpt && <p className="text-sm font-medium text-destructive">{errors.excerpt.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">เนื้อหา</Label>
        <Textarea id="content" {...register('content')} placeholder="เขียนเนื้อหาบทความของคุณที่นี่..." className="min-h-[250px]" required />
        {errors.content && <p className="text-sm font-medium text-destructive">{errors.content.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="category">หมวดหมู่</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value} required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent>
                  {BLOG_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="text-sm font-medium text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">แท็ก (คั่นด้วยเครื่องหมาย ,)</Label>
          <Input id="tags" {...register('tags')} placeholder="design, tips, inspiration" />
          {errors.tags && <p className="text-sm font-medium text-destructive">{errors.tags.message}</p>}
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <Label>รูปภาพหลัก</Label>
        <RadioGroup value={imageSource} onValueChange={handleSourceChange} className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upload" id="r_upload" />
            <Label htmlFor="r_upload">อัปโหลดไฟล์</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="url" id="r_url" />
            <Label htmlFor="r_url">ใช้ URL</Label>
          </div>
        </RadioGroup>

        {imageSource === 'upload' ? (
          <div className="space-y-2">
            <Input id="imageUpload" type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={handleImageUpload} />
            <p className="text-xs text-muted-foreground">ขนาดไม่เกิน 2MB, แนะนำสัดส่วน 3:2 (เช่น 1200x800px)</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              id="imageUrlInput"
              type="url"
              placeholder="https://example.com/image.jpg"
              {...register('imageUrl')}
            />
          </div>
        )}

        <input type="hidden" {...register('imageUrl')} />
        {errors.imageUrl && <p className="text-sm font-medium text-destructive">{errors.imageUrl.message}</p>}
        {imageError && <p className="text-sm font-medium text-destructive">{imageError}</p>}

        {imagePreview && (
          <div className="mt-4 relative w-full max-w-sm aspect-[3/2] rounded-md overflow-hidden border">
            <Image src={imagePreview} alt="ตัวอย่างรูปภาพ" fill className="object-cover" />
          </div>
        )}
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-bold text-primary">Search Engine Optimization (SEO)</h3>
        <p className="text-sm text-muted-foreground">ปรับแต่งการแสดงผลบนหน้าการค้นหาของ Google</p>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL Path)</Label>
          <Input
            id="slug"
            {...register('slug')}
            placeholder="เช่น 5-things-before-signing"
          />
          <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">Slug จะถูกสร้างจากหัวข้อโดยอัตโนมัติ แต่สามารถแก้ไขได้ ควรใช้ภาษาอังกฤษและคั่นด้วย -</p>
              </div>
            </div>
          </div>
          {errors.slug && <p className="text-sm font-medium text-destructive">{errors.slug.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input id="metaTitle" {...register('metaTitle')} placeholder="หัวข้อที่จะแสดงบน Google" />
          {errors.metaTitle && <p className="text-sm font-medium text-destructive">{errors.metaTitle.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea id="metaDescription" {...register('metaDescription')} placeholder="คำอธิบายสั้นๆ ที่จะแสดงในผลการค้นหา (ไม่เกิน 160 ตัวอักษร)" className="min-h-[80px]" />
          {errors.metaDescription && <p className="text-sm font-medium text-destructive">{errors.metaDescription.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {mode === 'edit' ? 'บันทึกการเปลี่ยนแปลง' : 'เผยแพร่บทความ'}
      </Button>
    </form>
  );
}
