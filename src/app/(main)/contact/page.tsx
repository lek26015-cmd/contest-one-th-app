
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Send, MessageSquare, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { sendContactMessage } from "@/lib/d1-actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;

    setIsSending(true);
    try {
      const subject = (document.getElementById('subject-value') as HTMLInputElement)?.value || formData.subject || 'สอบถามทั่วไป';
      
      await sendContactMessage({
        ...formData,
        subject: subject
      });
      
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast({
        title: "ส่งข้อความสำเร็จ",
        description: "เราได้รับข้อความของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด",
      });
    } catch (error) {
        console.error("Error sending message:", error);
        toast({
            title: "เกิดข้อผิดพลาด",
            description: "ไม่สามารถส่งข้อความได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
            variant: "destructive"
        });
    } finally {
      setIsSending(false);
    }
  };

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
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Header Section */}
      <section className="bg-primary pt-24 pb-48 relative overflow-hidden">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-sky-400/10 rounded-full blur-3xl -ml-16 -mb-16" />
        
        <div className="container mx-auto max-w-7xl px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/90 text-sm font-bold mb-6 border border-white/20"
          >
            <Sparkles className="h-4 w-4 text-sky-300" />
            ติดต่อทีมงานผู้เชี่ยวชาญของเรา
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight font-headline"
          >
            ติดต่อเรา
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-xl text-white/80 max-w-2xl mx-auto font-medium"
          >
            เราพร้อมรับฟังทุกข้อเสนอแนะและตอบทุกคำถามของคุณ เพื่อมอบประสบการณ์ที่ดีที่สุดให้กับคุณ
          </motion.p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-6xl px-4 -mt-32 pb-24 relative z-20">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Contact Form Column */}
          <motion.div variants={itemVariants} className="lg:col-span-7">
            <Card className="rounded-3xl border-none shadow-2xl shadow-primary/10 overflow-hidden bg-white">
              <div className="h-2 bg-primary w-full" />
              <CardHeader className="p-8 sm:p-10 pb-2">
                <CardTitle className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-primary"/>
                    </div>
                    ส่งข้อความถึงเรา
                </CardTitle>
                <CardDescription className="text-lg font-medium text-slate-500 pt-2">
                    เราจะตอบกลับคุณภายใน 24 ชั่วโมงทำการ
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 sm:p-10 pt-6">
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="py-12 text-center"
                    >
                      <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">ส่งข้อความสำเร็จ!</h3>
                      <p className="text-slate-500 text-lg font-medium">ขอบคุณที่ติดต่อเรา ทีมงานจะรีบดำเนินการตรวจสอบและติดต่อกลับโดยเร็วที่สุด</p>
                      <Button onClick={() => setIsSubmitted(false)} variant="outline" className="mt-8 rounded-xl font-bold">
                        ส่งข้อความอื่น
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-black text-slate-700 uppercase tracking-wider">ชื่อ-นามสกุล</Label>
                          <Input id="name" placeholder="ระบุชื่อของคุณ" className="rounded-xl border-slate-200 py-6 focus:ring-primary h-12 text-base font-bold" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-black text-slate-700 uppercase tracking-wider">อีเมลติดต่อ</Label>
                          <Input id="email" type="email" placeholder="example@mail.com" className="rounded-xl border-slate-200 py-6 focus:ring-primary h-12 text-base font-bold" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-black text-slate-700 uppercase tracking-wider">หัวข้อที่ต้องการติดต่อ</Label>
                        <Select required onValueChange={(v) => setFormData({...formData, subject: v})}>
                            <SelectTrigger id="subject" className="rounded-xl border-slate-200 h-12 text-base font-bold">
                                <SelectValue placeholder="เลือกหัวข้อการติดต่อ" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                <SelectItem value="general" className="font-bold py-3">สอบถามข้อมูลทั่วไป</SelectItem>
                                <SelectItem value="support" className="font-bold py-3">แจ้งปัญหาการใช้งาน</SelectItem>
                                <SelectItem value="partnership" className="font-bold py-3">ติดต่อเรื่องความร่วมมือ</SelectItem>
                                <SelectItem value="feedback" className="font-bold py-3">ข้อเสนอแนะสำหรับการพัฒนา</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" id="subject-value" value={formData.subject} />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-black text-slate-700 uppercase tracking-wider">รายละเอียดข้อความ</Label>
                        <Textarea id="message" placeholder="เล่ารายละเอียดที่คุณต้องการสื่อสารกับเรา..." className="min-h-[160px] rounded-2xl border-slate-200 p-4 focus:ring-primary text-base font-bold resize-none" required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                      </div>
                      
                      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-black py-7 rounded-2xl text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 group" size="lg" disabled={isSending}>
                        {isSending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-3 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        ส่งข้อความทันที
                      </Button>
                    </form>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info & Map Column */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div variants={itemVariants}>
              <Card className="rounded-3xl border-none shadow-xl bg-white p-2">
                <CardContent className="p-6 space-y-6">
                  <div className="group flex items-start gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                        <MapPin className="h-6 w-6 text-primary group-hover:text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-lg mb-1">ที่ตั้งสำนักงาน</h3>
                        <p className="text-slate-500 font-bold leading-relaxed">123 อาคารเฟิร์สทาวเวอร์, ถนนสุขุมวิท, แขวงคลองเตยเหนือ, เขตวัฒนา, กรุงเทพมหานคร 10110</p>
                    </div>
                  </div>

                  <a href="mailto:support@contestone-th.com" className="group flex items-start gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                        <Mail className="h-6 w-6 text-primary group-hover:text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-lg mb-1">อีเมลติดต่อฝ่ายสนับสนุน</h3>
                        <p className="text-primary font-bold group-hover:underline">support@contestone-th.com</p>
                        <p className="text-slate-400 text-sm font-bold mt-1">เราพร้อมตอบกลับภายใน 24 ชม.</p>
                    </div>
                  </a>

                  <div className="group flex items-start gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="h-12 w-12 rounded-xl bg-sky-100 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                        <Phone className="h-6 w-6 text-primary group-hover:text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-lg mb-1">เบอร์โทรศัพท์</h3>
                        <p className="text-slate-500 font-black text-xl tracking-wider">02-853-6999</p>
                        <p className="text-slate-400 text-sm font-bold mt-1">จันทร์ - ศุกร์ | 09:00 - 18:00 น.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants} className="relative group">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl group-hover:bg-primary/30 transition-all -z-10 opacity-50" />
              <div className="rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative bg-white">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.819313271816!2d100.5612194153597!3d13.729608901631473!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29f0f6e1f0e4b%3A0x6c6c3f0b3f0b3f0b!2sGoogle%20Thailand!5e0!3m2!1sen!2sth!4v1678886400000"
                    width="100%"
                    height="320"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Maps Location"
                    className="grayscale hover:grayscale-0 transition-all duration-700"
                />
                <Button variant="secondary" className="absolute bottom-4 right-4 rounded-xl font-black bg-white/90 backdrop-blur-sm border shadow-lg hover:bg-white" asChild>
                    <a href="https://maps.app.goo.gl/uXj9X6f8mKjQkEwz9" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        เปิดใน Google Maps
                    </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
