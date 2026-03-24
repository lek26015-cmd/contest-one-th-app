'use client';

import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Award, Target, Users, Lightbulb, ArrowRight, ChevronRight, Zap, Mail, Phone, LifeBuoy, Ticket, MessageCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';



const teamMembers = [
  {
    name: 'Tawan Berkfah',
    role: 'Founder & CEO',
    imageUrl: 'https://picsum.photos/seed/tawan/400/400'
  },
  {
    name: 'Somchai Rakdee',
    role: 'CTO',
    imageUrl: 'https://picsum.photos/seed/somchai/400/400'
  },
  {
    name: 'Somsri Jaiyen',
    role: 'Lead Designer',
    imageUrl: 'https://picsum.photos/seed/somsri/400/400'
  },
  {
    name: 'Ananda Punya',
    role: 'Marketing Manager',
    imageUrl: 'https://picsum.photos/seed/ananda/400/400'
  }
];

const features = [
  {
    icon: Award,
    title: 'ศูนย์รวมการแข่งขัน',
    description: 'เรารวบรวมการแข่งขันทุกประเภท ทุกระดับ จากทั่วประเทศมาไว้ในที่เดียว เพื่อให้คุณไม่พลาดทุกโอกาส',
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    icon: Users,
    title: 'สำหรับทุกคน',
    description: 'ไม่ว่าคุณจะเป็นนักเรียน, นักศึกษา, หรือประชาชนทั่วไป ที่นี่มีพื้นที่สำหรับแสดงความสามารถของคุณเสมอ',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  {
    icon: Lightbulb,
    title: 'จุดประกายความคิดสร้างสรรค์',
    description: 'เรามุ่งมั่นที่จะเป็นพื้นที่สำหรับจุดประกายความคิดสร้างสรรค์และส่งเสริมการพัฒนาทักษะใหม่ๆ',
    color: 'text-amber-500',
    bg: 'bg-amber-50'
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F2F2F2] pb-20">
      <div className="container mx-auto px-4 pt-32 relative z-20">
        <div className="text-center mb-16">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none mb-6 px-4 py-1.5 text-xs font-black uppercase tracking-widest">
            รู้จักเรามากขึ้น
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight">
            พลิกโฉมวงการประกวด<br />ด้วย <span className="text-primary">ContestOne<sup className="text-2xl font-bold">th</sup></span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-500 font-bold">
            เราเชื่อว่าทุกคนมีศักยภาพที่รอวันเปล่งประกาย แพลตฟอร์มของเราเชื่อมต่อผู้คนเข้ากับโอกาสในการแข่งขันและแสดงความสามารถ
          </p>
        </div>
        {/* Mission Section */}
        <section className="mb-24">
          <div className="mx-auto max-w-5xl">
            <Card className="border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
              <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-auto overflow-hidden group">
                  <div className="absolute inset-0 bg-slate-900/20 z-10 group-hover:bg-transparent transition-colors duration-500" />
                  <Image
                    src="https://picsum.photos/seed/mission/800/800"
                    alt="Our Mission"
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-10 md:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                    <Target className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight">ภารกิจของเรา</h2>
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    เพื่อสร้างและสนับสนุน <strong>ชุมชนแห่งการแข่งขันที่ใหญ่ที่สุดในประเทศไทย</strong> ที่ซึ่งทุกคนสามารถค้นพบ, เข้าร่วม, และเติบโตจากประสบการณ์การแข่งขันได้อย่างเท่าเทียมและไร้ขีดจำกัด
                  </p>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                          <img src={`https://picsum.photos/seed/user${i}/100/100`} />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-slate-500">ผู้ใช้งานกว่า <span className="text-slate-900">10,000+</span> คน</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mb-24 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">ทำไมต้องเลือก ContestOne<sup className="text-lg">th</sup>?</h2>
            <p className="text-slate-500 font-bold max-w-2xl mx-auto">ฟีเจอร์และเครื่องมือที่ตอบโจทย์ทั้งผู้จัดงานและผู้เข้าแข่งขัน</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-none shadow-md hover:shadow-xl transition-shadow duration-300 bg-white group rounded-[2rem]">
                  <CardContent className="p-8">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:-translate-y-2", feature.bg, feature.color)}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900 mb-4">{feature.title}</CardTitle>
                    <CardDescription className="text-base text-slate-500 font-medium leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Team Section */}
        <section className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">ทีมงานของเรา</h2>
            <p className="text-slate-500 font-bold max-w-2xl mx-auto">
              กลุ่มคนที่มีความหลงใหลในการสร้างสรรค์และมุ่งมั่นที่จะมอบแพลตฟอร์มที่ดีที่สุดให้กับคุณ
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <Card key={member.name} className="border-none shadow-md bg-white text-center hover:shadow-xl transition-shadow rounded-[2rem] overflow-hidden group">
                <CardContent className="pt-10 pb-8 px-6">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-emerald-400 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"></div>
                    <Avatar className="w-full h-full border-4 border-white relative z-10 shadow-sm">
                      <AvatarImage src={member.imageUrl} alt={member.name} className="object-cover" />
                      <AvatarFallback className="bg-slate-100 text-slate-400 text-2xl font-black">{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="font-black text-lg text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        {/* Contact & Support Section */}
        <section className="mb-24 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">ต้องการความช่วยเหลือ?</h2>
            <p className="text-slate-500 font-bold max-w-2xl mx-auto">ติดต่อทีมงานของเราผ่านช่องทางต่างๆ หรือเปิด Ticket เพื่อแจ้งปัญหา</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Direct Contact */}
            <Card className="border-none shadow-md bg-white rounded-[2rem] overflow-hidden hover:shadow-xl transition-shadow">
              <CardContent className="p-8 md:p-12">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                  <Mail className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">ช่องทางการติดต่อ</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">อีเมล</p>
                      <p className="font-bold text-slate-900">support@contestone.th</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">โทรศัพท์</p>
                      <p className="font-bold text-slate-900">02-XXX-XXXX (จ.-ศ. 09:00 - 18:00)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#00B900]/10 rounded-full flex items-center justify-center text-[#00B900] flex-shrink-0">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">LINE Official</p>
                      <p className="font-bold text-slate-900">@contestone</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Support */}
            <Card className="border-none shadow-md bg-white rounded-[2rem] overflow-hidden hover:shadow-xl transition-shadow relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <CardContent className="p-8 md:p-12 relative z-10 flex flex-col h-full">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-8">
                  <Ticket className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">แจ้งปัญหาการใช้งาน (Ticket)</h3>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed flex-grow">
                  พบปัญหาการใช้งาน, ต้องการรายงานบั๊ก, หรือมีข้อเสนอแนะ? สามารถเปิด Ticket เพื่อให้ทีมเทคนิคของเราตรวจสอบและช่วยเหลือได้อย่างรวดเร็ว
                </p>
                <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-600">เวลาตอบกลับปัญหา</span>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-black text-[9px] uppercase tracking-widest">รวดเร็ว</Badge>
                  </div>
                  <p className="text-3xl font-black text-slate-900">&lt; 24 <span className="text-sm font-bold text-slate-500">ชั่วโมง</span></p>
                </div>
                <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl h-14 shadow-xl shadow-slate-200">
                  <Link href="/support/tickets/new">
                    <LifeBuoy className="mr-2 h-5 w-5" /> เปิด Ticket แจ้งปัญหา
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24 max-w-4xl mx-auto">
          <Card className="border-none shadow-2xl bg-slate-900 text-white overflow-hidden rounded-[2rem] relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
            <CardContent className="p-12 md:p-16 text-center relative z-10 flex flex-col items-center">
              <Zap className="h-12 w-12 text-yellow-400 mb-6" />
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">พร้อมที่จะเริ่มแข่งขันแล้วหรือยัง?</h2>
              <p className="text-slate-400 font-medium text-lg mb-10 max-w-xl">
                ค้นพบงานประกวดมากมายที่รอให้คุณไปแสดงความสามารถ สมัครสมาชิกวันนี้และเริ่มต้นการเดินทางของคุณ
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl h-14 px-8 shadow-xl shadow-primary/20">
                  <Link href="/login">
                    เริ่มต้นใช้งานฟรี <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl h-14 px-8">
                  <Link href="/">
                    ดูงานแข่งขันทั้งหมด
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
