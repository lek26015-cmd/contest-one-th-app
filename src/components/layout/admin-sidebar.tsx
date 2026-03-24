
'use client';

import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Newspaper, 
  Image, 
  Ticket, 
  Settings,
  Database,
  Briefcase,
  FileText,
  BarChart2,
  Mail,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
    { label: 'แดชบอร์ด', href: '/admin', icon: LayoutDashboard },
    { label: 'จัดการการแข่งขัน', href: '/admin/competitions', icon: Trophy },
    { label: 'จัดการผู้ใช้งาน', href: '/admin/users', icon: Users },
    { label: 'จัดการบทความ', href: '/admin/blog', icon: Newspaper },
    { label: 'จัดการโฆษณาหน้าแรก', href: '/admin/hero-ads', icon: Image },
    { label: 'จัดการการเงิน', href: '/admin/finance', icon: Wallet },
    { label: 'รายการแจ้งปัญหา', href: '/admin/tickets', icon: Ticket },
    { label: 'ระบบรับส่งอีเมล', href: '/admin/messages', icon: Mail },
    { label: 'ตั้งค่าระบบ', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 flex-shrink-0 border-r bg-background hidden md:block">
            <div className="flex h-full flex-col">
                <div className="flex h-20 items-center border-b px-6">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                        <Trophy className="h-7 w-7 text-primary" />
                        <span className="font-headline">ContestOne<sup>th</sup></span>
                    </Link>
                </div>
                <nav className="flex-grow p-4">
                    <TooltipProvider>
                        <ul className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.href}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    asChild
                                                    variant={isActive ? 'secondary' : 'ghost'}
                                                    className="w-full justify-start text-base"
                                                >
                                                    <Link href={item.href}>
                                                        <item.icon className="mr-3 h-5 w-5" />
                                                        {item.label}
                                                    </Link>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="right" align="center">
                                                {item.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    </li>
                                );
                            })}
                        </ul>
                    </TooltipProvider>
                </nav>
            </div>
        </aside>
    );
}
