'use client';

import { useFormState } from 'react-dom';
import { useEffect, useState, useTransition, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import Image from 'next/image';

import { submitCompetition } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertCircle, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES, PARTICIPANT_TYPES } from '@/lib/types';
import type { Competition } from '@/lib/types';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const competitionFormSchema = z.object({
  title: z.string().min(5, 'ชื่อเรื่องต้องมีอย่างน้อย 5 ตัวอักษร'),
  description: z.string().min(20, 'รายละเอียดต้องมีอย่างน้อย 20 ตัวอักษร'),
  prizes: z.string().min(1, 'ส่วนรางวัลต้องไม่ว่างเปล่า'),
  totalPrize: z.coerce.number().min(0, 'รางวัลรวมต้องเป็นค่าบวก').optional(),
  rules: z.string().min(20, 'กติกาต้องมีอย่างน้อย 20 ตัวอักษร'),
  category: z.enum(CATEGORIES),
  participantType: z.enum(PARTICIPANT_TYPES),
  deadline: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "รูปแบบวันที่ไม่ถูกต้อง",
  }),
  imageUrl: z.string().optional().or(z.literal('')),
  rulesUrls: z.array(z.object({ value: z.string().url({ message: 'กรุณากรอก URL กติกาที่ถูกต้อง' }).optional().or(z.literal('')) })),
  socialUrls: z.array(z.object({ value: z.string().url({ message: 'กรุณากรอก URL โซเชียลที่ถูกต้อง' }).optional().or(z.literal('')) })),
});

type CompetitionFormData = z.infer<typeof competitionFormSchema>;

type CompetitionFormProps = {
    mode?: 'create' | 'edit';
    competition?: Competition;
}

