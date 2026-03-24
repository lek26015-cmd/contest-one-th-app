'use client';

import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  CreditCard,
  Save,
  Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">ตั้งค่าบัญชี</h1>
        <p className="text-slate-400 font-bold mt-1">จัดการข้อมูลส่วนตัว ความปลอดภัย และการแจ้งเตือนของคุณ</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Section */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-slate-50">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> ข้อมูลส่วนตัว
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="flex items-center gap-8">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl">
                    {user?.email?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all scale-90 group-hover:scale-100">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">{user?.displayName || 'Organizer Name'}</h4>
                <p className="text-sm font-bold text-slate-400">แก้ไขรูปภาพและข้อมูลพื้นฐานของคุณ</p>
                <div className="pt-2 flex gap-2">
                  <Badge className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase tracking-widest">Organizer Account</Badge>
                  <Badge className="bg-indigo-50 text-indigo-600 border-none text-[9px] font-black uppercase tracking-widest">Verified</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">ชื่อที่แสดง</Label>
                <Input defaultValue={user?.displayName || ''} className="h-12 border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-primary/20 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">อีเมลสื่อสาร</Label>
                <Input defaultValue={user?.email || ''} className="h-12 border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-primary/20 font-bold" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">เกี่ยวกับฉัน / องค์กร</Label>
                <Input placeholder="แนะนำตัวหรือองค์กรของคุณสั้นๆ..." className="h-12 border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-primary/20 font-bold" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="px-8 py-4 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-50">
             <Button variant="ghost" className="font-bold text-slate-400 hover:text-slate-600">ยกเลิก</Button>
             <Button className="bg-primary font-black px-6 shadow-lg shadow-primary/20">
               <Save className="mr-2 h-4 w-4" /> บันทึกการเปลี่ยนแปลง
             </Button>
          </CardFooter>
        </Card>

        {/* Notifications Section */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-slate-50">
            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-500" /> การแจ้งเตือน
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {[
              { title: 'ผู้สมัครใหม่', desc: 'แจ้งเตือนเมื่อมีคนสมัครงานเข้าการแข่งขันของคุณ', active: true },
              { title: 'การชำระเงิน', desc: 'สถานะใบสมัคร แผนการจ่ายเงิน และการตัดยอด', active: true },
              { title: 'ข่าวสารและอัปเดต', desc: 'ข้อมูลฟีเจอร์ใหม่และกิจกรรมสำหรับผู้จัดงาน', active: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-50">
                <div className="space-y-0.5">
                  <h5 className="font-black text-slate-900 text-sm">{item.title}</h5>
                  <p className="text-xs font-bold text-slate-400">{item.desc}</p>
                </div>
                <Switch defaultChecked={item.active} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <CardHeader className="px-8 py-6 border-b border-red-50">
            <CardTitle className="text-lg font-black tracking-tight text-red-600 flex items-center gap-2">
              <Shield className="h-5 w-5" /> ความปลอดภัยขั้นสูง
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex items-center justify-between gap-4">
             <div className="space-y-1">
               <h5 className="font-black text-slate-900">ลบบัญชีผู้ใช้</h5>
               <p className="text-sm font-bold text-slate-400">การลบบัญชีจะทำให้ข้อมูลงานแข่งขันและผู้สมัครทั้งหมดหายไปอย่างถาวร</p>
             </div>
             <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 font-black px-6 rounded-xl h-12">
               ลบบัญชี
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
