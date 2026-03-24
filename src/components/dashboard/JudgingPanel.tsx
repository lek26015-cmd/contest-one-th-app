'use client';

import { useState, useEffect } from 'react';
import { 
  Gavel, 
  Users, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  Clock, 
  BarChart3, 
  ChevronRight,
  UserPlus,
  Mail,
  Award,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  JudgingCriteria, 
  JudgeAssignment, 
  JudgingScore, 
  Competition 
} from '@/lib/types';
import { updateJudgingConfig, inviteJudge, getJudgingSummary } from '@/lib/judging-actions';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function JudgingPanel({ competition }: { competition: Competition }) {
  const [activeTab, setActiveTab] = useState('criteria');
  const [criteria, setCriteria] = useState<JudgingCriteria[]>([]);
  const [judges, setJudges] = useState<JudgeAssignment[]>([]);
  const [judgeEmail, setJudgeEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // Add new criteria
  const addCriteria = () => {
    const newCriteria: JudgingCriteria = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'เกณฑ์ใหม่',
      maxScore: 10,
      weight: 0.2
    };
    setCriteria([...criteria, newCriteria]);
  };

  // Remove criteria
  const removeCriteria = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id));
  };

  // Update criteria
  const updateCriteriaItem = (id: string, updates: Partial<JudgingCriteria>) => {
    setCriteria(criteria.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  // Save criteria to DB
  const handleSaveCriteria = async () => {
    setIsSaving(true);
    const res = await updateJudgingConfig(competition.id, criteria);
    if (res.success) {
      toast({ title: 'สำเร็จ', description: 'บันทึกเกณฑ์การตัดสินเรียบร้อยแล้ว' });
    } else {
      toast({ title: 'ผิดพลาด', description: 'ไม่สามารถบันทึกเกณฑ์การตัดสินได้', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  // Invite judge
  const handleInviteJudge = async () => {
    if (!judgeEmail) return;
    const res = await inviteJudge(competition.id, judgeEmail);
    if (res.success) {
      toast({ title: 'เชิญสำเร็จ', description: `ส่งคำเชิญไปที่ ${judgeEmail} แล้ว` });
      setJudgeEmail('');
      // In a real app, refresh the list
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 font-headline">
            <Gavel className="h-8 w-8 text-primary" /> ระบบตัดสินคะแนน
          </h2>
          <p className="text-slate-400 font-bold mt-1">ตั้งค่าเกณฑ์ ส่งคำเชิญกรรมการ และรวบรวมผลคะแนนแบบเรียลไทม์</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest animate-pulse">
           ENTERPRISE FEATURE
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-14 w-full md:w-auto">
          <TabsTrigger value="criteria" className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm h-11">
             1. เกณฑ์การให้คะแนน
          </TabsTrigger>
          <TabsTrigger value="judges" className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm h-11">
             2. รายชื่อกรรมการ
          </TabsTrigger>
          <TabsTrigger value="live" className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm h-11">
             3. สรุปผลเรียลไทม์
          </TabsTrigger>
        </TabsList>

        <Card className="mt-8 border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white/50 backdrop-blur-xl">
          <CardContent className="p-10">
            {/* Criteria Tab */}
            <TabsContent value="criteria" className="m-0 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">เกณฑ์การให้คะแนน</h3>
                  <p className="text-sm font-bold text-slate-400">กำหนดเกณฑ์และค่าน้ำหนัก (Weight) ให้กับการตัดสิน</p>
                </div>
                <Button onClick={addCriteria} variant="outline" className="border-2 border-slate-100 hover:border-primary hover:bg-emerald-50 text-slate-600 hover:text-primary rounded-xl px-6 h-12 font-black transition-all">
                  <Plus className="h-4 w-4 mr-2" /> เพิ่มเกณฑ์
                </Button>
              </div>

              <div className="space-y-4">
                {criteria.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Gavel className="h-10 w-10 text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-bold">ยังไม่มีการกำหนดเกณฑ์ กดปุ่มเพิ่มเกณฑ์เพื่อเริ่มตั้งค่า</p>
                  </div>
                ) : (
                  criteria.map((c, i) => (
                    <motion.div 
                      key={c.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:border-primary/20 transition-all"
                    >
                      <div className="flex-grow w-full">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">ชื่อเกณฑ์</label>
                        <Input 
                          value={c.name}
                          onChange={(e) => updateCriteriaItem(c.id, { name: e.target.value })}
                          className="border-none bg-slate-50 font-bold h-12 rounded-xl focus:ring-primary/20"
                        />
                      </div>
                      <div className="w-full md:w-32">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">คะแนนเต็ม</label>
                        <Input 
                          type="number"
                          value={c.maxScore}
                          onChange={(e) => updateCriteriaItem(c.id, { maxScore: parseInt(e.target.value) })}
                          className="border-none bg-slate-50 font-bold h-12 rounded-xl focus:ring-primary/20"
                        />
                      </div>
                      <div className="w-full md:w-32">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">น้ำหนัก (0-1)</label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={c.weight}
                          onChange={(e) => updateCriteriaItem(c.id, { weight: parseFloat(e.target.value) })}
                          className="border-none bg-slate-50 font-bold h-12 rounded-xl focus:ring-primary/20 text-emerald-600"
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeCriteria(c.id)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>

              {criteria.length > 0 && (
                <div className="flex justify-end pt-6 border-t border-slate-50">
                  <Button 
                    onClick={handleSaveCriteria} 
                    disabled={isSaving}
                    className="bg-primary hover:bg-primary/90 text-white font-black px-10 h-14 rounded-2xl shadow-xl shadow-primary/20 transition-all"
                  >
                    {isSaving ? 'กำลังบันทึก...' : <><Save className="h-5 w-5 mr-2" /> บันทึกการตั้งค่า</>}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Judges Tab */}
            <TabsContent value="judges" className="m-0 space-y-8">
              <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-grow w-full">
                  <h3 className="text-xl font-black text-slate-900 mb-2">เชิญคณะกรรมการ</h3>
                  <p className="text-sm font-bold text-slate-400 mb-4">ใส่อีเมลของกรรมการที่ต้องการเชิญมาร่วมตัดสินงานนี้</p>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      placeholder="email@example.com" 
                      value={judgeEmail}
                      onChange={(e) => setJudgeEmail(e.target.value)}
                      className="pl-12 h-14 bg-white border-2 border-slate-100 rounded-2xl focus:border-primary/50 focus:ring-4 focus:ring-primary/5 font-bold transition-all"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleInviteJudge}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-14 px-8 rounded-2xl font-black shadow-xl"
                >
                  <UserPlus className="h-5 w-5 mr-2" /> ส่งคำเชิญ
                </Button>
              </div>

              <div className="pt-8 border-t border-slate-50">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">กรรมการที่ได้รับคำเชิญแล้ว</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {judges.length === 0 ? (
                     <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2rem] border-none">
                        <p className="text-slate-400 font-bold">ยังไม่มีการเชิญกรรมการในขณะนี้</p>
                     </div>
                  ) : (
                    judges.map((j) => (
                      <div key={j.id} className="bg-white p-5 rounded-2xl border border-slate-50 flex items-center justify-between group shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400">
                             {j.userEmail.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{j.userEmail}</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                               <Clock className="h-3 w-3" /> {j.status}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-200 hover:text-red-500 rounded-xl">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="live" className="m-0 space-y-8">
              <div className="flex items-center justify-between bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200/50 animate-bounce">
                      <Award className="h-6 w-6" />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-slate-900">สรุปผลคะแนนรวมอัตโนมัติ</h3>
                      <p className="text-sm font-bold text-emerald-600/70">ระบบประมวลผลให้แบบเรียลไทม์ทันทีที่มีการตัดสิน</p>
                   </div>
                </div>
                <Button variant="outline" className="bg-white border-emerald-100 text-emerald-600 font-black rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
                   <BarChart3 className="h-4 w-4 mr-2" /> ดูรายงานละเอียด
                </Button>
              </div>

              <div className="space-y-4 pt-4">
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                             {i}
                          </div>
                          <div>
                             <h4 className="font-black text-slate-900 text-lg">ทีมผู้สมัครหมายเลข #00{i}</h4>
                             <p className="text-sm font-bold text-slate-400">กรรมการตัดสินแล้ว 2/5 ท่าน</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-3xl font-black text-primary tracking-tighter">9{5-i}.5</p>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">AVERAGE SCORE</span>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="pt-8 text-center bg-slate-50/50 rounded-3xl p-10 border-2 border-dashed border-slate-200">
                 <p className="text-slate-400 font-bold mb-6">คุณสามารถเริ่มกระบวนการตัดสินได้เมื่อมีกรรมการตอบรับอย่างน้อย 1 ท่าน</p>
                 <Button className="bg-primary text-white font-black px-12 h-14 rounded-2xl shadow-xl shadow-primary/20">
                    เข้าสู่โหมดการตัดสิน (Judge View) <ArrowRight className="ml-2 h-4 w-4" />
                 </Button>
              </div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
