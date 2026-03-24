'use client';

import { useEffect, useState } from 'react';
import { 
  getAllHeroAdsFromD1,
  addHeroAdToD1,
  updateHeroAdInD1,
  deleteHeroAdInD1
} from '@/lib/d1-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  PlusCircle, 
  Trash2, 
  Pencil, 
  ExternalLink, 
  GripVertical,
  ImageIcon,
  Save,
  X,
  Loader2
} from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { HeroAd } from '@/lib/types';

export default function AdminHeroAdsPage() {
  const { toast } = useToast();
  const [ads, setAds] = useState<HeroAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    order: 0,
    active: true,
    expiresAt: ''
  });

  const loadAds = async () => {
    setIsLoading(true);
    try {
      const data = await getAllHeroAdsFromD1();
      setAds(data);
    } catch (error) {
      console.error('Failed to load hero ads:', error);
      toast({ title: 'ผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลโฆษณาได้', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      imageUrl: '',
      linkUrl: '',
      order: (ads?.length || 0) + 1,
      active: true,
      expiresAt: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (ad: HeroAd) => {
    setFormData({
      title: ad.title,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      order: ad.order,
      active: ad.active,
      expiresAt: ad.expiresAt || ''
    });
    setEditingId(ad.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateHeroAdInD1(editingId, formData);
        toast({ title: 'สำเร็จ', description: 'แก้ไขโฆษณาเรียบร้อยแล้ว' });
      } else {
        await addHeroAdToD1(formData);
        toast({ title: 'สำเร็จ', description: 'เพิ่มโฆษณาใหม่เรียบร้อยแล้ว' });
      }
      resetForm();
      loadAds();
    } catch (error) {
      toast({ 
        title: 'เกิดข้อผิดพลาด', 
        description: 'ไม่สามารถบันทึกข้อมูลได้', 
        variant: 'destructive' 
      });
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHeroAdInD1(id);
      toast({ title: 'สำเร็จ', description: 'ลบโฆษณาเรียบร้อยแล้ว' });
      loadAds();
    } catch (error) {
      toast({ 
        title: 'เกิดข้อผิดพลาด', 
        description: 'ไม่สามารถลบโฆษณาได้', 
        variant: 'destructive' 
      });
      console.error(error);
    }
  };

  const handleToggleActive = async (ad: HeroAd) => {
    try {
      await updateHeroAdInD1(ad.id, { active: !ad.active });
      loadAds();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">จัดการโฆษณาหน้าแรก</h1>
          <p className="text-slate-500 font-bold mt-1">จัดการรูปภาพและลิงก์ของ Carousel ด้านบนสุดของหน้าหลัก</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-primary hover:bg-primary/90 font-black rounded-xl">
            <PlusCircle className="mr-2 h-4 w-4" /> เพิ่มโฆษณาใหม่
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-black">{editingId ? 'แก้ไขโฆษณา' : 'เพิ่มโฆษณาใหม่'}</CardTitle>
                <CardDescription className="font-bold">กรอกข้อมูลรายละเอียดของโฆษณา</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={resetForm} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700">หัวข้อโฆษณา (สำหรับอ้างอิง)</Label>
                    <Input 
                      placeholder="เช่น โปรโมชั่นงานแข่งเดือนเมษายน" 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      required
                      className="rounded-xl border-slate-200 h-12 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700">ลิงก์รูปภาพ (Image URL)</Label>
                    <Input 
                      placeholder="https://- (ใช้ขนาดประมาณ 2400x700px)" 
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      required
                      className="rounded-xl border-slate-200 h-12 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700">ลิงก์ปลายทาง (Redirect URL)</Label>
                    <Input 
                      placeholder="เช่น /competitions/id หรือ https://-" 
                      value={formData.linkUrl}
                      onChange={e => setFormData({...formData, linkUrl: e.target.value})}
                      required
                      className="rounded-xl border-slate-200 h-12 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black text-slate-700">วันหมดอายุ (Expiry Date)</Label>
                    <Input 
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                      className="rounded-xl border-slate-200 h-12 font-bold"
                    />
                    <p className="text-[10px] text-slate-400 font-bold">เว้นว่างไว้หากไม่ต้องการให้หมดอายุ</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-black text-slate-700">ลำดับการแสดงผล</Label>
                      <Input 
                        type="number"
                        value={formData.order}
                        onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                        required
                        className="rounded-xl border-slate-200 h-12 font-bold"
                      />
                    </div>
                    <div className="flex flex-col justify-end pb-3">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="active-mode" 
                          checked={formData.active}
                          onCheckedChange={checked => setFormData({...formData, active: checked})}
                        />
                        <Label htmlFor="active-mode" className="font-black text-slate-700">เปิดใช้งานทันที</Label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center min-h-[150px]">
                    {formData.imageUrl ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="object-cover w-full h-full"
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/800x400?text=Invalid+Image+URL')}
                        />
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-400">ตัวอย่างรูปภาพจะปรากฏที่นี่</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={resetForm} className="rounded-xl h-12 px-8 font-black border-none bg-slate-100 hover:bg-slate-200">ยกเลิก</Button>
                <Button type="submit" className="rounded-xl h-12 px-8 font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  <Save className="mr-2 h-4 w-4" /> {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มโฆษณา'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
          ))
        ) : (
          ads?.map((ad) => (
            <Card key={ad.id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-[2rem] overflow-hidden bg-white group text-left">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="w-10 flex-shrink-0 flex items-center justify-center text-slate-300">
                  <GripVertical className="h-6 w-6" />
                </div>
                
                <div className="w-48 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-50 shadow-inner">
                  <img src={ad.imageUrl} className="w-full h-full object-cover" alt={ad.title} />
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-900">{ad.title}</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-50 rounded-full border border-slate-100">
                      Order: {ad.order}
                    </span>
                    {ad.expiresAt && (
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${new Date(ad.expiresAt) < new Date() ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'}`}>
                        Expires: {new Date(ad.expiresAt).toLocaleString('th-TH')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 truncate max-w-md">
                    <ExternalLink className="h-3 w-3" /> {ad.linkUrl}
                  </p>
                </div>

                <div className="flex items-center gap-6 pr-4">
                  <div className="flex flex-col items-end gap-1">
                    <Switch checked={ad.active} onCheckedChange={() => handleToggleActive(ad)} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${ad.active ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {ad.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="w-[1px] h-10 bg-slate-100" />
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(ad)} className="rounded-full hover:bg-slate-50 text-slate-400 hover:text-primary transition-colors">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-black">คุณแน่ใจหรือไม่ที่จะลบโฆษณานี้?</AlertDialogTitle>
                          <AlertDialogDescription className="font-bold">
                            การดำเนินการนี้ไม่สามารถย้อนกลับได้ โฆษณาจะถูกลบออกจากระบบถาวร
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl font-black border-none bg-slate-100">ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(ad.id)} className="rounded-xl font-black bg-red-500 hover:bg-red-600">
                            ยืนยันการลบ
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        
        {ads?.length === 0 && !isLoading && (
          <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <ImageIcon className="h-8 w-8 text-slate-200" />
             </div>
             <h4 className="font-bold text-slate-900">ยังไม่มีโฆษณาหน้าแรก</h4>
             <p className="text-slate-400 text-xs mt-1 font-bold">กดปุ่ม "เพิ่มโฆษณาใหม่" เพื่อเริ่มต้น</p>
          </div>
        )}
      </div>
    </div>
  );
}
