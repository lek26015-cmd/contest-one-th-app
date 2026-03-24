'use client';

import { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  Mail, 
  MessageSquare, 
  ChevronRight,
  ExternalLink,
  Table as TableIcon,
  LayoutGrid,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { canAccessCSV, canDownloadAll } from '@/lib/plan-utils';
import Link from 'next/link';

export default function ParticipantsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const participants = [
    { id: 1, name: 'สมชาย รักเรียน', email: 'somchai@example.com', competition: 'Business Plan 2024', status: 'Submitted', joinedAt: '20 มี.ค. 2567', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Somchai' },
    { id: 2, name: 'วิภาวี มีสุข', email: 'vipawee@example.com', competition: 'Hackathon X', status: 'Pending Review', joinedAt: '18 มี.ค. 2567', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vipawee' },
    { id: 3, name: 'มานะ ขยันหมั่นเพียร', email: 'mana@example.com', competition: 'Business Plan 2024', status: 'Draft', joinedAt: '15 มี.ค. 2567', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mana' },
    { id: 4, name: 'จินตนา ฟ้าใส', email: 'jintana@example.com', competition: 'Accelerator 2024', status: 'Submitted', joinedAt: '12 มี.ค. 2567', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jintana' },
    { id: 5, name: 'เอกชัย ชนะเลิศ', email: 'ekachai@example.com', competition: 'Hackathon X', status: 'Winner', joinedAt: '10 มี.ค. 2567', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ekachai' },
  ];

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">รายชื่อผู้สมัคร</h1>
          <p className="text-slate-400 font-bold mt-1">จัดการผู้สมัครและตรวจสอบผลงานของนักล่ารางวัลของคุณ</p>
        </div>
        <div className="flex gap-3">
          {/* Gated Export & Download All - Using Starter (0) for global view demonstration */}
          <Button 
            variant="outline" 
            asChild
            className={cn("h-12 border-none shadow-sm font-black rounded-xl px-6 bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all")}
          >
            <Link href="/pricing" className="flex items-center">
              <Lock className="mr-2 h-3.5 w-3.5" /> ส่งออก CSV
            </Link>
          </Button>

          <Button 
            variant="outline" 
            asChild
            className={cn("h-12 border-none shadow-sm font-black rounded-xl px-6 bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all")}
          >
            <Link href="/pricing" className="flex items-center">
              <Lock className="mr-2 h-3.5 w-3.5" /> Download All (ZIP)
            </Link>
          </Button>

          <Button className="bg-primary hover:bg-primary/90 text-[13px] font-black h-12 px-6 rounded-2xl shadow-lg shadow-primary/20">
             ติดต่อผู้สมัครทั้งหมด
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            placeholder="ค้นหาชื่อหรืออีเมลผู้สมัคร..." 
            className="w-full pl-10 h-12 bg-white border-none shadow-sm rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-slate-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm w-full md:w-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("flex-1 md:flex-none rounded-lg font-black text-[11px] uppercase tracking-widest", viewMode === 'table' ? "bg-slate-100" : "text-slate-400")}
            onClick={() => setViewMode('table')}
          >
            <TableIcon className="mr-2 h-4 w-4" /> ตาราง
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("flex-1 md:flex-none rounded-lg font-black text-[11px] uppercase tracking-widest", viewMode === 'grid' ? "bg-slate-100" : "text-slate-400")}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="mr-2 h-4 w-4" /> รายการ
          </Button>
        </div>
        <Button variant="outline" className="h-12 border-none shadow-sm bg-white rounded-xl px-6 font-bold text-slate-600 hover:bg-slate-50 w-full md:w-auto">
          <Filter className="mr-2 h-4 w-4" /> ตัวกรอง
        </Button>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">ชื่อผู้สมัคร</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">การแข่งขัน</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">สถานะ</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">วันที่เข้าร่วม</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredParticipants.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-slate-100">
                          <AvatarImage src={p.avatar} />
                          <AvatarFallback>{p.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-bold text-slate-900">{p.name}</h4>
                          <span className="text-xs font-bold text-slate-400">{p.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-600">{p.competition}</span>
                    </td>
                    <td className="px-8 py-6">
                      <Badge className={cn(
                        "border-none text-[9px] font-black px-3 py-1 uppercase tracking-widest",
                        p.status === 'Submitted' ? "bg-emerald-50 text-emerald-600" :
                        p.status === 'Winner' ? "bg-primary text-white" :
                        p.status === 'Draft' ? "bg-slate-50 text-slate-400" : "bg-amber-50 text-amber-600"
                      )}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-400">{p.joinedAt}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-primary rounded-full">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl">
                          <DropdownMenuItem className="p-3 rounded-lg font-bold text-sm">
                            <Mail className="mr-3 h-4 w-4" /> ส่งอีเมลหา
                          </DropdownMenuItem>
                          <DropdownMenuItem className="p-3 rounded-lg font-bold text-sm">
                            <MessageSquare className="mr-3 h-4 w-4" /> ส่งข้อความ (แชท)
                          </DropdownMenuItem>
                          <DropdownMenuItem className="p-3 rounded-lg font-bold text-sm text-blue-600">
                            <ExternalLink className="mr-3 h-4 w-4" /> ดูใบสมัคร
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParticipants.map((p) => (
            <Card key={p.id} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                   <Avatar className="h-14 w-14 border-2 border-slate-50">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback>{p.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <Badge className={cn(
                    "border-none text-[9px] font-black px-3 py-1 uppercase tracking-widest",
                    p.status === 'Submitted' ? "bg-emerald-50 text-emerald-600" :
                    p.status === 'Winner' ? "bg-primary text-white" :
                    p.status === 'Draft' ? "bg-slate-50 text-slate-400" : "bg-amber-50 text-amber-600"
                  )}>
                    {p.status}
                  </Badge>
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-1">{p.name}</h4>
                <p className="text-sm font-bold text-slate-400 mb-4">{p.email}</p>
                <div className="bg-slate-50 rounded-xl p-3 mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">การแข่งขัน</p>
                  <p className="text-xs font-bold text-slate-600 line-clamp-1">{p.competition}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1 bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold text-xs rounded-lg">
                    <Mail className="h-4 w-4 mr-2" /> ติดต่อ
                  </Button>
                  <Button className="flex-1 bg-primary font-black text-xs rounded-lg">
                    ดูผลงาน
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
