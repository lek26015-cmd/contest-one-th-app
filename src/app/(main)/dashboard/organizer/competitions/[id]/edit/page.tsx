'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Upload, 
  Trophy, 
  Settings, 
  FileText, 
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Check,
  Loader2,
  Sparkles
} from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { CATEGORIES, PARTICIPANT_TYPES } from '@/lib/types';
import { useFirestore, useUser, useStorage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getCompetition, updateCompetition } from '@/lib/competition-actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const competitionSchema = z.object({
  title: z.string().min(5, 'ชื่อการแข่งขันต้องมีอย่างน้อย 5 ตัวอักษร'),
  organizer: z.string().min(2, 'ชื่อผู้จัดงานต้องมีอย่างน้อย 2 ตัวอักษร'),
  category: z.enum(CATEGORIES),
  description: z.string().min(20, 'คำอธิบายต้องมีอย่างน้อย 20 ตัวอักษร'),
  rules: z.string().min(20, 'กติตาต้องมีอย่างน้อย 20 ตัวอักษร'),
  totalPrize: z.coerce.number().min(0, 'เงินรางวัลต้องไม่ติดลบ'),
  prizes: z.array(z.string().min(1, 'ระบุชื่อรางวัล')).min(1, 'ต้องมีรางวัลอย่างน้อย 1 รายการ'),
  deadline: z.string().min(1, 'กรุณาระบุวันสิ้นสุด'),
  participantType: z.array(z.string()).min(1, 'กรุณาเลือกประเภทผู้สมัครอย่างน้อย 1 ประเภท'),
  imageUrl: z.string().url('กรุณาระบุ URL รูปภาพที่ถูกต้อง').optional().or(z.literal('')),
  location: z.string().optional(),
  isApplicationEnabled: z.boolean().default(false),
  formFields: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'number', 'email', 'url', 'multiline', 'file']),
    label: z.string().min(1, 'ระบุหัวข้อคำถาม'),
    placeholder: z.string().optional(),
    required: z.boolean().default(true),
  })).default([]),
});

type CompetitionFormValues = z.infer<typeof competitionSchema>;

const FORM_TEMPLATES = [
  {
    name: 'ทั่วไป',
    description: 'ไม่มีคำถามเพิ่มเติม (เฉพาะชื่อ, อีเมล, เบอร์)',
    fields: []
  },
  {
    name: 'Hackathon / Tech',
    description: 'เน้นลิงก์ผลงานและข้อมูลทางเทคนิค',
    fields: [
      { id: 'github_link', type: 'url', label: 'ลิงก์ GitHub / Repository', required: true },
      { id: 'tech_stack', type: 'text', label: 'เทคโนโลยีที่ใช้', required: true },
      { id: 'team_size', type: 'number', label: 'จำนวนสมาชิกในทีม', required: true }
    ]
  },
  {
    name: 'Design / Art',
    description: 'เน้น Portfolio และแนวคิดการออกแบบ',
    fields: [
      { id: 'portfolio_link', type: 'url', label: 'ลิงก์ Portfolio / Behance', required: true },
      { id: 'tool_used', type: 'text', label: 'เครื่องมือที่ใช้ (เช่น Figma, PS)', required: true },
      { id: 'concept', type: 'multiline', label: 'แนวคิดในการออกแบบ', required: true }
    ]
  },
  {
    name: 'Startup / Business',
    description: 'เน้น Pitch Deck และรายละเอียธุรกิจ',
    fields: [
      { id: 'pitch_deck', type: 'url', label: 'ลิงก์ Pitch Deck (G Drive/Canva)', required: true },
      { id: 'business_model', type: 'multiline', label: 'สรุปโมเดลธุรกิจสั้นๆ', required: true }
    ]
  }
];

