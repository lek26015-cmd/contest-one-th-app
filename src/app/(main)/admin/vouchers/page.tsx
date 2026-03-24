'use client';

import { useState, useEffect } from 'react';
import { 
  getVouchers, 
  createVoucher, 
  deleteVoucher 
} from '@/lib/d1-actions';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Ticket, 
  Calendar, 
  Percent, 
  DollarSign, 
  Loader2, 
  Search,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Voucher } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export default function AdminVouchersPage() {
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    expiryDate: '',
    usageLimit: '',
    competitionId: ''
  });

  const loadVouchers = async () => {
    setIsLoading(true);
    try {
      const data = await getVouchers();
      setVouchers(data);
    } catch (error) {
      console.error('Failed to load vouchers:', error);
      toast({ title: 'ผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลคูปองได้', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      toast({ title: 'กรุณากรอกข้อมูล', description: 'กรุณาระบุรหัสคูปองและมูลค่า', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await createVoucher({
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        expiryDate: formData.expiryDate || undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        competitionId: formData.competitionId || undefined
      });

      if (success) {
        toast({ title: 'สำเร็จ', description: 'สร้างคูปองเรียบร้อยแล้ว' });
        setFormData({
          code: '',
          type: 'percentage',
          value: '',
          expiryDate: '',
          usageLimit: '',
          competitionId: ''
        });
        loadVouchers();
      } else {
        throw new Error('Failed to create voucher');
      }
    } catch (error) {
      console.error('Failed to create voucher:', error);
      toast({ title: 'ผิดพลาด', description: 'ไม่สามารถสร้างคูปองได้ (รหัสอาจซ้ำ)', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคูปองนี้?')) return;

    try {
      const success = await deleteVoucher(id);
      if (success) {
        toast({ title: 'สำเร็จ', description: 'ลบคูปองเรียบร้อยแล้ว' });
        loadVouchers();
      }
    } catch (error) {
      console.error('Failed to delete voucher:', error);
      toast({ title: 'ผิดพลาด', description: 'ไม่สามารถลบคูปองได้', variant: 'destructive' });
    }
  };

  const filteredVouchers = vouchers.filter(v => 
    v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.competitionId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3 font-headline">
            <Ticket className="h-10 w-10 text-primary" />
            จัดการคูปองส่วนลด
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-wider text-sm">Vouchers & Promotion Codes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Vouchers List */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black font-headline">คูปองทั้งหมด</CardTitle>
                <CardDescription className="font-bold text-slate-400 mt-1">รายการคูปองที่สร้างไว้ในระบบ</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="ค้นหารหัสคูปอง..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 rounded-xl bg-slate-50 border-none font-bold"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="font-black text-lg">กำลังโหลดข้อมูลคูปอง...</p>
                </div>
              ) : filteredVouchers.length === 0 ? (
                <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                  <Ticket className="w-16 h-16 opacity-20" />
                  <p className="font-black text-lg">ยังไม่มีคูปองในระบบ</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                        <th className="px-8 py-6">รหัสคูปอง</th>
                        <th className="px-8 py-6">ประเภท / มูลค่า</th>
                        <th className="px-8 py-6">การใช้งาน</th>
                        <th className="px-8 py-6">วันหมดอายุ</th>
                        <th className="px-8 py-6 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredVouchers.map((v) => (
                        <tr key={v.id} className="group hover:bg-slate-50/50 transition-all">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-lg tracking-wider font-mono">
                                {v.code}
                              </span>
                              {v.competitionId && (
                                <span className="text-[10px] font-bold text-primary mt-0.5">
                                  เฉพาะงาน: {v.competitionId.substring(0, 15)}...
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              {v.type === 'percentage' ? (
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                  <Percent className="w-4 h-4" />
                                </div>
                              ) : (
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                  <DollarSign className="w-4 h-4" />
                                </div>
                              )}
                              <div>
                                <span className="font-black text-slate-700">
                                  {v.value}{v.type === 'percentage' ? '%' : ' บาท'}
                                </span>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                  {v.type === 'percentage' ? 'เปอร์เซ็นต์' : 'ส่วนลดคงที่'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{v.usageCount}</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-slate-400 font-bold">{v.usageLimit || '∞'}</span>
                              </div>
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary" 
                                  style={{ width: `${v.usageLimit ? Math.min((v.usageCount / v.usageLimit) * 100, 100) : 0}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {v.expiryDate ? (
                              <div className={cn(
                                "flex items-center gap-2 font-bold text-sm",
                                new Date(v.expiryDate) < new Date() ? "text-rose-500" : "text-slate-600"
                              )}>
                                <Clock className="w-3.5 h-3.5" />
                                {format(new Date(v.expiryDate), 'd MMM yyyy', { locale: th })}
                                {new Date(v.expiryDate) < new Date() && (
                                  <Badge className="bg-rose-50 text-rose-500 border-none text-[8px] h-4">EXPIRED</Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300 font-bold text-sm">ไม่มีวันหมดอายุ</span>
                            )}
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(v.id)}
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

        {/* Right: Add New Voucher Form */}
        <div className="space-y-8">
          <Card className="border-none shadow-md rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="text-xl font-black font-headline">สร้างคูปองใหม่</CardTitle>
              <CardDescription className="font-bold text-slate-400">กำหนดเงื่อนไขส่วนลด</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label className="font-black text-slate-700 ml-1">รหัสคูปอง (Code)</Label>
                  <Input 
                    placeholder="เช่น SUMMER2024" 
                    value={formData.code}
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="h-14 rounded-2xl bg-slate-50 border-none font-black text-xl focus:bg-white transition-all shadow-inner tracking-widest font-mono"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-black text-slate-700 ml-1">ประเภทส่วนลด</Label>
                  <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none font-bold focus:bg-white transition-all shadow-inner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="percentage">เปอร์เซ็นต์ (%)</SelectItem>
                      <SelectItem value="fixed">จำนวนเงินคงที่ (บาท)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="font-black text-slate-700 ml-1">มูลค่าส่วนลด</Label>
                  <Input 
                    type="number"
                    value={formData.value}
                    onChange={e => setFormData({...formData, value: e.target.value})}
                    placeholder="0"
                    className="h-14 rounded-2xl bg-slate-50 border-none font-black text-2xl focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-black text-slate-700 ml-1">ขีดจำกัดการใช้งาน (Optional)</Label>
                  <Input 
                    type="number"
                    value={formData.usageLimit}
                    onChange={e => setFormData({...formData, usageLimit: e.target.value})}
                    placeholder="ไม่จำกัดจำนวนครั้ง"
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-black text-slate-700 ml-1">วันหมดอายุ (Optional)</Label>
                  <Input 
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-black text-slate-700 ml-1">Id งานแข่งขันเฉพาะ (Optional)</Label>
                  <Input 
                    value={formData.competitionId}
                    onChange={e => setFormData({...formData, competitionId: e.target.value})}
                    placeholder="ปล่อยว่างหากใช้ได้ทุกงาน"
                    className="h-14 rounded-2xl bg-slate-50 border-none font-bold focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-lg gap-3 shadow-xl transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6" />}
                  สร้างคูปอง
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
