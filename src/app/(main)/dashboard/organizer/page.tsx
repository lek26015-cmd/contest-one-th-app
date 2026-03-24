'use client';

import { useMemo } from 'react';
import { 
  Trophy, 
  Users, 
  Eye, 
  Plus, 
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { getCompetitionsQuery } from '@/lib/competition-actions';
import type { Competition } from '@/lib/types';
import Link from 'next/link';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <Card className="border-none shadow-sm bg-white overflow-hidden group">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
    </CardContent>
  </Card>
);

import { cn } from '@/lib/utils';

export default function OrganizerDashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const competitionsQuery = useMemoFirebase(() => getCompetitionsQuery(firestore), [firestore]);
  const { data: allCompetitions, isLoading } = useCollection<Competition>(competitionsQuery);

  // Filter competitions owned by this organizer (simulated for now)
  const myCompetitions = useMemo(() => {
    if (!allCompetitions) return [];
    // In a real app, we'd filter by user.uid or similar
    return allCompetitions.slice(0, 5); // Just some mock data for the demo
  }, [allCompetitions]);

  const stats = [
    { title: 'งานแข่งทั้งหมด', value: myCompetitions.length, icon: Trophy, trend: '+2 NEW', color: 'bg-primary' },
    { title: 'ผู้สมัครรวม', value: '1,284', icon: Users, trend: '+12%', color: 'bg-indigo-500' },
    { title: 'ยอดเข้าชม', value: '45.2K', icon: Eye, trend: '+8.4%', color: 'bg-emerald-500' },
  ];

  const statusIcons = {
    active: { icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'กำลังรับสมัคร' },
    pending: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', label: 'รอตรวจสอบ' },
    closed: { icon: CheckCircle2, color: 'text-slate-400', bg: 'bg-slate-50', label: 'ปิดรับสมัครแล้ว' },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">สวัสดีคุณ {user?.displayName || user?.email?.split('@')[0]} 👋</h1>
          <p className="text-slate-400 font-bold mt-1">นี่คือภาพรวมความเคลื่อนของงานแข่งของคุณในวันนี้</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-[13px] font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
          <Link href="/dashboard/organizer/competitions/new">
            <Plus className="mr-2 h-5 w-5" /> สร้างงานแข่งขันใหม่
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Competitions */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 px-8 py-6">
            <div>
              <CardTitle className="text-lg font-black tracking-tight">งานแข่งขันล่าสุด</CardTitle>
              <CardDescription className="text-xs font-bold mt-0.5">สถานะและจำนวนผู้สมัครปัจจุบัน</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-primary font-black text-[11px] uppercase tracking-widest hover:bg-primary/5">
              <Link href="/dashboard/organizer/competitions">
                ดูทั้งหมด <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {myCompetitions.map((comp) => (
                <div key={comp.id} className="px-8 py-6 hover:bg-slate-50/50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                       {comp.imageUrl ? (
                         <img src={comp.imageUrl} className="w-full h-full object-cover" />
                       ) : (
                         <Trophy className="h-6 w-6 text-slate-300" />
                       )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{comp.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest">
                          Active
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-bold flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> ปิดรับหมัครใน 12 วัน
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-lg font-black text-slate-900">234</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ผู้สมัคร</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Usage */}
        <div className="space-y-8">
          <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <CardHeader className="pb-2">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[9px] font-black uppercase tracking-widest w-fit mb-4">
                Starter Plan
              </Badge>
              <CardTitle className="text-2xl font-black leading-tight">โควต้าการสร้างงานแข่ง</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-3xl font-black">2 / 5</span>
                  <span className="text-xs font-bold opacity-60">เหลืออีก 3 งาน</span>
                </div>
                <Progress value={40} className="h-2 bg-white/20" />
                <p className="text-[10px] font-bold opacity-70 leading-relaxed">
                  แพ็กเกจ Starter รองรับการสร้างงานแข่งสูงสุด 5 งานต่อเดือน และผู้สมัคร 100 คนต่องาน อัปเกรดเป็น Pro เพื่อรับโควต้าไม่จำกัด
                </p>
                <Button asChild variant="secondary" className="w-full bg-white text-indigo-600 hover:bg-slate-50 font-black text-[11px] h-10 mt-2 shadow-xl shadow-indigo-900/20">
                  <Link href="/pricing">UPGRADE TO PRO</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">ภาพรวมสถานะ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
               {[
                 { label: 'กำลังรับสมัคร', count: 3, color: 'emerald' },
                 { label: 'รอประกาศผล', count: 1, color: 'amber' },
                 { label: 'สิ้นสุดแล้ว', count: 8, color: 'slate' },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className={cn("w-2 h-2 rounded-full", `bg-${item.color}-500`)} />
                     <span className="text-sm font-bold text-slate-600">{item.label}</span>
                   </div>
                   <span className="text-sm font-black text-slate-900">{item.count}</span>
                 </div>
               ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
