'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useDoc, useMemoFirebase } from '@/firebase';
import { getCompetitionQuery } from '@/lib/competition-actions';
import { submitCompetitionToD1 } from '@/lib/d1-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  QrCode,
  Info,
  ShieldCheck,
  CreditCard,
  Ticket,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Competition, FormFieldConfig } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompetitionApplyPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params.id as string;
  const { user, isUserLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const competitionQuery = useMemoFirebase(() => {
    // Note: We might need to add a D1-based getCompetitionById if Firestore is also having issues here.
    // For now, using the existing query.
    return null; // I'll use a local state to fetch from D1 instead to avoid permission issues.
  }, [id]);

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [isLoadingComp, setIsLoadingComp] = useState(true);

  useEffect(() => {
    // If we migrate competitions to D1 as well, we would use getCompetitionByIdFromD1
    // For now, I'll simulate or use a mock if Firestore fails.
    // Actually, I should probably check if getCompetitionByIdFromD1 exists or create it.
    const fetchComp = async () => {
      // Temporary fetch logic
      setIsLoadingComp(false);
    };
    fetchComp();
  }, [id]);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isTeam, setIsTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState<string[]>(['']);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Check for success/cancel from Stripe
  useEffect(() => {
    const success = new URLSearchParams(window.location.search).get('success');
    if (success === 'true') {
      setIsSuccess(true);
      toast({ title: 'ชำระเงินสำเร็จ', description: 'ใบสมัครของคุณได้รับการยืนยันแล้ว' });
    }
  }, [toast]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const addTeamMember = () => {
    setTeamMembers(prev => [...prev, '']);
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...teamMembers];
    newMembers[index] = value;
    setTeamMembers(newMembers);
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length <= 1) return;
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleApplyVoucher = async () => {
    if (!discountCode.trim()) return;
    
    setIsValidatingVoucher(true);
    try {
      const res = await fetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, competitionId: id }),
      });
      const data = await res.json();
      
      if (data.valid) {
        setAppliedVoucher(data.voucher);
        toast({ title: 'สำเร็จ!', description: 'ใช้โค้ดส่วนลดเรียบร้อยแล้ว' });
      } else {
        toast({ title: 'ผิดพลาด', description: data.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'ผิดพลาด', description: 'เกิดข้อผิดพลาดในการตรวจสอบโค้ด', variant: 'destructive' });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const basePrice = 500;
  const discountAmount = appliedVoucher ? (
    appliedVoucher.type === 'percentage' 
      ? (basePrice * appliedVoucher.value) / 100 
      : appliedVoucher.value
  ) : 0;
  const totalPrice = Math.max(0, basePrice - discountAmount);

  const handleStripeCheckout = async () => {
    if (!user) return;
    setIsCheckoutLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitionId: id,
          competitionTitle: competition?.title || 'Competition',
          userId: user.uid,
          userName: user.displayName || 'User',
          userEmail: user.email || 'N/A',
          isTeamSubmission: isTeam,
          teamName: isTeam ? teamName : null,
          teamMembers: isTeam ? teamMembers.filter(m => m.trim() !== '') : [],
          voucherCode: appliedVoucher?.code || null,
          amount: totalPrice,
          customFields: formData,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout Error:', error);
      toast({ title: 'ผิดพลาด', description: error.message, variant: 'destructive' });
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (isUserLoading || isLoadingComp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-[2.5rem] p-12 text-center">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">เข้าสู่ระบบเพื่อสมัคร</h2>
          <Link href="/login" className="block w-full">
            <Button className="w-full h-14 bg-primary rounded-xl font-black text-lg">เข้าสู่ระบบตอนนี้</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="max-w-md w-full border-none shadow-2xl rounded-[3rem] p-12 text-center bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">สมัครสำเร็จแล้ว!</h2>
            <p className="text-slate-500 font-bold mb-10 leading-relaxed">
              เราได้รับใบสมัครและการชำระเงินของคุณแล้ว ข้อมูลของคุณได้รับการยืนยันเรียบร้อย
            </p>
            <div className="space-y-4">
              <Button asChild variant="outline" className="w-full h-14 rounded-xl border-slate-200 font-black">
                <Link href="/">กลับหน้าหลัก</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" asChild className="font-bold text-slate-500 hover:bg-white rounded-full -ml-2">
          <Link href={`/competitions/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> กลับหน้ารายละเอียด
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-12">
            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white relative overflow-hidden mb-10 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/20 text-primary border-none font-black px-4 py-1 rounded-full uppercase tracking-widest text-[10px]">
                      Stripe Payment
                    </Badge>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight font-headline italic">สมัครเข้าร่วมแข่งขัน</h1>
                  <p className="text-slate-400 font-medium max-w-xl">กรอกข้อมูลให้ครบถ้วนและชำระเงินผ่านระบบ Stripe ที่ปลอดภัย</p>
                </div>
                
                {/* Progress Steps */}
                <div className="flex items-center gap-4 mt-12 relative z-10 overflow-x-auto no-scrollbar pb-2">
                  <div className={cn("flex items-center gap-3 px-6 py-3 rounded-2xl transition-all shrink-0", step === 1 ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white/5 text-slate-400")}>
                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black", step === 1 ? "bg-white text-primary" : "bg-white/10")}>1</div>
                    <span className="font-bold whitespace-nowrap">ข้อมูลการสมัคร</span>
                  </div>
                  <div className="h-px w-8 bg-white/10 shrink-0" />
                  <div className={cn("flex items-center gap-3 px-6 py-3 rounded-2xl transition-all shrink-0", step === 2 ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-white/5 text-slate-400")}>
                    <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black", step === 2 ? "bg-white text-primary" : "bg-white/10")}>2</div>
                    <span className="font-bold whitespace-nowrap">ชำระเงินด้วย Stripe</span>
                  </div>
                </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white p-10 md:p-12">
                    <div className="space-y-8">
                        <div>
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-headline">ข้อมูลการสมัคร</h2>
                          <div className="h-1 w-12 bg-primary rounded-full mt-2" />
                        </div>

                        {/* Registration Type Toggle */}
                        <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                          <button 
                            onClick={() => setIsTeam(false)}
                            className={cn(
                              "flex-1 py-4 rounded-xl font-black text-sm transition-all",
                              !isTeam ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            สมัครเดี่ยว
                          </button>
                          <button 
                            onClick={() => setIsTeam(true)}
                            className={cn(
                              "flex-1 py-4 rounded-xl font-black text-sm transition-all",
                              isTeam ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            สมัครแบบทีม
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-3">
                              <Label className="font-black text-slate-700 ml-1">ชื่อ-นามสกุล {isTeam && '(ผู้ติดต่อหลัก)'}</Label>
                              <Input 
                                placeholder="ภาษาไทยหรืออังกฤษ" 
                                className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold focus:bg-white transition-all shadow-inner"
                                value={formData.fullName || ''}
                                onChange={e => handleInputChange('fullName', e.target.value)}
                              />
                           </div>
                           <div className="space-y-3">
                              <Label className="font-black text-slate-700 ml-1">เบอร์โทรศัพท์</Label>
                              <Input 
                                placeholder="08x-xxx-xxxx" 
                                className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold focus:bg-white transition-all shadow-inner"
                                value={formData.phone || ''}
                                onChange={e => handleInputChange('phone', e.target.value)}
                              />
                           </div>
                        </div>

                        {isTeam && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-8 pt-4 border-t border-slate-50">
                            <div className="space-y-3">
                              <Label className="font-black text-slate-700 ml-1">ชื่อทีม (Team Name)</Label>
                              <Input 
                                placeholder="ตั้งชื่อทีมของคุณ..." 
                                className="h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold focus:bg-white transition-all shadow-inner border-2 border-primary/20"
                                value={teamName}
                                onChange={e => setTeamName(e.target.value)}
                              />
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label className="font-black text-slate-700 ml-1">สมาชิกทีม (Team Members)</Label>
                                <Button variant="ghost" size="sm" onClick={addTeamMember} className="text-primary font-bold hover:bg-primary/5">
                                  + เพิ่มสมาชิก
                                </Button>
                              </div>
                              <div className="space-y-3">
                                {teamMembers.map((member, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <Input 
                                      placeholder={`ชื่อสมาชิกคนที่ ${idx + 1}`}
                                      className="h-12 bg-slate-50 border-none rounded-xl px-5 font-bold focus:bg-white transition-all"
                                      value={member}
                                      onChange={e => handleMemberChange(idx, e.target.value)}
                                    />
                                    {teamMembers.length > 1 && (
                                      <Button variant="ghost" size="icon" onClick={() => removeTeamMember(idx)} className="text-slate-300 hover:text-red-500 hover:bg-red-50">
                                        <AlertCircle className="h-5 w-5 rotate-45" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="space-y-3">
                           <Label className="font-black text-slate-700 ml-1">รายละเอียดการส่งผลงาน/แนวคิด</Label>
                           <Textarea 
                              placeholder="เช่น ลิงก์เก็บพอร์ตโฟลิโอ หรือรายละเอียดเบื้องต้น..."
                              className="min-h-[150px] bg-slate-50 border-none rounded-[1.5rem] p-6 font-bold focus:bg-white transition-all shadow-inner"
                              value={formData.note || ''}
                              onChange={e => handleInputChange('note', e.target.value)}
                           />
                        </div>

                        <Button 
                          onClick={() => setStep(2)}
                          className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl transition-all active:scale-95"
                        >
                          ไปที่ขั้นตอนชำระเงิน
                        </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                    <div className="p-10 md:p-12 space-y-10">
                        <div>
                          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-headline">ชำระเงิน</h2>
                          <div className="h-1 w-12 bg-primary rounded-full mt-2" />
                        </div>

                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-500">ยอดชำระเบื้องต้น:</span>
                              <span className="text-xl font-black text-slate-400 tabular-nums">฿{basePrice.toFixed(2)}</span>
                            </div>

                            {appliedVoucher && (
                              <div className="flex items-center justify-between text-emerald-600 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                                <div className="flex items-center gap-2">
                                  <Ticket className="w-4 h-4" />
                                  <span className="font-bold text-sm">ส่วนลดจากโค้ด ({appliedVoucher.code}):</span>
                                </div>
                                <span className="font-black text-lg">- ฿{discountAmount.toFixed(2)}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                              <span className="font-black text-slate-900">ยอดชำระสุทธิ:</span>
                              <span className="text-3xl font-black text-primary tabular-nums italic">฿{totalPrice.toFixed(2)}</span>
                            </div>
                            
                            <div className="flex flex-col items-center gap-6 py-10 bg-white rounded-3xl shadow-sm border border-slate-100">
                                <CreditCard className="w-16 h-16 text-primary opacity-20" />
                                <div className="text-center space-y-2">
                                  <p className="font-black text-slate-900 text-xl">ชำระเงินผ่านระบบ Stripe</p>
                                  <p className="text-sm font-bold text-slate-500 max-w-xs mx-auto">
                                    คุณจะถูกเปลี่ยนเส้นทางไปยังหน้าชำระเงินที่ปลอดภัยของ Stripe เพื่อทำรายการให้เสร็จสิ้น
                                  </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <Button 
                            variant="ghost" 
                            onClick={() => setStep(1)}
                            className="h-16 rounded-2xl font-black text-slate-500 hover:bg-slate-50"
                           >
                            ย้อนกลับ
                           </Button>
                           <Button 
                            onClick={handleStripeCheckout}
                            disabled={isCheckoutLoading}
                            className="h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 gap-3 transition-all active:scale-95 disabled:opacity-50"
                           >
                            {isCheckoutLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                            ชำระเงินตอนนี้
                           </Button>
                        </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 space-y-8 sticky top-10">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="bg-primary p-8 text-white relative">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                   <CardTitle className="text-xl font-black italic">สรุปการสมัคร</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                      <CreditCard className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-widest">การแข่งขัน</p>
                      <p className="font-black text-slate-900 leading-tight">{competition?.title || 'ชื่อการแข่งขัน'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-slate-50">
                    <div className="flex justify-between text-sm font-bold text-slate-500">
                      <span>ประเภทการสมัคร</span>
                      <span className="text-slate-900">{isTeam ? 'แบบทีม' : 'เดี่ยว'}</span>
                    </div>
                    {isTeam && teamName && (
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                        <span>ชื่อทีม</span>
                        <span className="text-primary truncate ml-4">{teamName}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-500">
                      <span>ค่าสมัครเข้าร่วม</span>
                      <span>฿{basePrice.toFixed(2)}</span>
                    </div>

                    <div className="pt-4 space-y-3">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">โค้ดส่วนลด</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="กรอกโค้ดส่วนลด..."
                          value={discountCode}
                          onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                          disabled={appliedVoucher || isValidatingVoucher}
                          className="h-10 bg-slate-50 border-none rounded-xl px-4 font-bold text-sm focus:bg-white transition-all shadow-inner"
                        />
                        {appliedVoucher ? (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setAppliedVoucher(null); setDiscountCode(''); }}
                            className="h-10 w-10 text-rose-500 hover:bg-rose-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleApplyVoucher}
                            disabled={!discountCode || isValidatingVoucher}
                            className="h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-lg transition-all active:scale-95"
                          >
                            {isValidatingVoucher ? <Loader2 className="w-3 h-3 animate-spin" /> : 'ใช้โค้ด'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {appliedVoucher && (
                      <div className="flex justify-between text-sm font-bold text-emerald-600">
                        <span>ส่วนลด ({appliedVoucher.code})</span>
                        <span>-฿{discountAmount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t-2 border-dashed border-slate-100 flex justify-between">
                      <span className="font-black text-slate-900">ยอดชำระรวม</span>
                      <span className="text-2xl font-black text-slate-900 italic underline decoration-primary decoration-4">฿{totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100 relative z-10">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-emerald-900 relative z-10">Stripe Payment Security</h3>
                  <p className="text-emerald-700/70 text-sm font-bold leading-relaxed relative z-10">การชำระเงินผ่าน Stripe ได้รับการรองรับมาตรฐานความปลอดภัยระดับโลก ข้อมูลบัตรของคุณจะไม่ถูกเก็บไว้ในระบบของเรา</p>
              </div>

              <div className="p-8 rounded-[2rem] bg-white border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3 text-amber-500">
                    <Info className="w-6 h-6" />
                    <span className="font-black">หมายเหตุสำคัญ</span>
                  </div>
                  <p className="text-slate-500 text-sm font-bold leading-relaxed">เมื่อชำระเงินเสร็จสิ้น ระบบจะยืนยันการสมัครของคุณโดยอัตโนมัติทันที</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
