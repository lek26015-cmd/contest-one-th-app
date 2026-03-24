'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Check, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'ฟรี (Free)',
    price: '0',
    description: 'เหมาะสำหรับผู้เริ่มต้นใช้งานทั่วไป',
    features: [
      'จัดแข่งได้สูงสุด 5 งานต่อเดือน',
      'ผู้สมัครสูงสุด 100 คนต่องาน',
      'วิเคราะห์ผู้สมัครเบื้องต้น',
      'รองรับการแชร์ลงโซเชียลมีเดีย',
      'ดาวน์โหลดผลการแข่งขันเป็น PDF'
    ],
    cta: 'เริ่มต้นใช้งาน',
    href: '/login',
    popular: false,
  },
  {
    name: 'ไลท์ (Lite)',
    price: '159',
    description: 'เหมาะสำหรับบุคคลทั่วไปหรือสตาร์ทอัพที่เพิ่งเริ่มต้น',
    features: [
      'จัดแข่งได้สูงสุด 10 งานต่อเดือน',
      'ผู้สมัครสูงสุด 500 คนต่องาน',
      'ไม่มีลายน้ำ ContestOne บนหน้าเว็บ',
      'ระบบลงทะเบียนแบบ Custom (AI)',
      'เก็บประวัติการแข่งขันย้อนหลังได้ไม่จำกัด',
    ],
    cta: 'เริ่มต้นใช้งาน',
    href: '/login',
    popular: false,
  },
  {
    name: 'โปร (Pro)',
    price: '249',
    description: 'เหมาะสำหรับ SME และทีมขนาดเล็ก',
    features: [
      'ไม่จำกัดจำนวนงานแข่งต่อเดือน',
      'ไม่จำกัดจำนวนผู้สมัคร',
      'ทุกฟีเจอร์ในแพ็กเกจ Lite',
      'Landing Page Builder เต็มรูปแบบ',
      'ระบบจัดการรางวัลหลายระดับ',
    ],
    cta: 'เริ่มต้นใช้งาน',
    href: '/login',
    popular: true,
  },
  {
    name: 'สเกล (Scale)',
    price: '1,049',
    description: 'สำหรับธุรกิจที่กำลังเติบโตและต้องการการจัดการเต็มรูปแบบ',
    features: [
      'ไม่จำกัดจำนวนงานแข่งและผู้สมัคร',
      'ทุกฟีเจอร์ในแพ็กเกจ Pro',
      'ระบบจัดการทีมงานและคณะกรรมการ',
      'API Integration สำหรับองค์กร',
      'สนับสนุนดูแลเป็นลำดับแรก 24/7',
    ],
    cta: 'เริ่มต้นใช้งาน',
    href: '/login',
    popular: false,
  }
];

export default function PricingPage() {
  return (
    <div className="bg-white min-h-screen pb-24 pt-20">
      <div className="container mx-auto px-4 max-w-[1400px]">
        {/* Header (Optional, if they want it clean they can skip but I'll add subtle text) */}
        <div className="text-center mb-16">
           <h1 className="text-3xl font-black text-slate-900 mb-2">เลือกแผนที่เหมาะสำหรับคุณ</h1>
           <p className="text-slate-400 font-bold">ราคาโปรโมชั่นพิเศษสำหรับการเปิดตัวครั้งแรก</p>
        </div>

        {/* Dynamic Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex"
            >
              <Card 
                className={cn(
                  "relative w-full flex flex-col p-8 rounded-[3rem] border transition-all duration-300",
                  plan.popular 
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-2xl scale-[1.02] z-10" 
                    : "border-slate-100 shadow-sm hover:shadow-md bg-white"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-8 -translate-y-1/2">
                    <div className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1 uppercase tracking-widest leading-none h-8">
                       ยอดนิยม
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-xs font-bold leading-relaxed pr-4">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-10 flex items-baseline">
                  <span className="text-3xl font-black text-slate-900 mr-1.5">฿</span>
                  <span className="text-5xl font-black text-slate-900 tracking-tighter">
                    {plan.price}
                  </span>
                  <span className="ml-2 text-slate-400 font-bold text-sm">/เดือน</span>
                </div>

                <div className="space-y-5 flex-grow mb-12">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 group">
                      <div className="mt-1 h-5 w-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-500 shadow-sm transition-transform group-hover:scale-110">
                        <Check className="h-3 w-3 stroke-[4px]" />
                      </div>
                      <span className="text-slate-600 font-bold text-[13px] leading-tight">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button 
                  asChild
                  className={cn(
                    "w-full h-14 rounded-2xl font-black text-sm transition-all shadow-lg",
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200"
                      : "bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-none"
                  )}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Disclaimer similar to image */}
        <div className="mt-20 text-center space-y-2">
           <p className="text-[11px] text-slate-400 font-bold max-w-2xl mx-auto leading-loose">
              ราคาทั้งหมดยังไม่รวมภาษีมูลค่าเพิ่ม • สามารถยกเลิกได้ตลอดเวลาโดยไม่มีค่าธรรมเนียมแอบแฝง • ระบบรองรับการชำระเงินผ่านบัตรเครดิตและพร้อมเพย์
           </p>
        </div>

        {/* Feature Highlights/Trust Info (Compact like in image) */}
        <div className="mt-32 max-w-5xl mx-auto border-t border-slate-50 pt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { t: 'Security First', d: 'ข้อมูลการแข่งขันและผู้สมัครของคุณจะถูกเข้ารหัสสม่ำเสมอ' },
              { t: 'Multi-lingual', d: 'รองรับภาษาไทย อังกฤษ และจีน เพื่อขยายฐานผู้สมัครสู่ระดับสากล' },
              { t: 'Expert Support', d: 'ทีมงานพร้อมช่วยเหลือคุณในทุกขั้นตอนการจัดงาน' }
            ].map((box, i) => (
              <div key={i} className="text-center group">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl mx-auto mb-4 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                   <Info className="h-6 w-6" />
                 </div>
                 <h4 className="font-black text-slate-900 mb-1">{box.t}</h4>
                 <p className="text-xs text-slate-500 font-bold leading-relaxed">{box.d}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
