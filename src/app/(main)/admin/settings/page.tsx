'use client';

import { useState, useEffect } from 'react';
import { getSettingFromD1, updateSettingInD1 } from '@/lib/d1-actions';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Globe, Mail, Bell, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    site_title: 'ContestOne.th',
    contact_email: '',
    line_notify_token: ''
  });

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const title = await getSettingFromD1('site_title') || 'ContestOne.th';
        const email = await getSettingFromD1('contact_email') || '';
        const token = await getSettingFromD1('line_notify_token') || '';
        
        setSettings({
          site_title: title,
          contact_email: email,
          line_notify_token: token
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast({ title: 'ผิดพลาด', description: 'ไม่สามารถโหลดข้อมูลการตั้งค่าได้', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [toast]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettingInD1('site_title', settings.site_title);
      await updateSettingInD1('contact_email', settings.contact_email);
      await updateSettingInD1('line_notify_token', settings.line_notify_token);
      
      toast({ title: 'สำเร็จ', description: 'บันทึกการตั้งค่าเรียบร้อยแล้ว' });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({ title: 'ผิดพลาด', description: 'ไม่สามารถบันทึกข้อมูลได้', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 font-headline">ตั้งค่าระบบ</h1>
        <p className="text-slate-500 font-bold">จัดการการตั้งค่าพื้นฐานของเว็บไซต์</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-black font-headline">ข้อมูลทั่วไป</CardTitle>
            </div>
            <CardDescription className="font-bold">ตั้งข้อมูลพื้นฐานที่แสดงบนเว็บไซต์</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-black text-slate-700">ชื่อเว็บไซต์ (Site Title)</Label>
              <Input 
                value={settings.site_title}
                onChange={e => setSettings({...settings, site_title: e.target.value})}
                placeholder="เช่น ContestOne.th"
                className="rounded-xl border-slate-200 h-11 font-bold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Settings */}
        <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-black font-headline">การติดต่อ</CardTitle>
            </div>
            <CardDescription className="font-bold">ตั้งค่าอีเมลสำหรับการติดต่อกลับ</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-black text-slate-700">อีเมลติดต่อ (Contact Email)</Label>
              <Input 
                value={settings.contact_email}
                onChange={e => setSettings({...settings, contact_email: e.target.value})}
                placeholder="เช่น support@contestone.th"
                className="rounded-xl border-slate-200 h-11 font-bold"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-black font-headline">การแจ้งเตือน</CardTitle>
            </div>
            <CardDescription className="font-bold">ตั้งค่าการแจ้งเตือนไปยังระบบภายนอก</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="font-black text-slate-700">LINE Notify Token</Label>
              <div className="relative">
                <Input 
                  type="password"
                  value={settings.line_notify_token}
                  onChange={e => setSettings({...settings, line_notify_token: e.target.value})}
                  placeholder="ใส่ Token จาก LINE Notify"
                  className="rounded-xl border-slate-200 h-11 font-bold pr-11"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-slate-300" />
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                Token นี้จะถูกใช้เพื่อส่งแจ้งเตือนเมื่อมีผู้ส่งข้อความติดต่อเข้ามาผ่านหน้า Contact <br />
                สามารถรับ Token ได้ที่ <a href="https://notify-bot.line.me/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">notify-bot.line.me</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-2xl font-black text-lg gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              บันทึกการตั้งค่า
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
