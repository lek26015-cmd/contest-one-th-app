'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LifeBuoy, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  MessageSquare,
  Bug,
  HelpCircle,
  ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/firebase';
import { createTicketInD1 } from '@/lib/d1-actions';
import { TicketCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function NewTicketPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('support');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title || !description) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "โปรดระบุหัวข้อและรายละเอียดของปัญหา",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createTicketInD1({
        userId: user.uid,
        userEmail: user.email || 'N/A',
        title,
        description,
        category,
      });

      setIsSuccess(true);
      toast({
        title: "ส่ง Ticket สำเร็จแล้ว",
        description: "ทีมงานได้รับข้อมูลของท่านแล้ว และจะดำเนินการตรวจสอบโดยเร็วที่สุด",
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่ง Ticket ได้ในขณะนี้ โปรดลองอีกครั้งภายหลัง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-full" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-[2rem] overflow-hidden text-center p-12">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">กรุณาเข้าสู่ระบบ</h2>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            ท่านจำเป็นต้องเข้าสู่ระบบก่อนเพื่อทำการเปิด Ticket แจ้งปัญหา เพื่อให้ทีมงานสามารถติดตามงานได้อย่างถูกต้อง
          </p>
          <div className="flex flex-col gap-4">
            <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl h-14 shadow-lg shadow-primary/20">
              <Link href="/login">เข้าสู่ระบบตอนนี้</Link>
            </Button>
            <Button variant="ghost" asChild className="text-slate-500 font-bold hover:bg-slate-100 rounded-xl">
              <Link href="/about">กลับไปหน้าเกี่ยวกับเรา</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden text-center p-12 bg-white">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">ส่ง Ticket แล้ว!</h2>
            <p className="text-slate-500 font-bold mb-12 leading-relaxed">
              เราได้รับเรื่องของคุณแล้ว ทีมงานจะทำการตรวจสอบและติดต่อกลับผ่านช่องทางอีเมลของท่านโดยเร็วที่สุด
            </p>
            <div className="flex flex-col gap-4">
              <Button asChild variant="outline" className="border-slate-200 text-slate-600 font-black rounded-xl h-14 hover:bg-slate-50">
                <Link href="/">กลับหน้าหลัก</Link>
              </Button>
              <Button asChild variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-xl">
                <Link href="/about">กลับหน้าช่วยเหลือ</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const categoryOptions = [
    { value: 'support', label: 'ช่วยเหลือทั่วไป', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
    { value: 'bug', label: 'แจ้งพบบั๊ก / ปัญหาเทคนิค', icon: Bug, color: 'text-rose-500', bg: 'bg-rose-50' },
    { value: 'feedback', label: 'ข้อเสนอแนะ', icon: ThumbsUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { value: 'other', label: 'อื่นๆ', icon: MessageSquare, color: 'text-slate-500', bg: 'bg-slate-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" asChild className="mb-8 -ml-2 text-slate-500 font-bold hover:bg-white rounded-full">
          <Link href="/about">
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับหน้าช่วยเหลือ
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
            <div className="bg-slate-900 p-10 md:p-12 text-white relative">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                  <LifeBuoy className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">เปิด Ticket แจ้งปัญหา</h1>
                <p className="text-slate-400 font-medium max-w-lg">
                  บอกเราว่าคุณพบปัญหาอะไร หรือต้องการให้เราช่วยเหลือในด้านไหน ทีมงานพร้อมดูแลคุณอย่างเต็มที่
                </p>
              </div>
            </div>

            <CardContent className="p-10 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-slate-500 text-[11px] font-black uppercase tracking-widest ml-1">หมวดหมู่ของปัญหา</label>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setCategory(opt.value as TicketCategory)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left group",
                          category === opt.value 
                            ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                            : "border-slate-50 bg-slate-50 hover:border-slate-200"
                        )}
                      >
                        <div className={cn("p-2.5 rounded-xl transition-all", opt.bg, opt.color)}>
                          <opt.icon className="h-5 w-5" />
                        </div>
                        <span className={cn(
                          "font-bold text-sm transition-all",
                          category === opt.value ? "text-primary" : "text-slate-600"
                        )}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-slate-500 text-[11px] font-black uppercase tracking-widest ml-1">หัวข้อปัญหา</label>
                  <Input 
                    placeholder="เช่น 'ไม่สามารถสมัครสมาชิกได้', 'พบบั๊กในหน้า dashboard'..."
                    className="h-16 bg-slate-50 border-none rounded-2xl px-6 text-lg font-bold text-slate-900 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:bg-white transition-all shadow-inner"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-slate-500 text-[11px] font-black uppercase tracking-widest ml-1">รายละเอียด</label>
                  <Textarea 
                    placeholder="โปรดอธิบายรายละเอียดของปัญหาที่ท่านพบ รวมถึงขั้นตอนการเกิดปัญหา (ถ้ามี)..."
                    className="min-h-[220px] bg-slate-50 border-none rounded-[2rem] p-8 text-lg font-medium text-slate-800 placeholder:text-slate-300 focus-visible:ring-primary/20 focus-visible:bg-white transition-all shadow-inner"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-18 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl py-8 shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        <span>กำลังส่งข้อมูล...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span>ส่ง Ticket แจ้งปัญหา</span>
                        <Send className="h-6 w-6" />
                      </div>
                    )}
                  </Button>
                </div>

                <p className="text-center text-slate-400 text-sm font-medium">
                  ทีมงานจะใช้เวลาตรวจสอบเบื้องต้นประมาณ 1-2 วันทำการ
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
