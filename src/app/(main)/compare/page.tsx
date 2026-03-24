'use client';

import React, { useEffect, useState } from 'react';
import { useComparison } from '@/providers/comparison-provider';
import { useFirestore, useCollection } from '@/firebase';
import { getCompetitionsQuery } from '@/lib/competition-actions';
import type { Competition } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Trash2, Calendar, Trophy, MapPin, Users, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ComparePage() {
  const { selectedIds, toggleComparison, clearComparison } = useComparison();
  const firestore = useFirestore();
  const competitionsQuery = getCompetitionsQuery(firestore);
  const { data: allCompetitions, isLoading } = useCollection<Competition>(competitionsQuery);
  
  const [comparisons, setComparisons] = useState<Competition[]>([]);

  useEffect(() => {
    if (allCompetitions && selectedIds.length > 0) {
      const selected = allCompetitions.filter(c => selectedIds.includes(c.id));
      setComparisons(selected);
    } else {
      setComparisons([]);
    }
  }, [allCompetitions, selectedIds]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold">กำลังโหลดข้อมูลเปรียบเทียบ...</p>
      </div>
    );
  }

  if (selectedIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Trophy className="h-12 w-12 text-slate-300" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4">ยังไม่ได้เลือกงานแข่งขันที่ต้องการเปรียบเทียบ</h1>
        <p className="text-slate-500 font-bold max-w-md mb-8">
          โปรดเลือกงานที่คุณสนใจจากการค้นหา เพื่อนำมาเปรียบเทียบรายละเอียดและเงื่อนไขต่างๆ
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90 text-white font-black px-8 py-6 rounded-2xl text-lg">
            ไปเลือกงานแข่งขัน
          </Button>
        </Link>
      </div>
    );
  }

  const comparisonFields = [
    { label: 'รางวัลรวม', icon: <Trophy className="h-4 w-4" />, getValue: (c: Competition) => c.totalPrize > 0 ? `${c.totalPrize.toLocaleString()} บาท` : 'ไม่ระบุ' },
    { label: 'ปิดรับสมัคร', icon: <Calendar className="h-4 w-4" />, getValue: (c: Competition) => format(new Date(c.deadline), 'd MMM yyyy', { locale: th }) },
    { label: 'หมวดหมู่', icon: <Info className="h-4 w-4" />, getValue: (c: Competition) => c.category },
    { label: 'ประเภทผู้สมัคร', icon: <Users className="h-4 w-4" />, getValue: (c: Competition) => Array.isArray(c.participantType) ? c.participantType.join(', ') : c.participantType },
    { label: 'สถานที่', icon: <MapPin className="h-4 w-4" />, getValue: (c: Competition) => c.location || 'ออนไลน์' },
    { label: 'ผู้จัดงาน', getValue: (c: Competition) => c.organizer || 'ไม่ระบุ' },
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/" className="inline-flex items-center text-primary font-black mb-4 hover:underline group">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              กลับหน้าหลัก
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              เปรียบเทียบ<span className="text-primary italic">งานแข่งขัน</span>
            </h1>
          </div>
          <Button 
            variant="outline" 
            onClick={clearComparison}
            className="border-slate-200 text-slate-500 font-bold hover:bg-slate-50 rounded-xl"
          >
            ล้างทั้งหมด
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {comparisons.map((comp) => (
            <Card key={comp.id} className="border-none shadow-xl rounded-3xl overflow-hidden bg-white group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              <div className="relative h-48 bg-slate-100 flex items-center justify-center p-8">
                 {comp.imageUrl ? (
                    <Image 
                        src={comp.imageUrl} 
                        alt={comp.title} 
                        fill 
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    />
                 ) : (
                    <Trophy className="h-16 w-16 text-slate-200" />
                 )}
                 <Button 
                   variant="destructive" 
                   size="icon" 
                   className="absolute top-4 right-4 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                   onClick={() => toggleComparison(comp.id)}
                 >
                   <Trash2 className="h-4 w-4" />
                 </Button>
              </div>

              <CardContent className="p-6">
                <div className="mb-6 h-20">
                  <Badge className="mb-2 bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest">
                    {comp.category}
                  </Badge>
                  <h3 className="text-lg font-black text-slate-900 line-clamp-2 leading-tight">
                    {comp.title}
                  </h3>
                </div>

                <div className="space-y-6">
                  {comparisonFields.map((field, idx) => (
                    <div key={idx} className="pb-4 border-b border-slate-50 last:border-none">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                        {field.icon}
                        <span>{field.label}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700">
                        {field.getValue(comp)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link href={`/?id=${comp.id}`}>
                    <Button className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-2xl group/btn">
                      ดูรายละเอียด
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {comparisons.length < 4 && (
            <Link href="/" className="group block h-full min-h-[400px]">
              <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-8 transition-all duration-300 group-hover:border-primary group-hover:bg-primary/5">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 transition-colors group-hover:bg-white group-hover:shadow-md">
                   <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-black text-2xl">
                     +
                   </div>
                </div>
                <p className="text-slate-500 font-black text-center group-hover:text-primary transition-colors">
                  เพิ่มงานแข่งขันเพื่อเปรียบเทียบ
                </p>
                <p className="text-[11px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
                   {comparisons.length}/4
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
