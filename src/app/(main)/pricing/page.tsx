'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Check, Info, Zap, Shield, Star, Crown, Trophy, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    level: 0,
    name: 'Starter',
    price: '0',
    description: 'เริ่มต้นใช้งานและสร้างปริมาณแคมเปญในระบบ',
    features: [
      'ผู้สมัครไม่จำกัดจำนวน',
      'ลงประกาศงานในหน้าค้นหาทั่วไป',
      'ระบบรับผลงานผ่านเว็บไซต์',
      'ดาวน์โหลดไฟล์ผลงานทีละคน',
      'แดชบอร์ดสถิติพื้นฐาน'
    ],
    cta: 'เริ่มสร้างงานฟรี',
    href: '/login',
    popular: false,
    color: 'bg-slate-500',
  },
  {
    level: 1,
    name: 'Lite',
    price: '900',
    description: 'จัดการข้อมูลง่ายขึ้นในราคาที่เข้าถึงได้',
    features: [
      'ทุกอย่างใน Starter',
      'ดาวน์โหลดไฟล์ทั้งหมด (Download All ZIP)',
      'Export ข้อมูลผู้สมัครเป็น CSV/Excel',
      'ระบบประกาศผลการแข่งขันบนเว็บ'
    ],
    cta: 'เลือกแพ็กเกจ Lite',
    href: '/login',
    popular: false,
    color: 'bg-blue-500',
  },
  {
    level: 2,
    name: 'Standard',
    price: '2,500',
    description: 'หน้าเว็บสวยงามพร้อมใช้งานทันที',
    features: [
      'ทุกอย่างใน Lite',
      'ระบบสร้าง Landing Page (Standard)',
      'กำหนดสีและรูปแบบเบื้องต้น',
      'ระบบคัดกรองสถานะผู้สมัคร',
      'ป้ายกำกับ "งานน่าสนใจ" (Highlight)'
    ],
    cta: 'เลือกแพ็กเกจ Standard',
    href: '/login',
    popular: false,
    color: 'bg-indigo-600',
  },
  {
    level: 3,
    name: 'Professional',
    price: '5,000',
    description: 'สำหรับองค์กรที่ต้องการความเป็นเลิศและ Branding',
    features: [
      'ทุกอย่างใน Standard',
      'Landing Page (Custom Branding)',
      'ปรับแต่ง CI แบรนด์ได้อย่างอิสระ',
      'พื้นที่ "แนะนำ (Featured)" 14 วัน',
      'อีเมลยืนยันผู้สมัครอัตโนมัติ'
    ],
    cta: 'เลือกแพ็กเกจ Pro',
    href: '/login',
    popular: true,
    color: 'bg-primary',
  },
  {
    level: 4,
    name: 'Enterprise',
    price: '15,000',
    description: 'โซลูชันครบวงจรสำหรับแคมเปญสเกลใหญ่',
    features: [
      'ทุกอย่างใน Professional',
      'ระบบตัดสินคะแนนโดยกรรมการ (Judging)',
      'สรุปคะแนนกรรมการอัตโนมัติ',
      'Featured ตลอดระยะเวลาแคมเปญ',
      'รายงานสถิติเชิงลึก (Analytics)',
      'Priority Support 24/7'
    ],
    cta: 'ติดต่อฝ่ายขาย',
    href: '/contact',
    popular: false,
    color: 'bg-slate-900',
  }
];

