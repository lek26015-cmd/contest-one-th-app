
'use client';

import { BarChart2, Briefcase, FileText, Settings, Trophy, Users } from 'lucide-react';
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
  { href: '/admin', icon: BarChart2, label: 'ภาพรวม' },
  { href: '/admin/competitions', icon: Briefcase, label: 'จัดการแข่งขัน' },
  { href: '/admin/blog', icon: FileText, label: 'จัดการบทความ' },
  { href: '/admin/users', icon: Users, label: 'จัดการผู้ใช้' },
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
