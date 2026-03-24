'use client';

import { Check, Zap, Shield, Crown, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PlanCard = ({ title, price, description, features, icon: Icon, isPopular, buttonText, color }: any) => (
  <Card className={cn(
    "relative flex flex-col border-none shadow-sm h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
    isPopular ? "ring-2 ring-primary bg-white scale-105 z-10" : "bg-white"
  )}>
    {isPopular && (
      <div className="absolute top-0 right-0">
        <div className="bg-primary text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg">
          Best Value
        </div>
      </div>
    )}
    
    <CardHeader className="p-8">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", color)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">{title}</CardTitle>
      <CardDescription className="text-sm font-bold text-slate-400 mt-2">{description}</CardDescription>
    </CardHeader>
    
    <CardContent className="p-8 pt-0 flex-grow">
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-4xl font-black text-slate-900">฿{price}</span>
        <span className="text-slate-400 font-bold text-sm">/เดือน</span>
      </div>
      
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">สิ่งที่คุณจะได้รับ</p>
        {features.map((feature: string, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
              <Check className="h-3 w-3 text-emerald-500 stroke-[3]" />
            </div>
            <span className="text-sm font-bold text-slate-600">{feature}</span>
          </div>
        ))}
      </div>
    </CardContent>
    
    <CardFooter className="p-8 pt-0">
      <Button className={cn(
        "w-full h-12 font-black text-sm rounded-xl shadow-lg transition-all",
        isPopular 
          ? "bg-primary hover:bg-primary/90 shadow-primary/20" 
          : "bg-slate-900 hover:bg-slate-800 shadow-slate-200"
      )}>
        {buttonText}
      </Button>
    </CardFooter>
  </Card>
);

export default function PlansPage() {
  const plans = [
    {
      title: 'Free',
      price: '0',
      description: 'เริ่มต้นใช้งานสำหรับผู้จัดงานโปรเจกต์ขนาดเล็ก',
      icon: Zap,
      color: 'bg-slate-400',
      buttonText: 'ใช้งานปัจจุบัน',
      features: [
        'สร้างงานแข่งได้ 5 งาน/เดือน',
        'ระบบจัดการผู้สมัครพื้นฐาน',
        'แสดงผลบนหน้าแรก 24 ชม.',
        'ซัพพอร์ตผ่านอีเมล'
      ]
    },
    {
      title: 'Pro',
      price: '1,590',
      description: 'ยกระดับการจัดการด้วยเครื่องมือที่ทรงพลังกว่าเดิม',
      icon: Crown,
      color: 'bg-primary',
      isPopular: true,
      buttonText: 'UPGRADE TO PRO',
      features: [
        'สร้างงานแข่งได้ไม่จำกัด',
        'ระบบคัดกรองผู้สมัครอัตโนมัติ',
        'Featured แถวบนสุด 7 วัน',
        'สถิติเชิงลึกรายวัน',
        'Priority Support 24/7'
      ]
    },
    {
      title: 'Enterprise',
      price: '4,900',
      description: 'โซลูชันครบวงจรสำหรับองค์กรและเอเจนซี่ขนาดใหญ่',
      icon: Shield,
      color: 'bg-slate-900',
      buttonText: 'CONTACT SALES',
      features: [
        'ทุกฟีเจอร์ในแพ็กเกจ Pro',
        'หน้า Landing Page ส่วนตัว',
        'API สำหรับดึงข้อมูลผู้สมัคร',
        'ทีมงานช่วยตั้งค่าระบบ',
        'White-label Solution'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">เลือกแผนการใช้งานที่เหมาะกับคุณ</h1>
        <p className="text-slate-500 font-bold max-w-2xl mx-auto">
          อัปเกรดเพื่อเพิ่มขีดความสามารถในการเข้าถึงผู้สมัครและจัดการงานแข่งของคุณได้อย่างมีประสิทธิภาพสูงสุด
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-4">
        {plans.map((plan, i) => (
          <PlanCard key={i} {...plan} />
        ))}
      </div>

      {/* Comparison Section */}
      <Card className="border-none shadow-sm bg-slate-100/50 p-12 overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mb-32 blur-3xl" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="max-w-md text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900 mb-2">ต้องการแพ็กเกจที่ปรับแต่งเอง?</h3>
            <p className="text-slate-500 font-bold">หากคุณต้องการจัดงานขนาดใหญ่ที่มีผู้สมัคหลักหมื่นคน เราพร้อมนำเสนอทางเลือกที่ตอบโจทย์เฉพาะคุณ</p>
          </div>
          <Button variant="outline" className="h-14 px-8 font-black text-lg border-2 border-slate-200 hover:border-primary hover:text-primary transition-all rounded-2xl bg-white shadow-xl shadow-slate-200/50">
            คุยกับผู้เชี่ยวชาญของเรา
          </Button>
        </div>
      </Card>
    </div>
  );
}
