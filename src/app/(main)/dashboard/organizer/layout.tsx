'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  BarChart3, 
  Settings, 
  CreditCard,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItemProps {
  href: string;
  icon: any;
  title: string;
  active: boolean;
}

const SidebarItem = ({ href, icon: Icon, title, active }: SidebarItemProps) => (
  <Link 
    href={href}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary text-white shadow-lg shadow-primary/20" 
        : "text-slate-500 hover:bg-slate-50 hover:text-primary"
    )}
  >
    <Icon className={cn("h-5 w-5", active ? "text-white" : "group-hover:text-primary")} />
    <span className="font-bold text-sm">{title}</span>
  </Link>
);

export default function OrganizerDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { title: 'ภาพรวม', href: '/dashboard/organizer', icon: LayoutDashboard },
    { title: 'งานแข่งของฉัน', href: '/dashboard/organizer/competitions', icon: Trophy },
    { title: 'ผู้สมัคร', href: '/dashboard/organizer/participants', icon: Users },
    { title: 'สถิติ', href: '/dashboard/organizer/analytics', icon: BarChart3 },
    { title: 'แพ็กเกจ', href: '/dashboard/organizer/plans', icon: CreditCard },
    { title: 'ตั้งค่า', href: '/dashboard/organizer/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-100 flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xl">C</span>
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">ContestOne</span>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              active={pathname === item.href}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Current Plan</p>
            <h4 className="font-bold text-sm mb-3 font-headline italic uppercase tracking-tighter">Starter (ฟรี)</h4>
            <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-[11px] font-black h-8 shadow-md shadow-blue-900/40 border-none transition-all">
              <Link href="/pricing">UPGRADE TO PRO</Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 h-16 px-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="font-black text-lg">ContestOne</div>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.photoURL || ''} />
          <AvatarFallback>{user?.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <motion.aside 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            className="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col"
          >
            <div className="p-6 flex items-center justify-between border-b border-slate-50">
              <div className="font-black text-xl">ContestOne</div>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="p-4 space-y-2 flex-grow">
              {menuItems.map((item) => (
                <SidebarItem 
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  title={item.title}
                  active={pathname === item.href}
                />
              ))}
            </nav>
          </motion.aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {/* Desktop Topbar */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-100 items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
            {menuItems.find(i => i.href === pathname)?.title || 'Organizer Dashboard'}
          </h2>
          
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 relative hover:bg-slate-50 transition-colors">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-2xl border-slate-100 shadow-2xl overflow-hidden" align="end" sideOffset={8}>
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-xs text-slate-900 uppercase tracking-widest">การแจ้งเตือน</h3>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest px-2">1 ใหม่</Badge>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                   <div className="p-4 space-y-1">
                      <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 transition-colors hover:bg-primary/10 cursor-pointer group">
                        <div className="flex gap-3">
                           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-primary/20 shadow-sm flex-shrink-0">
                              <Trophy className="h-5 w-5 text-primary" />
                           </div>
                           <div className="flex-grow space-y-1">
                              <p className="text-xs font-bold text-slate-900 leading-tight">ยินดีด้วย! มีผู้สมัครใหม่ 5 คนในงานแข่งของคุณ</p>
                              <p className="text-[10px] text-slate-400 font-medium">เมื่อ 5 นาทีที่แล้ว</p>
                           </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group opacity-60">
                        <div className="flex gap-3">
                           <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-100 shadow-sm flex-shrink-0">
                              <Settings className="h-5 w-5 text-slate-400" />
                           </div>
                           <div className="flex-grow space-y-1">
                              <p className="text-xs font-bold text-slate-900 leading-tight">โปรไฟล์ของคุณได้รับเครื่องหมายยืนยันแล้ว</p>
                              <p className="text-[10px] text-slate-400 font-medium">เมื่อ 2 ชั่วโมงที่แล้ว</p>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                   <Button variant="ghost" className="w-full h-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg">
                      ล้างการแจ้งเตือนทั้งหมด
                   </Button>
                </div>
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right flex flex-col">
                <span className="text-xs font-black text-slate-900 capitalize">{user?.displayName || user?.email?.split('@')[0]}</span>
                <span className="text-[10px] font-bold text-slate-400">Organizer</span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-slate-50">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {user?.email?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 pt-24 lg:pt-8 flex-grow">
          {children}
        </div>
      </main>
    </div>
  );
}