export default function EditCompetitionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionSchema),
    defaultValues: {
      title: '',
      organizer: '',
      category: 'Business Plan',
      description: '',
      rules: '',
      totalPrize: 0,
      prizes: ['รางวัลชนะเลิศ'],
      deadline: '',
      participantType: [],
      imageUrl: '',
      location: 'ออนไลน์',
      isApplicationEnabled: false,
      formFields: [],
    },
  });

  const { fields: prizeFields, append: appendPrize, remove: removePrize } = useFieldArray({
    control: form.control,
    name: 'prizes' as any,
  });

  const { fields: formFields, append: appendFormField, remove: removeFormField, replace: replaceFormFields } = useFieldArray({
    control: form.control,
    name: 'formFields',
  });

  const isApplicationEnabled = form.watch('isApplicationEnabled');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    setIsUploading(true);
    try {
      const storageRef = ref(storage, `competitions/posters/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      form.setValue('imageUrl', url);
      toast({
        title: "อัปโหลดรูปภาพสำเร็จ",
        description: "รูปภาพหน้าปกถูกเปลี่ยนเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "เกิดข้อผิดพลาดในการอัปโหลด",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const applyTemplate = (templateFields: any[]) => {
    const fieldsWithNewIds = templateFields.map(field => ({
      ...field,
      id: Math.random().toString(36).substr(2, 9)
    }));
    replaceFormFields(fieldsWithNewIds);
    toast({
      title: "ใช้เทมเพลตสำเร็จ",
      description: "ฟอร์มถูกอัปเดตตามเทมเพลตที่เลือกเรียบร้อยแล้ว",
    });
  };

  useEffect(() => {
    async function fetchCompetition() {
      if (!firestore || !id) return;
      
      try {
        const data = await getCompetition(firestore, id);
        if (data) {
          // Pre-fill form
          form.reset({
            title: data.title || '',
            organizer: data.organizer || '',
            category: data.category || 'Business Plan',
            description: data.description || '',
            rules: data.rules || '',
            totalPrize: data.totalPrize || 0,
            prizes: data.prizes && data.prizes.length > 0 ? data.prizes : ['รางวัลชนะเลิศ'],
            deadline: data.deadline ? data.deadline.split('T')[0] : '', // Format for date input
            participantType: data.participantType || [],
            imageUrl: data.imageUrl || '',
            location: data.location || 'ออนไลน์',
            isApplicationEnabled: data.isApplicationEnabled || false,
            formFields: data.formFields || [],
          });
        } else {
          toast({
            title: "ไม่พบคลิปข้อมูล",
            description: "ไม่พบงานแข่งขันที่ต้องการแก้ไข",
            variant: "destructive",
          });
          router.push('/dashboard/organizer/competitions');
        }
      } catch (error) {
        console.error('Error fetching competition:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompetition();
  }, [firestore, id, form, router, toast]);

  async function onSubmit(values: CompetitionFormValues) {
    if (!user || !firestore || !id) return;

    setIsSubmitting(true);
    try {
      await updateCompetition(firestore, id, {
        ...values,
      } as any);

      toast({
        title: "แก้ไขงานแข่งขันสำเร็จ!",
        description: "ข้อมูลงานของคุณได้รับการอัปเดตเรียบร้อยแล้ว",
      });
      router.push('/dashboard/organizer/competitions');
    } catch (error) {
      console.error('Error updating competition:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหมีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-slate-400 font-bold">กำลังโหลดข้อมูลงานแข่งขัน...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/dashboard/organizer/competitions">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">แก้ไขงานแข่งขัน</h1>
          <p className="text-slate-400 font-bold">อัปเดตข้อมูลงานแข่งขันของคุณให้เป็นปัจจุบันปอยู่เสมอ</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Information */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
               <Settings className="h-4 w-4 text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ข้อมูลพื้นฐาน</span>
            </div>
            <CardContent className="p-8 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-slate-700">ชื่อการแข่งขัน <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="เช่น Hackathon for Future City 2024" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-semibold focus:ring-2 focus:ring-primary/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="organizer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-slate-700">ผู้จัดงาน <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="เช่น บริษัท เทคไทย จำกัด" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-semibold focus:ring-2 focus:ring-primary/20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-slate-700">หมวดหมู่ <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none px-4 font-semibold focus:ring-2 focus:ring-primary/20">
                            <SelectValue placeholder="เลือกหมวดหมู่" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-slate-100">
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat} className="font-semibold py-2.5">{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-slate-700">รายละเอียดโครงการ <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="อธิบายที่มา วัตถุประสงค์ และจุดเด่นของโครงการ..." 
                        className="min-h-[150px] rounded-2xl bg-slate-50 border-none p-4 font-semibold focus:ring-2 focus:ring-primary/20 resize-none transition-all" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 2: Prizes & Rewards */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
               <Trophy className="h-4 w-4 text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">รางวัลและการตอบแทน</span>
            </div>
            <CardContent className="p-8 space-y-6">
              <FormField
                control={form.control}
                name="totalPrize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-slate-700">มูลค่ารางวัลรวม (บาท)</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-12 rounded-xl bg-slate-50 border-none px-4 font-semibold focus:ring-2 focus:ring-primary/20" {...field} />
                    </FormControl>
                    <FormDescription>ระบุเป็นตัวเลขเท่านั้น (เช่น 500000)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel className="text-sm font-bold text-slate-700">รายการรางวัล</FormLabel>
                {prizeFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <FormControl>
                      <Input 
                        placeholder={`รางวัลลำดับที่ ${index + 1}`}
                        className="h-11 rounded-xl bg-slate-50 border-none px-4 font-semibold focus:ring-2 focus:ring-primary/20"
                        {...form.register(`prizes.${index}` as any)}
                      />
                    </FormControl>
                    {prizeFields.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-11 w-11 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50"
                        onClick={() => removePrize(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-dashed border-2 border-slate-200 text-slate-400 font-bold hover:bg-slate-50 hover:text-primary hover:border-primary"
                  onClick={() => appendPrize('')}
                >
                  <Plus className="mr-2 h-4 w-4" /> เพิ่มรางวัล
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Requirements */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
               <FileText className="h-4 w-4 text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">กติกาและคุณสมบัติ</span>
            </div>
            <CardContent className="p-8 space-y-8">
              <FormField
                control={form.control}
                name="participantType"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-sm font-bold text-slate-700">ประเภทผู้สมัครที่เปิดรับ <span className="text-red-500">*</span></FormLabel>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {PARTICIPANT_TYPES.map((item) => (
                        <FormField
                          key={item}
                          control={form.control}
                          name="participantType"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item}
                                className="flex flex-row items-center space-x-3 space-y-0 bg-slate-50 p-4 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-xs font-bold leading-none cursor-pointer">
                                  {item}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-slate-700">กติกาและเงื่อนไขการสมัคร <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="ระบุข้อกำหนด เกณฑ์การตัดสิน และขั้นตอนการเข้าร่วม..." 
                        className="min-h-[150px] rounded-2xl bg-slate-50 border-none p-4 font-semibold focus:ring-2 focus:ring-primary/20 resize-none transition-all" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Section 4: Application Form Builder */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">สร้างฟอร์มการรับสมัคร</span>
              </div>
              
              <FormField
                control={form.control}
                name="isApplicationEnabled"
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900">เปิดรับสมัครผ่านเว็บ</span>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                      />
                    </FormControl>
                  </div>
                )}
              />
            </div>
            <CardContent className={cn("relative p-8 space-y-8 transition-all duration-300", !isApplicationEnabled && "opacity-40 grayscale pointer-events-none")}>
              {!isApplicationEnabled && (
                <div className="absolute inset-x-0 bottom-0 top-[60px] z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-b-3xl">
                  <p className="text-slate-900 font-black text-xl mb-2">ปิดรับสมัครผ่านเว็บ</p>
                  <p className="text-slate-500 font-bold text-sm">เปิดใช้งานเพื่อสร้างฟอร์มรับสมัครและการจัดการข้อมูลผู้สมัคร</p>
                </div>
              )}

              {/* Template Selection */}
              <div className="space-y-4">
                <FormLabel className="text-sm font-bold text-slate-700">เลือกจากเทมเพลต</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {FORM_TEMPLATES.map((template) => (
                    <button
                      key={template.name}
                      type="button"
                      onClick={() => applyTemplate(template.fields)}
                      className="flex flex-col items-start p-4 rounded-2xl border-2 border-slate-100 bg-white hover:border-primary/30 hover:bg-slate-50 transition-all text-left group"
                    >
                      <span className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{template.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold leading-tight mt-1">{template.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <FormLabel className="text-sm font-bold text-slate-700">คำถามเพิ่มเติมในฟอร์ม</FormLabel>
                </div>
                
                {formFields.length === 0 && (
                  <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-slate-400 font-bold text-sm">ยังไม่มีคำถามเพิ่มเติม (จะมีเพียง ชื่อ-นามสกุล, อีเมล และเบอร์โทร เป็นค่าเริ่มต้นพื้นฐาน)</p>
                  </div>
                )}

                <div className="space-y-4">
                  {formFields.map((field, index) => (
                    <div key={field.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 relative">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-4 right-4 h-8 w-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50"
                        onClick={() => removeFormField(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-10">
                        <FormField
                          control={form.control}
                          name={`formFields.${index}.label`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-slate-500">คำถาม / หัวข้อ</FormLabel>
                              <FormControl>
                                <Input placeholder="เช่น ลิงก์ผลงาน, ทำไมคุณถึงอยากเข้าร่วม..." className="h-10 rounded-lg bg-white border-slate-200 font-semibold" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`formFields.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-slate-500">ประเภทคำตอบ</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-10 rounded-lg bg-white border-slate-200 font-semibold">
                                    <SelectValue placeholder="เลือกประเภท" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-xl border-slate-100">
                                  <SelectItem value="text" className="font-semibold">ข้อความสั้น</SelectItem>
                                  <SelectItem value="multiline" className="font-semibold">ข้อความยาว</SelectItem>
                                  <SelectItem value="number" className="font-semibold">ตัวเลข</SelectItem>
                                  <SelectItem value="url" className="font-semibold">ลิงก์ (URL)</SelectItem>
                                  <SelectItem value="email" className="font-semibold">อีเมล</SelectItem>
                                  <SelectItem value="file" className="font-semibold">อัปโหลดไฟล์ (File)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name={`formFields.${index}.required`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs font-bold text-slate-500 cursor-pointer">จำเป็นต้องระบุ</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-12 rounded-xl border-dashed border-2 border-slate-200 text-slate-400 font-bold hover:bg-slate-50 hover:text-primary hover:border-primary"
                  onClick={() => appendFormField({ id: Math.random().toString(36).substr(2, 9), type: 'text', label: '', required: true })}
                >
                  <Plus className="mr-2 h-4 w-4" /> เพิ่มคำถามใหม่
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Schedule & Publishing */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
               <CalendarIcon className="h-4 w-4 text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">กำหนดการและรูปภาพ</span>
            </div>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-slate-700">วันประกาศผล / หมดเขตสมัคร <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className="relative">
                           <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                           <Input 
                            type="date" 
                            className="h-12 rounded-xl bg-slate-50 border-none pl-10 pr-4 font-semibold focus:ring-2 focus:ring-primary/20 block" 
                            {...field} 
                           />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-bold text-slate-700">รูปภาพหน้าปก / โปสเตอร์</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div 
                          className={cn(
                            "relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 group transition-all",
                            isUploading && "opacity-50 pointer-events-none"
                          )}
                        >
                          {field.value ? (
                            <>
                              <img src={field.value} alt="Poster Preview" className="w-full h-full object-cover" />
                              <div className="absolute inset-x-0 bottom-0 p-4 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-xs font-bold text-center">คลิกเพื่อเปลี่ยนรูปภาพ</p>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors mb-3">
                                <Upload className="h-6 w-6" />
                              </div>
                              <p className="text-sm font-black text-slate-900">คลิกเพื่ออัปโหลดโปสเตอร์</p>
                              <p className="text-xs text-slate-400 font-bold mt-1">ขนาดแนะนำ 600x800 พิกเซล (แนวตั้ง)</p>
                            </div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleFileUpload}
                            disabled={isUploading}
                          />
                          {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                              <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input placeholder="หรือระบุเป็น URL รูปภาพ..." className="h-12 rounded-xl bg-slate-50 border-none pl-10 pr-4 font-semibold focus:ring-2 focus:ring-primary/20" {...field} />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4 pt-4">
             <Button 
               variant="ghost" 
               className="font-bold text-slate-400 hover:text-slate-600 h-14 px-8 rounded-2xl"
               asChild
             >
               <Link href="/dashboard/organizer/competitions">ยกเลิก</Link>
             </Button>
             <Button 
               type="submit" 
               className="h-14 px-12 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-primary/20 text-lg transition-all"
               disabled={isSubmitting}
             >
               {isSubmitting ? (
                 <>
                   <Loader2 className="mr-2 h-6 w-6 animate-spin" /> กำลังบันทึก...
                 </>
               ) : (
                 <>
                   <Check className="mr-2 h-6 w-6" /> บันทึกการเปลี่ยนแปลง
                 </>
               )}
             </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
