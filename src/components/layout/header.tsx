
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSearch } from '@/providers/search-provider';
import { Search, Trophy, ShieldCheck, PlusCircle, Menu, User, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showStickySearch, setShowStickySearch] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { searchTerm, setSearchTerm, handleSearch } = useSearch();

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky search after 400px of scroll
      if (window.scrollY > 400) {
        setShowStickySearch(true);
      } else {
        setShowStickySearch(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname.startsWith('/admin')) {
    return null; // Don't render the main header on admin pages
  }

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  }

  const UserMenu = () => {
    if (isUserLoading) {
      return <div className="h-10 w-24 rounded-md animate-pulse bg-slate-100" />;
    }

    if (!user) {
      return (
        <Button asChild className="bg-primary text-white hover:bg-primary/90 font-bold px-6 rounded-lg shadow-sm border-none transition-all">
            <Link href="/login">เข้าสู่ระบบ / สมัครสมาชิก</Link>
        </Button>
      )
    }

    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 border border-slate-200">
               <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
              <AvatarFallback>
                {user.isAnonymous 
                    ? 'A' 
                    : user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'
                }
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.isAnonymous ? 'Anonymous User' : user.displayName || user.email}
              </p>
               {!user.isAnonymous && user.email && <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserCircle className="mr-2 h-4 w-4" />
              <span>โปรไฟล์</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/admin">
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>Admin</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/dashboard/organizer">
                <Trophy className="mr-2 h-4 w-4" />
                <span>Organizer Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/competitions/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>สร้างการแข่งขัน</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>ออกจากระบบ</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white text-slate-900 shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <Image 
            src="/logo-contest-one-th-main.png" 
            alt="ContestOne" 
            width={180} 
            height={40} 
            className="h-9 md:h-12 w-auto max-w-[130px] md:max-w-none object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Sticky Search Bar - Only shows when scrolled, Hidden on Mobile */}
        <div className={cn(
          "hidden md:flex flex-grow max-w-md mx-8 transition-all duration-300 transform",
          showStickySearch ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        )}>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input 
              type="text"
              placeholder="ค้นหาการแข่งขัน..."
              className="w-full pl-10 pr-4 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-primary transition-all rounded-xl shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" asChild className="text-slate-600 font-bold hover:text-primary hover:bg-slate-50 px-4">
            <Link href="/">หน้าหลัก</Link>
          </Button>
          <Button variant="ghost" asChild className="text-slate-600 font-bold hover:text-primary hover:bg-slate-50 px-4">
            <Link href="/blog">บล็อก</Link>
          </Button>
          <Button variant="ghost" asChild className="text-slate-600 font-bold hover:text-primary hover:bg-slate-50 px-4">
            <Link href="/pricing">ราคา</Link>
          </Button>
          <Button variant="ghost" asChild className="text-slate-600 font-bold hover:text-primary hover:bg-slate-50 px-4">
            <Link href="/about">เกี่ยวกับเรา</Link>
          </Button>
          <Button variant="ghost" asChild className="text-primary font-black hover:text-primary hover:bg-primary/5 px-4">
            <Link href="/dashboard/organizer">สำหรับผู้จัดงาน</Link>
          </Button>
          
          <div className="w-[1px] h-6 bg-slate-200 mx-2" />
          
          <div className="flex items-center gap-3">
            <UserMenu />
          </div>

          <Select defaultValue="th">
            <SelectTrigger className="w-[120px] bg-slate-50 border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors focus:ring-0 shadow-none">
              <SelectValue placeholder="ภาษา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="th">ภาษาไทย</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
           <UserMenu />
           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-900">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                    <SheetTitle className="text-left font-black text-xl">เมนู</SheetTitle>
                </SheetHeader>
              <div className="py-6">
                 <div className="flex flex-col space-y-2">
                    <SheetClose asChild>
                      <Link href="/" className="px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50">หน้าหลัก</Link>
                    </SheetClose>
                     <SheetClose asChild>
                      <Link href="/blog" className="px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50">บล็อก</Link>
                    </SheetClose>
                     <SheetClose asChild>
                      <Link href="/pricing" className="px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50">ราคา</Link>
                    </SheetClose>
                     <SheetClose asChild>
                      <Link href="/about" className="px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50">เกี่ยวกับเรา</Link>
                    </SheetClose>
                    <Separator className="my-2" />
                    <SheetClose asChild>
                      <Link href="/dashboard/organizer" className="px-4 py-3 rounded-xl font-black text-primary hover:bg-primary/5">สำหรับผู้จัดงาน</Link>
                    </SheetClose>
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
