'use client';

import { useState } from 'react';
import { 
  Trophy, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { getCompetitionsQuery, toggleApplicationEnabled, deleteCompetition } from '@/lib/competition-actions';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { Competition } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyCompetitionsPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const competitionsQuery = useMemoFirebase(() => getCompetitionsQuery(firestore), [firestore]);
  const { data: competitions, isLoading } = useCollection<Competition>(competitionsQuery);

  // Filter competitions (mock filtering for demo)
  const filteredCompetitions = competitions?.filter(comp => 
    comp.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">งานแข่งของฉัน</h1>
          <p className="text-slate-400 font-bold mt-1">จัดการและแก้ไขข้อมูลงานแข่งขันทั้งหมดสของคุณ</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-[13px] font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
          <Link href="/dashboard/organizer/competitions/new">
            <Plus className="mr-2 h-5 w-5" /> สร้างงานแข่งขันใหม่
          </Link>
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="ค้นหาชื่อการแข่งขัน..." 
            className="pl-10 h-12 bg-white border-none shadow-sm rounded-xl focus:ring-2 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 border-none shadow-sm bg-white rounded-xl px-6 font-bold text-slate-600 hover:bg-slate-50">
          <Filter className="mr-2 h-4 w-4" /> ตัวกรอง
        </Button>
      </div>

      {/* Competitions Table/List */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">ชื่อการแข่งขัน</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">สถานะ</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">รับสมัครผ่านเว็บ</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">ผู้สมัคร</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">วันสิ้นสุด</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCompetitions.map((comp) => (
                <tr 
                  key={comp.id} 
                  className="hover:bg-slate-50/30 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/dashboard/organizer/competitions/${comp.id}`)}
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {comp.imageUrl ? (
                          <img src={comp.imageUrl} className="w-full h-full object-cover" />
                        ) : (
                          <Trophy className="h-6 w-6 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 line-clamp-1">{comp.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{comp.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black px-3 py-1 uppercase tracking-widest">
                      Active
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                       <Switch 
                        checked={comp.isApplicationEnabled} 
                        onCheckedChange={async (checked) => {
                          try {
                            await toggleApplicationEnabled(firestore, comp.id, checked);
                            toast({
                              title: checked ? 'เปิดรับสมัครผ่านเว็บไซต์แล้ว' : 'ปิดการรับสมัครผ่านเว็บไซต์แล้ว',
                              variant: "default",
                            });
                          } catch (error) {
                            toast({
                              title: 'ไม่สามารถเปลี่ยนสถานะได้',
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                      <span className="text-[10px] font-black uppercase text-slate-400">
                        {comp.isApplicationEnabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900">234</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">คนสมัครแล้ว</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-slate-600">12 เม.ย. 2567</span>
                  </td>
                  <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary rounded-full">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl border-slate-50 mt-1">
                        <DropdownMenuItem asChild className="p-3 rounded-lg font-bold text-sm cursor-pointer">
                          <Link href={`/dashboard/organizer/competitions/${comp.id}/edit`}>
                            <Edit3 className="mr-3 h-4 w-4" /> แก้ไขข้อมูล
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-3 rounded-lg font-bold text-sm cursor-pointer">
                          <Link href={`/competitions/${comp.id}`}>
                            <Eye className="mr-3 h-4 w-4" /> ดูตัวอย่าง
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="p-3 rounded-lg font-bold text-sm cursor-pointer text-blue-600">
                          <Link href={`/competitions/${comp.id}`} target="_blank">
                            <ExternalLink className="mr-3 h-4 w-4" /> ไปหน้างานแข่ง
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 bg-slate-50" />
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              onSelect={(e) => e.preventDefault()}
                              className="p-3 rounded-lg font-bold text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="mr-3 h-4 w-4" /> ลบงานแข่งขัน
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-3xl border-none">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-black">คุณแน่ใจหรือไม่?</AlertDialogTitle>
                              <AlertDialogDescription className="font-bold text-slate-500">
                                การลบงานแข่งขัน "{comp.title}" จะทำให้ข้อมูลทั้งหมดหายไปและไม่สามารถกู้คืนได้
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="rounded-xl font-bold border-none bg-slate-100 hover:bg-slate-200">ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={async () => {
                                  try {
                                    await deleteCompetition(firestore, comp.id);
                                    toast({
                                      title: 'ลบงานแข่งขันสำเร็จ',
                                      variant: "default",
                                    });
                                  } catch (error) {
                                    toast({
                                      title: 'เกิดข้อผิดพลาดในการลบ',
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                className="rounded-xl font-black bg-red-600 hover:bg-red-700 text-white"
                              >
                                ยืนยันการลบ
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCompetitions.length === 0 && !isLoading && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">ไม่พบงานแข่งขันของคุณ</h3>
              <p className="text-slate-400 text-sm mt-1">เริ่มสร้างงานแข่งขันชิ้นแรกของคุณเพื่อดึงดูดนักล่ารางวัล!</p>
              <Button className="mt-6 bg-primary font-black px-8">สร้างงานแรกเลย</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


