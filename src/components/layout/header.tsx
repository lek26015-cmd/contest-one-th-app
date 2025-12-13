
'use client';
import Link from 'next/link';
import { Trophy, ShieldCheck, PlusCircle, Menu, User, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
import { useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const isMobile = useIsMobile();

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
      return <div className="h-10 w-24 rounded-md animate-pulse bg-primary-foreground/10" />;
    }

    if (!user) {
      if (isMobile) {
        return (
            <Button asChild variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                <Link href="/login"><User /></Link>
            </Button>
        )
      }
      return (
        <Button asChild>
            <Link href="/login">เข้าสู่ระบบ / สมัครสมาชิก</Link>
        </Button>
      )
    }

    return (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
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
    <header className="sticky top-0 z-20 w-full border-b bg-primary text-primary-foreground">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold">
          <Trophy className="h-8 w-8" />
          <span className="font-headline">ContestOne<sup>th</sup></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-2 sm:gap-4 md:flex">
          <Button variant="ghost" asChild className="hover:bg-primary-foreground/10">
            <Link href="/">หน้าหลัก</Link>
          </Button>
          <Button variant="ghost" asChild className="hover:bg-primary-foreground/10">
            <Link href="/blog">บล็อก</Link>
          </Button>
          <Button variant="ghost" asChild className="hover:bg-primary-foreground/10">
            <Link href="/about">เกี่ยวกับเรา</Link>
          </Button>
          <UserMenu />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
           <UserMenu />
           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                    <SheetTitle>เมนู</SheetTitle>
                </SheetHeader>
              <div className="p-4">
                 <div className="flex flex-col space-y-4">
                    <SheetClose asChild>
                      <Link href="/" className="text-lg">หน้าหลัก</Link>
                    </SheetClose>
                     <SheetClose asChild>
                      <Link href="/blog" className="text-lg">บล็อก</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/about" className="text-lg">เกี่ยวกับเรา</Link>
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
