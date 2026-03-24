'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Trophy, 
  Users, 
  Eye, 
  Heart, 
  Repeat, 
  ChevronLeft, 
  Calendar,
  MoreVertical,
  Download,
  Mail,
  Phone,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Search,
  Filter,
  Layout
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, useFirestore } from '@/firebase';
import { getCompetition } from '@/lib/competition-actions';
import { setCompetitionWinners, getSubmissionsFromD1, type WinnerSelection } from '@/lib/d1-actions';
import { doc, getDoc } from 'firebase/firestore';
import type { Competition, Submission } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function CompetitionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [winners, setWinners] = useState<WinnerSelection[]>([]);
  const [isAnnouncing, setIsAnnouncing] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    async function loadData() {
      if (!firestore || !id) return;
      setLoading(true);
      setLoadingSubmissions(true);
      try {
        const [comp, subs] = await Promise.all([
          getCompetition(firestore, id),
          getSubmissionsFromD1({ competitionId: id })
        ]);
        
        setCompetition(comp);
        setSubmissions(subs);
        
        // Load existing winners if any
        if (comp && comp.winnersAnnounced && subs.length > 0) {
          const winnerSelections: WinnerSelection[] = subs
            .filter(sub => sub.winnerAwardName || sub.winnerRank)
            .map(sub => ({
              submissionId: sub.id,
              awardName: sub.winnerAwardName || `อันดับที่ ${sub.winnerRank}`,
              rank: sub.winnerRank
            }));
          
          if (winnerSelections.length > 0) {
            setWinners(winnerSelections);
          } else {
            // Default rows if announced but no data found (fallback)
            setWinners([
              { submissionId: '', awardName: 'อันดับที่ 1', rank: 1 },
              { submissionId: '', awardName: 'อันดับที่ 2', rank: 2 },
              { submissionId: '', awardName: 'อันดับที่ 3', rank: 3 },
            ]);
          }
        } else {
          // Default rows for new competitions
          setWinners([
            { submissionId: '', awardName: 'อันดับที่ 1', rank: 1 },
            { submissionId: '', awardName: 'อันดับที่ 2', rank: 2 },
            { submissionId: '', awardName: 'อันดับที่ 3', rank: 3 },
          ]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถโหลดข้อมูลได้",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
        setLoadingSubmissions(false);
      }
    }
    loadData();
  }, [firestore, id]);

  const handleAddAward = () => {
    setWinners(prev => [...prev, { submissionId: '', awardName: 'รางวัลใหม่' }]);
  };

  const handleRemoveAward = (index: number) => {
    setWinners(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateAward = (index: number, updates: Partial<WinnerSelection>) => {
    setWinners(prev => prev.map((w, i) => i === index ? { ...w, ...updates } : w));
  };

  const handleAnnounceWinners = async () => {
    const validWinners = winners.filter(w => w.submissionId && w.awardName);
    
    if (validWinners.length === 0) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาเลือกผู้ชนะอย่างน้อย 1 รายการ",
        variant: "destructive"
      });
      return;
    }

    setIsAnnouncing(true);
    try {
      await setCompetitionWinners(id, validWinners);
      toast({
        title: "สำเร็จ!",
        description: "ประกาศผลผู้ชนะเรียบร้อยแล้ว!",
      });
      // Refresh competition data
      const updatedComp = await getCompetition(firestore, id);
      if (updatedComp) setCompetition(updatedComp);
    } catch (error) {
      console.error("Error announcing winners:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "เกิดข้อผิดพลาดในการประกาศผล",
        variant: "destructive"
      });
    } finally {
      setIsAnnouncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Clock className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-slate-900">ไม่พบงานแข่งขัน</h2>
        <Button onClick={() => router.back()} className="mt-4">กลับไปหน้าเดิม</Button>
      </div>
    );
  }

  const filteredSubmissions = submissions?.filter(sub => 
    sub.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full hover:bg-white shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{competition.title}</h1>
              <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest px-3">Active</Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-slate-400 font-bold text-sm">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[10px]">
                 <Calendar className="h-3.5 w-3.5" /> สิ้นสุด {new Date(competition.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[10px]">
                 <Trophy className="h-3.5 w-3.5" /> {competition.category}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="h-12 border-none shadow-sm bg-white rounded-xl px-6 font-bold text-slate-600 hover:bg-slate-50">
            <Link href={`/dashboard/organizer/competitions/${id}/edit`}>
              <Edit3 className="mr-2 h-4 w-4" /> แก้ไขข้อมูล
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-12 border-none shadow-sm bg-white rounded-xl px-6 font-bold text-slate-600 hover:bg-slate-50">
            <Link href={`/dashboard/organizer/competitions/${id}/landing-page`}>
              <Layout className="mr-2 h-4 w-4" /> ตัวสร้างหน้า Landing Page
            </Link>
          </Button>
          <Button asChild className="h-12 bg-slate-900 hover:bg-slate-800 text-white font-black px-6 rounded-xl shadow-lg shadow-slate-200">
            <Link href={`/competitions/${id}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" /> ดูหน้าเว็บจริง
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'ยอดเข้าชมทั้งหมด', value: competition.views?.toLocaleString() || '0', icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'จำนวนคนบันทึก', value: '428', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'พยายามเปรียบเทียบ', value: '156', icon: Repeat, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'ผู้สมัครผ่านเว็บ', value: submissions?.length.toString() || '0', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl flex-shrink-0", stat.bg)}>
                <stat.icon className={cn("h-6 w-6", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Applicants List */}
        <div className="lg:col-span-3 space-y-8">
          {/* Winners Selection Card */}
          <Card className="border-none shadow-sm bg-primary/5 overflow-hidden rounded-3xl border border-primary/10">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  คัดเลือกผู้ชนะ (Winners)
                </CardTitle>
                <CardDescription className="font-bold text-slate-500">
                  เลือกผู้ชนะจากการแข่งขันเพื่อประกาศผลในหน้าเว็บไซต์
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddAward}
                className="bg-white border-primary/20 text-primary font-black rounded-xl hover:bg-primary hover:text-white transition-all"
              >
                + เพิ่มรางวัล
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {winners.map((win, index) => (
                  <div key={index} className="space-y-2 relative group-award">
                    <div className="flex items-center justify-between">
                      <Input
                        value={win.awardName}
                        onChange={(e) => handleUpdateAward(index, { awardName: e.target.value })}
                        className="bg-transparent border-none p-0 h-auto text-[10px] font-black uppercase tracking-widest text-slate-400 focus-visible:ring-0 focus-visible:text-primary transition-colors w-full"
                        placeholder="ชื่อรางวัล (เช่น อันดับ 1)"
                      />
                      {winners.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50"
                          onClick={() => handleRemoveAward(index)}
                        >
                          <Clock className="h-3 w-3 rotate-45" /> 
                        </Button>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full h-14 justify-start bg-white border-2 hover:border-primary transition-all rounded-2xl px-4 gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-black",
                            win.rank === 1 ? "bg-amber-100 text-amber-600" :
                            win.rank === 2 ? "bg-slate-100 text-slate-600" :
                            win.rank === 3 ? "bg-orange-100 text-orange-600" :
                            "bg-primary/10 text-primary"
                          )}>
                            {win.rank || '★'}
                          </div>
                          <span className="truncate font-bold">
                            {win.submissionId ? filteredSubmissions.find(s => s.id === win.submissionId)?.userName : `คลิกเพื่อเลือกผู้ชนะ`}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 max-h-80 overflow-y-auto p-2 rounded-2xl shadow-xl border-slate-50">
                        <DropdownMenuItem 
                          onClick={() => handleUpdateAward(index, { submissionId: '' })}
                          className="p-3 rounded-xl font-bold text-sm cursor-pointer text-slate-400"
                        >
                           -- ไม่เลือก --
                        </DropdownMenuItem>
                        {filteredSubmissions.map((sub) => (
                          <DropdownMenuItem 
                            key={sub.id} 
                            onClick={() => handleUpdateAward(index, { submissionId: sub.id })}
                            className="p-3 rounded-xl font-bold text-sm cursor-pointer flex items-center gap-3"
                          >
                             <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-400">
                               {sub.userName?.charAt(0)}
                             </div>
                             {sub.userName}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-200/50 flex justify-end">
                <Button 
                  onClick={handleAnnounceWinners}
                  disabled={isAnnouncing}
                  className="bg-primary hover:bg-primary/90 text-white font-black px-10 py-6 rounded-2xl shadow-lg shadow-primary/20 "
                >
                  {isAnnouncing ? <Clock className="animate-spin mr-2 h-5 w-5" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                  {competition.winnersAnnounced ? "อัปเดตประกาศผลผู้ชนะ" : "ประกาศผลผู้ชนะทันที"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">รายชื่อผู้สมัครผ่านเว็บไซต์</h3>
              <p className="text-slate-400 font-bold text-xs mt-0.5">รวมทั้งหมด {submissions?.length || 0} รายการ</p>
            </div>
            <div className="flex items-center gap-3">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input 
                   placeholder="ค้นหาชื่อ หรืออีเมล..." 
                   className="pl-10 h-11 w-64 bg-white border-none shadow-sm rounded-xl font-semibold"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>
               <Button variant="outline" className="h-11 border-none bg-white font-bold rounded-xl px-4 shadow-sm">
                 <Filter className="mr-2 h-4 w-4" /> ตัวกรอง
               </Button>
               <Button variant="outline" className="h-11 border-none bg-white font-bold rounded-xl px-4 shadow-sm text-primary hover:text-primary">
                 <Download className="mr-2 h-4 w-4" /> Export CSV
               </Button>
            </div>
          </div>

          <Card className="border-none shadow-sm bg-white overflow-hidden rounded-3xl">
            <CardContent className="p-0">
              <div className="overflow-x-auto text-left">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-50">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">ผู้สมัคร</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">ข้อมูลติดต่อ</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">วันที่ส่ง</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">สถานะ</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">ดำเนินการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/20 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-sm">
                               {sub.userName?.charAt(0) || 'U'}
                             </div>
                             <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-900">{sub.userName}</p>
                                  {sub.isTeamSubmission && (
                                    <Badge variant="outline" className="border-blue-100 text-blue-600 bg-blue-50/50 font-black text-[9px] uppercase tracking-widest px-2 py-0">
                                      Team
                                    </Badge>
                                  )}
                                  {(sub.winnerRank || sub.winnerAwardName) && (
                                    <Badge className={cn(
                                      "border-none rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center font-black text-[10px] whitespace-nowrap",
                                      sub.winnerRank === 1 ? "bg-amber-100 text-amber-600" :
                                      sub.winnerRank === 2 ? "bg-slate-100 text-slate-600" :
                                      sub.winnerRank === 3 ? "bg-orange-100 text-orange-600" :
                                      "bg-primary/10 text-primary"
                                    )}>
                                      {sub.winnerAwardName || sub.winnerRank}
                                    </Badge>
                                  )}
                                </div>
                                {sub.isTeamSubmission && sub.teamName && (
                                  <p className="text-[10px] font-black text-slate-500 mt-0.5">ทีม: {sub.teamName}</p>
                                )}
                                <p className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                  {sub.submissionDetails?.substring(0, 30)}...
                                </p>
                                {sub.isTeamSubmission && sub.teamMembers && sub.teamMembers.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {sub.teamMembers.map((m, i) => (
                                      <Badge key={i} variant="secondary" className="h-4 text-[8px] font-bold bg-slate-50 text-slate-400 px-1 border-none lowercase">
                                        @{m}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="space-y-1">
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                               <Mail className="h-3 w-3" /> {sub.userEmail}
                             </div>
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                               <Phone className="h-3 w-3" /> {sub.userPhone || 'ไม่ระบุ'}
                             </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm font-bold text-slate-600">
                            {sub.createdAt && new Date(sub.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </td>
                         <td className="px-8 py-6">
                           <Badge className={cn(
                             "border-none font-black text-[9px] uppercase tracking-widest px-3 py-1",
                             sub.status === 'pending' && "bg-amber-50 text-amber-600",
                             (sub.status === 'accepted' || (sub.status as string) === 'confirmed') && "bg-emerald-50 text-emerald-600",
                             sub.status === 'rejected' && "bg-red-50 text-red-600"
                           )}>
                             {sub.status === 'pending' ? 'รอตรวจสอบ' : (sub.status === 'accepted' || (sub.status as string) === 'confirmed') ? 'รับสมัครแล้ว' : 'ปฏิเสธ'}
                           </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary">
                               <FileText className="h-4 w-4" />
                             </Button>
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400">
                                   <MoreVertical className="h-4 w-4" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl border-slate-50">
                                 <DropdownMenuItem className="p-3 rounded-lg font-bold text-sm text-emerald-600 flex items-center gap-2 cursor-pointer">
                                   <CheckCircle2 className="h-4 w-4" /> ตอบรับการสมัคร
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="p-3 rounded-lg font-bold text-sm text-red-600 flex items-center gap-2 cursor-pointer">
                                   <XCircle className="h-4 w-4" /> ปฏิเสธการสมัคร
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredSubmissions.length === 0 && !loadingSubmissions && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                             <Users className="h-8 w-8 text-slate-200" />
                           </div>
                           <h4 className="font-bold text-slate-900">ยังไม่มีผู้สมัครผ่านเว็บไซต์</h4>
                           <p className="text-slate-400 text-xs mt-1 font-bold">ลองเปิดรับการสมัครผ่านเว็บเพื่อรับข้อมูลจากนักล่ารางวัล!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown by Custom Fields (Placeholder for future) */}
      </div>
    </div>
  );
}