export default function CompetitionForm({ mode = 'create', competition }: CompetitionFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [imagePreview, setImagePreview] = useState<string | null>(competition?.imageUrl || null);
  const [imageError, setImageError] = useState<string | null>(null);
  const isExistingPostWithUrl = competition?.imageUrl && !competition.imageUrl.startsWith('data:');
  const [imageSource, setImageSource] = useState<'upload' | 'url'>(isExistingPostWithUrl ? 'url' : 'upload');

  const { register, control, handleSubmit, watch, getValues, setValue, formState: { errors } } = useForm<CompetitionFormData>({
    resolver: zodResolver(competitionFormSchema),
    defaultValues: {
      title: competition?.title || '',
      description: competition?.description || '',
      prizes: competition?.prizes.join('\n') || '',
      totalPrize: competition?.totalPrize || 0,
      rules: competition?.rules || '',
      category: competition?.category,
      participantType: competition?.participantType,
      deadline: competition?.deadline ? format(new Date(competition.deadline), 'yyyy-MM-dd') : '',
      imageUrl: competition?.imageUrl || '',
      rulesUrls: competition?.rulesUrls?.map(url => ({ value: url })) || [{ value: '' }],
      socialUrls: competition?.socialUrls?.map(url => ({ value: url })) || [{ value: '' }],
    },
  });

  const { fields: rulesFields, append: appendRule, remove: removeRule } = useFieldArray({
    control,
    name: "rulesUrls",
  });

  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
    control,
    name: "socialUrls",
  });

  const onFormSubmit = (data: CompetitionFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      if (competition?.id) {
        formData.append('id', competition.id);
      }
      formData.append('mode', mode);
      
      // Append all other data
      Object.entries(data).forEach(([key, value]) => {
          if (key === 'rulesUrls' || key === 'socialUrls') {
            (value as {value: string}[]).forEach(item => {
              if (item.value) formData.append(key, item.value);
            });
          } else if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
      });
      
      const result = await submitCompetition({ message: '', success: false }, formData);

      if (result.success) {
        toast({
          title: 'สำเร็จ!',
          description: result.message,
        });
        router.push('/admin');
        router.refresh();
      } else {
        toast({
          title: 'เกิดข้อผิดพลาด',
          description: Object.values(result.errors || {}).flat().join('\n') || result.message,
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

  const imageUrlValue = watch('imageUrl');

  useEffect(() => {
    if (imageUrlValue) {
      setImagePreview(imageUrlValue);
    } else {
      setImagePreview(null);
    }
  }, [imageUrlValue]);


  return (
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 rounded-lg border bg-card p-8 shadow-sm">
        <div className="space-y-2">
            <Label htmlFor="title">ชื่อการแข่งขัน</Label>
            <Input 
              id="title"
              {...register('title')}
              placeholder="เช่น, Annual Design Awards" 
              required 
            />
            {errors.title && <p className="text-sm font-medium text-destructive">{errors.title.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea 
              id="description"
              {...register('description')}
              placeholder="อธิบายรายละเอียดการแข่งขัน..." 
              className="min-h-[120px]" 
              required
            />
            {errors.description && <p className="text-sm font-medium text-destructive">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="prizes">รางวัล (ระบุ 1 อย่างต่อ 1 บรรทัด)</Label>
                <Textarea id="prizes" {...register('prizes')} placeholder="- เงินรางวัล 10,000 บาท&#10;- ทุนการศึกษา&#10;- ใบประกาศเกียรติคุณ" className="min-h-[100px]" required />
                {errors.prizes && <p className="text-sm font-medium text-destructive">{errors.prizes.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="totalPrize">รางวัลรวม (บาท)</Label>
                <Input id="totalPrize" type="number" {...register('totalPrize')} placeholder="50000" />
                <p className="text-xs text-muted-foreground">ใส่เฉพาะตัวเลขสำหรับรางวัลที่เป็นเงิน</p>
                {errors.totalPrize && <p className="text-sm font-medium text-destructive">{errors.totalPrize.message}</p>}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="rules">กติกา</Label>
            <Textarea id="rules" {...register('rules')} placeholder="อธิบายกติกาการแข่งขัน..." className="min-h-[120px]" required />
            {errors.rules && <p className="text-sm font-medium text-destructive">{errors.rules.message}</p>}
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
                            {CATEGORIES.map(category => (
                                <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.category && <p className="text-sm font-medium text-destructive">{errors.category.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="participantType">ประเภทผู้เข้าแข่งขัน</Label>
                <Controller
                    name="participantType"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value} required>
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกประเภท" />
                            </SelectTrigger>
                            <SelectContent>
                            {PARTICIPANT_TYPES.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.participantType && <p className="text-sm font-medium text-destructive">{errors.participantType.message}</p>}
            </div>
        </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="deadline">วันสิ้นสุด</Label>
                <Input id="deadline" {...register('deadline')} type="date" required />
                {errors.deadline && <p className="text-sm font-medium text-destructive">{errors.deadline.message}</p>}
            </div>
        </div>
        <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">รายละเอียดเพิ่มเติม (ถ้ามี)</h3>
            <div className="space-y-2">
                <Label>โปสเตอร์การแข่งขัน</Label>
                <RadioGroup value={imageSource} onValueChange={handleSourceChange} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upload" id="r_upload_comp" />
                        <Label htmlFor="r_upload_comp">อัปโหลดไฟล์</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="url" id="r_url_comp" />
                        <Label htmlFor="r_url_comp">ใช้ URL</Label>
                    </div>
                </RadioGroup>
                
                {imageSource === 'upload' ? (
                    <div className="space-y-2">
                        <Input id="imageUpload" type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={handleImageUpload} />
                        <p className="text-xs text-muted-foreground">ขนาดไม่เกิน 2MB, แนะนำสัดส่วน 3:4 (เช่น 600x800px)</p>
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
                <div className="mt-4 relative w-full max-w-xs aspect-[3/4] rounded-md overflow-hidden border">
                    <Image src={imagePreview} alt="ตัวอย่างรูปภาพ" fill className="object-cover" />
                </div>
                )}
            </div>
            
            <div className="space-y-2">
              <Label>URL กติกา</Label>
              {rulesFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    {...register(`rulesUrls.${index}.value`)}
                    placeholder="https://example.com/rules.pdf"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRule(index)} disabled={rulesFields.length <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => appendRule({ value: '' })}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {errors.rulesUrls && <p className="text-sm font-medium text-destructive">{errors.rulesUrls.message || errors.rulesUrls.root?.message || (errors.rulesUrls[0] as any)?.value?.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>URL โซเชียล/ประกาศ</Label>
              {socialFields.map((field, index) => (
                 <div key={field.id} className="flex items-center gap-2">
                  <Input
                    {...register(`socialUrls.${index}.value`)}
                    placeholder="https://twitter.com/..."
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSocial(index)} disabled={socialFields.length <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => appendSocial({ value: '' })}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
               {errors.socialUrls && <p className="text-sm font-medium text-destructive">{errors.socialUrls.message || errors.socialUrls.root?.message || (errors.socialUrls[0] as any)?.value?.message}</p>}
            </div>
        </div>
        <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === 'edit' ? 'บันทึกการเปลี่ยนแปลง' : 'ส่งการแข่งขัน'}
        </Button>
      </form>
  );
}