export default function PricingPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24 pt-20">
      <div className="container mx-auto px-4 max-w-[1600px]">
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
           <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] mb-4">
              Pay-per-Campaign
           </Badge>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight font-headline">
              เลือกแพ็กเกจที่ <span className="text-primary italic">ปลดล็อก</span> ศักยภาพงานแข่งของคุณ
           </h1>
           <p className="text-slate-400 font-bold text-lg max-w-2xl mx-auto leading-relaxed">
              ไม่ต้องเสียค่าสมาชิกรายเดือน จ่ายเพียงต่อแคมเปญเมื่อต้องการใช้งานฟีเจอร์ระดับสูง
           </p>
        </div>

        {/* Dynamic Pricing Grid - Split into 2 Rows */}
        <div className="space-y-12">
          {/* Row 1: 3 Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto px-4">
            {PLANS.slice(0, 3).map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex"
              >
                <Card 
                  className={cn(
                    "relative w-full flex flex-col p-8 rounded-[2.5rem] border-none transition-all duration-500 group",
                    plan.popular 
                      ? "bg-white shadow-[0_30px_60px_rgba(0,0,0,0.1)] scale-[1.02] z-10 ring-4 ring-primary/5" 
                      : "bg-white/60 hover:bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 backdrop-blur-sm"
                  )}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-primary text-white text-[10px] font-black px-6 py-2 rounded-full shadow-lg flex items-center gap-2 uppercase tracking-[0.2em] leading-none whitespace-nowrap">
                         <Crown className="h-3 w-3" /> แนะนำที่สุด
                      </div>
                    </div>
                  )}

                  <div className="mb-8 text-center flex flex-col items-center">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shrink-0", plan.color)}>
                       {plan.level === 0 ? <Zap className="h-6 w-6" /> : 
                        plan.level === 1 ? <Shield className="h-6 w-6" /> :
                        plan.level === 2 ? <Star className="h-6 w-6" /> :
                        plan.level === 3 ? <Crown className="h-6 w-6" /> : <Trophy className="h-6 w-6" />}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-xs mx-auto text-center min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-10 flex items-baseline justify-center">
                    <span className="text-slate-900 font-bold text-xl mr-1">฿</span>
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="ml-2 text-slate-400 font-bold text-xs uppercase tracking-widest">/งาน</span>
                  </div>

                  <div className="space-y-4 flex-grow mb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 mb-4 text-center">ฟีเจอร์เด่น</p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/item">
                        <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-500 transition-transform group-hover/item:scale-110">
                          <Check className="h-3 w-3 stroke-[4px]" />
                        </div>
                        <span className="text-slate-600 font-bold text-[13px] leading-tight group-hover/item:text-slate-900 transition-colors">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    asChild
                    className={cn(
                      "w-full h-14 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-xl",
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200"
                    )}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Row 2: 2 Plans (Centered) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto px-4">
            {PLANS.slice(3).map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i + 3) * 0.1 }}
                className="flex"
              >
                <Card 
                  className={cn(
                    "relative w-full flex flex-col p-10 rounded-[2.5rem] border-none transition-all duration-500 group",
                    plan.popular 
                      ? "bg-white shadow-[0_30px_60px_rgba(0,0,0,0.1)] scale-[1.02] z-10 ring-4 ring-primary/5" 
                      : "bg-white/60 hover:bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 backdrop-blur-sm"
                  )}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-primary text-white text-[10px] font-black px-6 py-2 rounded-full shadow-lg flex items-center gap-2 uppercase tracking-[0.2em] leading-none whitespace-nowrap">
                         <Crown className="h-3 w-3" /> แนะนำที่สุด
                      </div>
                    </div>
                  )}

                  <div className="mb-8 text-center flex flex-col items-center">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shrink-0", plan.color)}>
                       {plan.level === 0 ? <Zap className="h-7 w-7" /> : 
                        plan.level === 1 ? <Shield className="h-7 w-7" /> :
                        plan.level === 2 ? <Star className="h-7 w-7" /> :
                        plan.level === 3 ? <Crown className="h-7 w-7" /> : <Trophy className="h-7 w-7" />}
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-sm mx-auto text-center min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-10 flex items-baseline justify-center">
                    <span className="text-slate-900 font-bold text-2xl mr-1">฿</span>
                    <span className="text-6xl font-black text-slate-900 tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="ml-2 text-slate-400 font-bold text-sm uppercase tracking-widest">/งาน</span>
                  </div>

                  <div className="space-y-4 flex-grow mb-12">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 mb-4 text-center">ฟีเจอร์เด่น</p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-4 group/item">
                        <div className="mt-1 h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-500 transition-transform group-hover/item:scale-110">
                          <Check className="h-4 w-4 stroke-[4px]" />
                        </div>
                        <span className="text-slate-600 font-bold text-base leading-tight group-hover/item:text-slate-900 transition-colors">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    asChild
                    className={cn(
                      "w-full h-16 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl",
                      plan.popular
                        ? "bg-primary hover:bg-primary/90 text-white shadow-primary/20"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200"
                    )}
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ/Info Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-20 max-w-6xl mx-auto px-4">
             <div className="space-y-6">
                <h2 className="text-3xl font-black text-slate-900 font-headline leading-tight">ทำไมต้องเลือกโมเดล <br/><span className="text-primary italic">Pay-per-Campaign?</span></h2>
                <div className="space-y-8">
                    {[
                        { t: 'จ่ายเท่าที่ใช้ (No Subscription)', d: 'ไม่จำเป็นต้องผูกมัดรายเดือน เหมาะสำหรับผู้จัดอิสระหรือแบรนด์ที่จัดแคมเปญเป็นรอบๆ' },
                        { t: 'ปลดล็อกไม่จำกัดผู้สมัคร', d: 'ทุกระดับแพ็กเกจรองรับจำนวนผู้สมัครไม่จำกัด เพื่อการเข้าถึงกลุ่มเป้าหมายสูงสุด' },
                        { t: 'ความปลอดภัยระดับสูง', d: 'ข้อมูลทุกอย่างถูกปกป้องด้วยมาตรฐานสากล พร้อมระบบ Export ข้อมูลที่รวดเร็ว' }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-6">
                            <div className="h-10 w-10 bg-white rounded-xl shadow-md flex items-center justify-center flex-shrink-0 text-primary">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-slate-900 mb-1">{item.t}</h4>
                                <p className="text-sm text-slate-500 font-bold leading-relaxed">{item.d}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             <Card className="bg-slate-900 p-10 rounded-[3rem] text-white overflow-hidden relative border-none">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <Badge className="bg-white/10 text-white border-none font-black px-4 py-1.5 rounded-full uppercase tracking-widest text-[10px] mb-8 w-fit shadow-xl">
                   Enterprise & Agencies
                </Badge>
                <h3 className="text-3xl font-black mb-4 font-headline">ต้องการใช้ระบบตัดสิน <br/>กับแคมเปญระดับประเทศ?</h3>
                <p className="text-slate-400 font-bold mb-10 leading-relaxed">
                   เรามีระบบ Judging Panel ที่ช่วยให้กรรมการให้คะแนนได้แบบเรียลไทม์ พร้อมสรุปผลงานอัตโนมัติ ช่วยลดความผิดพลาดและเพิ่มความโปร่งใสในโครงการขนาดใหญ่
                </p>
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-black px-10 rounded-2xl h-14" asChild>
                    <Link href="/contact">คุยกับผู้เชี่ยวชาญ</Link>
                </Button>
             </Card>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-32 text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">
           Contest One - The Ultimate Campaign Management Solution
        </div>
      </div>
    </div>
  );
}
