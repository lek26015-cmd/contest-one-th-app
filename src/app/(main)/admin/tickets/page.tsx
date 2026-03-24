'use client';

import { useState, useEffect } from 'react';
import { 
  getAllTicketsFromD1, 
  updateTicketStatusInD1, 
  deleteTicketFromD1 
} from '@/lib/d1-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Ticket, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreHorizontal,
  Mail,
  User,
  ExternalLink,
  ChevronDown,
  Loader2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SupportTicket, TicketStatus, TicketCategory } from '@/lib/types';

export default function AdminTicketsPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | TicketStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await getAllTicketsFromD1();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast({ title: 'ผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลรายการได้', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleUpdateStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      await updateTicketStatusInD1(ticketId, status);
      toast({ 
        title: "อัปเดตสถานะสำเร็จ", 
        description: `เปลี่ยนสถานะเรียบร้อยแล้ว`,
      });
      loadTickets();
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดตสถานะได้",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTicketFromD1(deleteId);
      toast({
        title: "ลบรายการสำเร็จ",
        description: "ข้อมูลรายการถูกลบออกจากระบบแล้ว",
      });
      loadTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบรายการได้",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesFilter = filter === 'all' || ticket.status === filter;
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ticket.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-3 py-1 rounded-full font-bold">รอดำเนินการ</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 rounded-full font-bold">กำลังตรวจสอบ</Badge>;
      case 'closed':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 rounded-full font-bold">แก้ไขแล้ว</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryLabel = (cat: TicketCategory) => {
    switch (cat) {
      case 'bug': return 'แจ้งพบบั๊ก';
      case 'support': return 'ช่วยเหลือ';
      case 'feedback': return 'ข้อเสนอแนะ';
      case 'other': return 'อื่นๆ';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Ticket className="h-10 w-10 text-primary" />
            รายการแจ้งปัญหา
          </h1>
          <p className="text-slate-500 font-medium mt-1">จัดการและตอบกลับ Ticket จากผู้ใช้งาน</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center font-bold text-xl">
              {tickets.filter(t => t.status === 'open').length}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">รอดำเนินการ</p>
              <p className="text-slate-900 font-bold">Ticket ใหม่ที่ยังไม่ได้อ่าน</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center font-bold text-xl">
              {tickets.filter(t => t.status === 'in_progress').length}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">กำลังตรวจสอบ</p>
              <p className="text-slate-900 font-bold">กำลังดำเนินการแก้ไข</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-3xl bg-white">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center font-bold text-xl">
              {tickets.filter(t => t.status === 'closed').length}
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">แก้ไขแล้ว</p>
              <p className="text-slate-900 font-bold">Ticket ที่ปิดรายการแล้ว</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between">
           <div className="relative flex-grow max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="ค้นหาตามหัวข้อ หรือ อีเมลผู้ส่ง..."
              className="pl-12 h-12 bg-white border-slate-200 rounded-xl font-medium focus:ring-primary/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
             <Button 
                variant={filter === 'all' ? 'default' : 'outline'}
                className={cn("rounded-full h-10 px-6 font-bold", filter === 'all' ? "bg-slate-900" : "text-slate-600")}
                onClick={() => setFilter('all')}
              >
                ทั้งหมด
              </Button>
              <Button 
                variant={filter === 'open' ? 'default' : 'outline'}
                className={cn("rounded-full h-10 px-6 font-bold", filter === 'open' ? "bg-amber-500 text-white" : "text-slate-600")}
                onClick={() => setFilter('open')}
              >
                รอดำเนินการ
              </Button>
              <Button 
                variant={filter === 'in_progress' ? 'default' : 'outline'}
                className={cn("rounded-full h-10 px-6 font-bold", filter === 'in_progress' ? "bg-blue-500 text-white" : "text-slate-600")}
                onClick={() => setFilter('in_progress')}
              >
                กำลังตรวจสอบ
              </Button>
              <Button 
                variant={filter === 'closed' ? 'default' : 'outline'}
                className={cn("rounded-full h-10 px-6 font-bold", filter === 'closed' ? "bg-emerald-500 text-white" : "text-slate-600")}
                onClick={() => setFilter('closed')}
              >
                แก้ไขแล้ว
              </Button>
          </div>
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 font-medium flex items-center justify-center gap-2">
               <Loader2 className="h-5 w-5 animate-spin" />
               กำลังโหลดข้อมูล Ticket...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <Ticket className="h-10 w-10" />
              </div>
              <p className="text-slate-500 font-bold text-xl">ไม่พบรายการแจ้งปัญหา</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <th className="px-8 py-6">รายการ</th>
                    <th className="px-8 py-6">หมวดหมู่</th>
                    <th className="px-8 py-6">ผู้ส่ง</th>
                    <th className="px-8 py-6">สถานะ</th>
                    <th className="px-8 py-6 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="space-y-1 max-w-md">
                          <p className="font-bold text-slate-900 group-hover:text-primary transition-colors">{ticket.title}</p>
                          <p className="text-sm text-slate-500 line-clamp-1">{ticket.description}</p>
                          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 pt-1">
                            <Clock className="h-3 w-3" />
                            {ticket.createdAt ? format(new Date(ticket.createdAt), 'd MMM yyyy HH:mm', { locale: th }) : 'ไม่ระบุวันที่'}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <Badge variant="outline" className="font-bold text-slate-500 border-slate-200">
                          {getCategoryLabel(ticket.category)}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                             <User className="h-5 w-5" />
                           </div>
                           <div className="overflow-hidden">
                              <p className="text-sm font-bold text-slate-900 truncate">ผู้ใช้งานทั่วไป</p>
                              <p className="text-xs text-slate-400 font-medium truncate">{ticket.userEmail}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-8 py-6 text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-white hover:shadow-sm">
                              <MoreHorizontal className="h-5 w-5 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-slate-100 shadow-xl">
                            <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">อัปเดตสถานะ</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="rounded-xl px-4 py-3 font-bold text-amber-600 focus:bg-amber-50 focus:text-amber-600"
                              onClick={() => handleUpdateStatus(ticket.id, 'open')}
                            >
                              <Clock className="mr-3 h-4 w-4" /> รอดำเนินการ
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="rounded-xl px-4 py-3 font-bold text-blue-600 focus:bg-blue-50 focus:text-blue-600"
                              onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                            >
                              <AlertCircle className="mr-3 h-4 w-4" /> กำลังตรวจสอบ
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="rounded-xl px-4 py-3 font-bold text-emerald-600 focus:bg-emerald-50 focus:text-emerald-600"
                              onClick={() => handleUpdateStatus(ticket.id, 'closed')}
                            >
                              <CheckCircle2 className="mr-3 h-4 w-4" /> แก้ไขแล้ว
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2 bg-slate-50" />
                            <DropdownMenuItem 
                              className="rounded-xl px-4 py-3 font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-600"
                              onClick={() => setDeleteId(ticket.id)}
                            >
                               <Trash2 className="mr-3 h-4 w-4" /> ลบรายการนี้
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-[2rem] p-10 border-none shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <AlertDialogHeader className="relative z-10">
            <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-inner">
              <AlertCircle className="h-10 w-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black text-slate-900 text-center tracking-tight">ยืนยันการลบ?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-slate-500 font-medium text-center pt-2 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? ข้อมูลทั้งหมดจะถูกลบถาวรและไม่สามารถเรียกคืนได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 sm:justify-center gap-4 relative z-10">
            <AlertDialogCancel className="h-14 px-8 rounded-xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50 flex-1">ยกเลิก</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="h-14 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xl shadow-rose-200 flex-1"
            >
              ลบรายการ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
