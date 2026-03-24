'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  getTransactionsFromD1, 
  addTransactionToD1, 
  deleteTransactionFromD1,
  getFinanceSummaryFromD1,
  getSubmissionsFromD1,
  verifyPaymentInD1
} from '@/lib/d1-actions';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft,
  Loader2,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  Eye,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Transaction, Submission } from '@/lib/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  Cell
} from 'recharts';
import Image from 'next/image';

export default function AdminFinancePage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    category: 'ticket_sale',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [txs, sum, subs] = await Promise.all([
        getTransactionsFromD1(),
        getFinanceSummaryFromD1(),
        getSubmissionsFromD1({ status: 'pending' })
      ]);
      setTransactions(txs);
      setSummary(sum);
      setSubmissions(subs.filter(s => s.paymentStatus === 'pending'));
    } catch (error) {
      console.error('Failed to load finance data:', error);
      toast({ title: 'ผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลการเงินได้', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    setIsSubmitting(true);
    try {
      await addTransactionToD1({
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date
      });
      toast({ title: 'สำเร็จ', description: 'บันทึกรายการเรียบร้อยแล้ว' });
      setFormData({
        ...formData,
        amount: '',
        description: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast({ title: 'ผิดพลาด', description: 'ไม่สามารถบันทึกรายการได้', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransactionFromD1(id);
      toast({ title: 'สำเร็จ', description: 'ลบรายการเรียบร้อยแล้ว' });
      loadData();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      toast({ title: 'ผิดพลาด', description: 'ไม่สามารถลบรายการได้', variant: 'destructive' });
    }
  };

  const handleVerifyPayment = async (id: string, status: 'paid' | 'unpaid') => {
    try {
      await verifyPaymentInD1(id, status);
      toast({ 
        title: status === 'paid' ? 'อนุมัติสำเร็จ' : 'ปฏิเสธสำเร็จ', 
        description: status === 'paid' ? 'ยืนยันการชำระเงินและสร้างรายการรายรับแล้ว' : 'ปฏิเสธการชำระเงินเรียบร้อยแล้ว' 
      });
      loadData();
    } catch (error) {
      console.error('Failed to verify payment:', error);
      toast({ title: 'ผิดพลาด', description: 'ไม่สามารถดำเนินการได้', variant: 'destructive' });
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const chartData = useMemo(() => {
    const data = [
      { name: 'รายรับ', value: summary.income, color: '#10b981' },
      { name: 'รายจ่าย', value: summary.expense, color: '#ef4444' }
    ];
    return data;
  }, [summary]);

  const categories = [
    { value: 'ticket_sale', label: 'ขายตั๋ว / ค่าสมัคร' },
    { value: 'sponsor', label: 'สปอนเซอร์' },
    { value: 'prize_payout', label: 'จ่ายเงินรางวัล' },
    { value: 'marketing', label: 'การตลาด / โฆษณา' },
    { value: 'other', label: 'อื่นๆ' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3 font-headline">
            <Wallet className="h-10 w-10 text-primary" />
            จัดการการเงิน
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider text-sm">Finance Management & Cashflow</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 border-none shadow-inner">
            <TabsTrigger value="overview" className="rounded-xl font-black px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm">ภาพรวม</TabsTrigger>
            <TabsTrigger value="verification" className="rounded-xl font-black px-8 data-[state=active]:bg-white data-[state=active]:shadow-sm flex gap-2">
              ตรวจสอบสลิป
              {submissions.length > 0 && <span className="bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">{submissions.length}</span>}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <div key="overview" className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-xl rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-24 h-24" />
                </div>
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-100 font-black uppercase tracking-widest text-xs">
                    <ArrowUpRight className="w-4 h-4" /> รายรับทั้งหมด
                  </div>
                  <div className="text-4xl font-black tabular-nums">฿{summary.income.toLocaleString()}</div>
                  <div className="h-1 w-20 bg-emerald-400/30 rounded-full" />
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-[2rem] bg-gradient-to-br from-rose-500 to-rose-600 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-24 h-24" />
                </div>
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-2 text-rose-100 font-black uppercase tracking-widest text-xs">
                    <ArrowDownLeft className="w-4 h-4" /> รายจ่ายทั้งหมด
                  </div>
                  <div className="text-4xl font-black tabular-nums">฿{summary.expense.toLocaleString()}</div>
                  <div className="h-1 w-20 bg-rose-400/30 rounded-full" />
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden relative group">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-xs">
                    <DollarSign className="w-4 h-4" /> ยอดคงเหลือ
                  </div>
                  <div className={cn(
                    "text-4xl font-black tabular-nums",
                    summary.balance >= 0 ? "text-emerald-600" : "text-rose-600"
                  )}>
                    ฿{summary.balance.toLocaleString()}
                  </div>
                  <div className={cn(
                    "h-1 w-20 rounded-full",
                    summary.balance >= 0 ? "bg-emerald-100" : "bg-rose-100"
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Chart & History */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black font-headline">ประวัติรายการ</CardTitle>
                      <CardDescription className="font-bold">รายการรายรับ-รายจ่ายล่าสุด</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          placeholder="ค้นหา..." 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="pl-9 h-10 rounded-xl bg-slate-50 border-none font-bold"
                        />
                      </div>
                      <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                        <SelectTrigger className="w-32 h-10 rounded-xl bg-slate-50 border-none font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-xl">
                          <SelectItem value="all">ทั้งหมด</SelectItem>
                          <SelectItem value="income">รายรับ</SelectItem>
                          <SelectItem value="expense">รายจ่าย</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="font-black text-lg">กำลังประมวลผลข้อมูลการเงิน...</p>
                      </div>
                    ) : filteredTransactions.length === 0 ? (
                      <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                        <FileText className="w-16 h-16 opacity-20" />
                        <p className="font-black text-lg">ไม่พบข้อมูลรายการในขณะนี้</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                              <th className="px-8 py-6">วันที่</th>
                              <th className="px-8 py-6">รายการ</th>
                              <th className="px-8 py-6">หมวดหมู่</th>
                              <th className="px-8 py-6 text-right">จำนวนเงิน</th>
                              <th className="px-8 py-6 text-right">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {filteredTransactions.map((tx) => (
                              <tr key={tx.id} className="group hover:bg-slate-50/50 transition-all">
                                <td className="px-8 py-6 whitespace-nowrap">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                                      <Calendar className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-900">
                                      {format(new Date(tx.date), 'd MMM yyyy', { locale: th })}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-8 py-6">
                                  <p className="font-bold text-slate-900 leading-tight">{tx.description}</p>
                                </td>
                                <td className="px-8 py-6">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
                                      {categories.find(c => c.value === tx.category)?.label || tx.category}
                                    </span>
                                    {tx.stripePaymentId && (
                                      <Badge className="w-fit mt-1 bg-indigo-50 text-indigo-600 border-none text-[8px] px-1.5 h-4 font-black">STRIPE</Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="px-8 py-6 text-right whitespace-nowrap">
                                  <div className={cn(
                                    "text-lg font-black tabular-nums",
                                    tx.type === 'income' ? "text-emerald-500" : "text-rose-500"
                                  )}>
                                    {tx.type === 'income' ? '+' : '-'}฿{tx.amount.toLocaleString()}
                                  </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleDelete(tx.id)}
                                    className="h-10 w-10 p-0 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Add Side */}
              <div className="space-y-8">
                <Card className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
                    <CardTitle className="text-xl font-black font-headline">เพิ่มรายการใหม่</CardTitle>
                    <CardDescription className="font-bold">บันทึกรายรับหรือรายจ่ายใหม่</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="font-black text-slate-700 ml-1">ประเภท</Label>
                        <div className="flex p-1 bg-slate-100 rounded-2xl">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, type: 'income'})}
                            className={cn(
                              "flex-1 h-12 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2",
                              formData.type === 'income' ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-900"
                            )}
                          >
                            <TrendingUp className="w-4 h-4" /> รายรับ
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, type: 'expense'})}
                            className={cn(
                              "flex-1 h-12 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2",
                              formData.type === 'expense' ? "bg-white shadow-sm text-rose-600" : "text-slate-500 hover:text-slate-900"
                            )}
                          >
                            <TrendingDown className="w-4 h-4" /> รายจ่าย
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="font-black text-slate-700 ml-1">จำนวนเงิน (บาท)</Label>
                        <Input 
                          type="number"
                          value={formData.amount}
                          onChange={e => setFormData({...formData, amount: e.target.value})}
                          placeholder="0.00"
                          className="h-14 rounded-2xl bg-slate-50 border-none font-black text-2xl focus:bg-white transition-all shadow-inner text-center"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="font-black text-slate-700 ml-1">หมวดหมู่</Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                          <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold focus:bg-white transition-all shadow-inner">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-none shadow-2xl">
                            {categories.map(c => (
                              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="font-black text-slate-700 ml-1">รายละเอียด</Label>
                        <Input 
                          value={formData.description}
                          onChange={e => setFormData({...formData, description: e.target.value})}
                          placeholder="ระบุรายละเอียด..."
                          className="h-14 rounded-2xl bg-slate-50 border-none font-bold focus:bg-white transition-all shadow-inner"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="font-black text-slate-700 ml-1">วันที่</Label>
                        <Input 
                          type="date"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          className="h-14 rounded-2xl bg-slate-50 border-none font-bold focus:bg-white transition-all shadow-inner"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg gap-3 shadow-xl transition-all active:scale-95"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6" />}
                        บันทึกรายการ
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Quick Chart */}
                <Card className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
                  <CardHeader className="p-8 border-b border-slate-50">
                    <CardTitle className="text-xl font-black font-headline">สัดส่วนการเงิน</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                          <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div key="verification" className="space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white min-h-[600px]">
              <CardHeader className="p-10 border-b border-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl font-black font-headline">ตรวจสอบการชำระเงิน</CardTitle>
                    <CardDescription className="text-slate-500 font-bold mt-1">ใบสมัครที่รอการยืนยันสลิปโอนเงิน</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-black px-4 py-1.5 rounded-full border-none">
                    รอดำเนินการ {submissions.length} รายการ
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-40 text-center flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="font-black text-slate-400">กำลังโหลดรายการใบสมัคร...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="p-40 text-center flex flex-col items-center gap-6 opacity-30">
                    <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                    <div className="space-y-2">
                       <p className="text-2xl font-black text-slate-900">ไม่มีรายการค้างตรวจสอบ</p>
                       <p className="font-bold text-slate-500">คุณได้ดำเนินการตรวจสอบรายการทั้งหมดเรียบร้อยแล้ว</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                          <th className="px-10 py-6">ข้อมูลผู้สมัคร</th>
                          <th className="px-10 py-6">การแข่งขัน</th>
                          <th className="px-10 py-6 text-center">หลักฐาน (Slip)</th>
                          <th className="px-10 py-6 text-right">จำนวนเงิน</th>
                          <th className="px-10 py-6 text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {submissions.map((sub) => (
                          <tr key={sub.id} className="group hover:bg-slate-50/50 transition-all">
                            <td className="px-10 py-6">
                              <div className="space-y-1">
                                <p className="font-black text-slate-900">{sub.userName}</p>
                                <p className="text-xs font-bold text-slate-400">{sub.userEmail}</p>
                                <p className="text-[10px] text-primary font-black uppercase tracking-wider">{format(new Date(sub.createdAt!), 'd MMM yyyy HH:mm', { locale: th })}</p>
                              </div>
                            </td>
                            <td className="px-10 py-6">
                              <p className="font-bold text-slate-500 text-sm max-w-[200px] truncate">{sub.competitionId}</p>
                            </td>
                            <td className="px-10 py-6 text-center">
                              {sub.paymentSlipUrl ? (
                                <a 
                                  href={sub.paymentSlipUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-block relative group/slip"
                                >
                                  <div className="w-16 h-20 bg-slate-100 rounded-xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 transition-all group-hover/slip:scale-110 group-hover/slip:shadow-xl">
                                    <Image src={sub.paymentSlipUrl} alt="Slip" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/slip:opacity-100 flex items-center justify-center text-white transition-opacity">
                                      <Eye className="w-5 h-5" />
                                    </div>
                                  </div>
                                </a>
                              ) : (
                                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">ไม่มีสลิป</span>
                              )}
                            </td>
                            <td className="px-10 py-6 text-right">
                              <p className="text-xl font-black text-slate-900 italic tabular-nums">฿{sub.paymentAmount?.toLocaleString()}</p>
                            </td>
                            <td className="px-10 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleVerifyPayment(sub.id!, 'unpaid')}
                                  className="h-10 px-4 rounded-xl font-black text-rose-500 hover:bg-rose-50 hover:text-rose-600 gap-2"
                                >
                                  <XCircle className="w-4 h-4" /> ปฏิเสธ
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleVerifyPayment(sub.id!, 'paid')}
                                  className="h-10 px-6 rounded-xl font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> อนุมัติ
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
