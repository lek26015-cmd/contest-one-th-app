
import { Trophy, Phone, Download, Youtube, Facebook, Twitter, Instagram } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm">
        {children}
    </Link>
);

const FooterHeader = ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-semibold text-primary-foreground mb-4 text-base tracking-wider uppercase">{children}</h3>
);

const SocialLink = ({ href, icon: Icon }: { href: string, icon: React.ElementType }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
        <Icon className="h-6 w-6" />
    </a>
)

export default function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-primary text-primary-foreground mt-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Column 1: Brand and Info */}
                    <div className="md:col-span-4 space-y-6">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold w-fit">
                            <Trophy className="h-8 w-8" />
                            <span className="font-headline">ContestOne<sup>th</sup></span>
                        </Link>
                        <div className="text-primary-foreground/80 text-sm space-y-2">
                            <p>แพลตฟอร์มประกวดอันดับหนึ่งของประเทศไทย ที่จะช่วยให้คุณค้นพบโอกาสใหม่ๆ และท้าทายความสามารถของคุณ</p>
                             <div className="flex items-center gap-3 pt-2">
                                <Phone className="h-4 w-4 flex-shrink-0" />
                                <span>02-853-6999</span>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <SocialLink href="https://youtube.com" icon={Youtube} />
                            <SocialLink href="https://facebook.com" icon={Facebook} />
                            <SocialLink href="https://twitter.com" icon={Twitter} />
                            <SocialLink href="https://instagram.com" icon={Instagram} />
                        </div>
                       
                    </div>

                    {/* Column 2: For Seekers */}
                    <div className="md:col-span-2 md:col-start-6">
                        <FooterHeader>สำหรับผู้เข้าแข่งขัน</FooterHeader>
                        <ul className="space-y-3">
                            <li><FooterLink href="/">ค้นหาการแข่งขัน</FooterLink></li>
                            <li><FooterLink href="/profile">โปรไฟล์ของฉัน</FooterLink></li>
                            <li><FooterLink href="/profile">การแข่งขันที่บันทึกไว้</FooterLink></li>
                        </ul>
                    </div>

                    {/* Column 3: For Organizers */}
                    <div className="md:col-span-2">
                        <FooterHeader>สำหรับผู้จัด</FooterHeader>
                        <ul className="space-y-3">
                            <li><FooterLink href="/admin">ภาพรวมผู้จัด</FooterLink></li>
                            <li><FooterLink href="/admin/competitions/new">สร้างการแข่งขัน</FooterLink></li>
                            <li><FooterLink href="/#">ราคา</FooterLink></li>
                        </ul>
                    </div>

                     {/* Column 4: About & Terms */}
                    <div className="md:col-span-2">
                        <FooterHeader>เกี่ยวกับเรา</FooterHeader>
                        <ul className="space-y-3">
                            <li><FooterLink href="/about">เกี่ยวกับ ContestOne<sup>th</sup></FooterLink></li>
                            <li><FooterLink href="/blog">บล็อก</FooterLink></li>
                            <li><FooterLink href="/faq">คำถามที่พบบ่อย</FooterLink></li>
                            <li><FooterLink href="/contact">ติดต่อเรา</FooterLink></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="bg-black/20">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-primary-foreground/60 py-4 gap-4">
                    <p>&copy; {currentYear} ContestOne<sup>th</sup>, Inc. All Rights Reserved.</p>
                     <div className="flex gap-4">
                        <FooterLink href="/terms">เงื่อนไขการให้บริการ</FooterLink>
                        <FooterLink href="/privacy">นโยบายความเป็นส่วนตัว</FooterLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}
