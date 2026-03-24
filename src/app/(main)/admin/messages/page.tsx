'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Mail, 
  Search, 
  Trash2, 
  User, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Inbox,
  Filter
} from "lucide-react";
import { getContactMessages } from "@/lib/d1-actions";
import { formatDate, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getContactMessages();
        setMessages(data);
        if (data.length > 0) setSelectedMessage(data[0]);
      } catch (e) {
        console.error("Failed to load messages:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadMessages();
  }, []);

  const filteredMessages = messages.filter(msg => 
    msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">ระบบรับส่งอีเมล</h1>
          <p className="text-slate-400 font-bold mt-1">จัดการข้อความติดต่อและสอบถามจากลูกค้า</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl border-slate-200 font-bold bg-white h-12">
                <Filter className="mr-2 h-4 w-4" /> ตัวกรอง
            </Button>
            <Button className="bg-primary hover:bg-primary/90 rounded-xl font-black h-12 px-6">
                เขียนข้อความใหม่
            </Button>
        </div>
      </div>

      {/* Main Content Split View */}
      <div className="flex-grow flex gap-6 overflow-hidden min-h-0">
        {/* Left: Message List */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4 overflow-hidden shrink-0">
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="ค้นหาข้อความ..." 
              className="pl-10 h-12 bg-white border-none shadow-sm rounded-xl focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Card className="flex-grow border-none shadow-sm bg-white overflow-hidden flex flex-col">
            <CardHeader className="p-6 pb-2 shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-500">ข้อความทั้งหมด</CardTitle>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 rounded-full font-black text-[10px]">
                        {filteredMessages.length} ข้อความ
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-grow custom-scrollbar">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                      <div className="space-y-2 flex-grow">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox className="h-10 w-10 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-bold">ไม่พบข้อความ</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {filteredMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "p-6 cursor-pointer hover:bg-slate-50 transition-all group relative",
                        selectedMessage?.id === msg.id && "bg-primary/5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary"
                      )}
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors text-sm truncate pr-4">{msg.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{formatDate(msg.createdAt, 'HH:mm')}</span>
                      </div>
                      <p className="text-xs font-black text-slate-600 line-clamp-1 mb-1">{msg.subject}</p>
                      <p className="text-[11px] font-medium text-slate-400 line-clamp-1">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Message Detail */}
        <Card className="hidden lg:flex flex-grow border-none shadow-sm bg-white overflow-hidden flex-col">
          {selectedMessage ? (
             <>
                <CardHeader className="p-8 border-b border-slate-50 shrink-0">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                                {selectedMessage.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedMessage.subject}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs font-bold text-slate-400 flex items-center">
                                        <User className="h-3 w-3 mr-1" /> {selectedMessage.name} {'<'} {selectedMessage.email} {'>'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" size="icon" className="rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 border-slate-100">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 overflow-y-auto flex-grow custom-scrollbar">
                    <div className="flex items-center gap-2 mb-8 text-[11px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 w-fit px-3 py-1.5 rounded-full">
                        <Calendar className="h-3 w-3" />
                        ได้รับเมื่อ: {formatDate(selectedMessage.createdAt, 'd MMMM yyyy HH:mm:ss')}
                    </div>
                    
                    <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 font-medium leading-relaxed text-lg whitespace-pre-wrap">
                            {selectedMessage.message}
                        </p>
                    </div>
                </CardContent>
                <div className="p-8 border-t border-slate-50 bg-slate-50/50 shrink-0">
                    <div className="flex gap-4">
                        <Input placeholder="เขียนข้อความตอบกลับ..." className="bg-white border-slate-200 h-12 rounded-xl font-medium" />
                        <Button className="bg-primary hover:bg-primary/90 h-12 px-8 rounded-xl font-black rounded-xl">
                            ส่งตอบกลับ
                        </Button>
                    </div>
                </div>
             </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center p-12">
                <div>
                   <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-12 w-12 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">เลือกข้อความเพื่ออ่าน</h3>
                    <p className="text-slate-400 font-bold max-w-xs mx-auto">เลือกข้อความจากรายการด้านซ้ายมือเพื่อดูรายละเอียดและตอบกลับ</p>
                </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
