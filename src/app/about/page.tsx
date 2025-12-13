
'use client';

import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, Target, Users, Lightbulb } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const teamMembers = [
  { name: 'สมชาย ใจดี', role: 'ผู้ก่อตั้ง และ CEO', imageUrl: 'https://picsum.photos/seed/team1/200/200' },
  { name: 'สมหญิง มุ่งมั่น', role: 'ประธานเจ้าหน้าที่ฝ่ายเทคโนโลยี (CTO)', imageUrl: 'https://picsum.photos/seed/team2/200/200' },
  { name: 'วิชัย มีมานะ', role: 'หัวหน้าฝ่ายการตลาด', imageUrl: 'https://picsum.photos/seed/team3/200/200' },
  { name: 'มานี รักเขียน', role: 'ผู้จัดการฝ่ายเนื้อหา', imageUrl: 'https://picsum.photos/seed/team4/200/200' },
];

const features = [
  {
    icon: <Award className="h-10 w-10 text-primary" />,
    title: 'ศูนย์รวมการแข่งขัน',
    description: 'เรารวบรวมการแข่งขันทุกประเภท ทุกระดับ จากทั่วประเทศมาไว้ในที่เดียว เพื่อให้คุณไม่พลาดทุกโอกาส',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'สำหรับทุกคน',
    description: 'ไม่ว่าคุณจะเป็นนักเรียน, นักศึกษา, หรือประชาชนทั่วไป ที่นี่มีพื้นที่สำหรับแสดงความสามารถของคุณเสมอ',
  },
  {
    icon: <Lightbulb className="h-10 w-10 text-primary" />,
    title: 'จุดประกายความคิดสร้างสรรค์',
    description: 'เรามุ่งมั่นที่จะเป็นพื้นที่สำหรับจุดประกายความคิดสร้างสรรค์และส่งเสริมการพัฒนาทักษะใหม่ๆ',
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline sm:text-5xl">
          เกี่ยวกับ ContestOne<sup>th</sup>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
          เราเชื่อว่าทุกคนมีศักยภาพที่รอวันเปล่งประกาย ContestOne<sup>th</sup> คือแพลตฟอร์มที่เชื่อมต่อผู้คนเข้ากับโอกาสในการแข่งขันและแสดงความสามารถ
        </p>
      </section>

      {/* Mission Section */}
      <section className="mb-16">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-lg overflow-hidden aspect-video mb-8">
            <Image
              src="https://picsum.photos/seed/mission/1200/600"
              alt="Our Mission"
              fill
              className="object-cover"
              data-ai-hint="team working office"
            />
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white p-8">
                    <Target className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold font-headline mb-2">ภารกิจของเรา</h2>
                    <p className="text-lg text-white/90">
                        เพื่อสร้างและสนับสนุนชุมชนแห่งการแข่งขันที่ใหญ่ที่สุดในประเทศไทย ที่ซึ่งทุกคนสามารถค้นพบ, เข้าร่วม, และเติบโตจากประสบการณ์การแข่งขันได้อย่างเท่าเทียมและไร้ขีดจำกัด
                    </p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold font-headline text-center mb-8 text-primary">ทำไมต้องเลือก ContestOne<sup>th</sup>?</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <CardHeader className="p-0 mb-2">
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardDescription>{feature.description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section>
        <h2 className="text-3xl font-bold font-headline text-center mb-8 text-primary">ทีมงานของเรา</h2>
        <p className="text-center max-w-xl mx-auto text-foreground/80 mb-12">
            เราคือกลุ่มคนที่มีความหลงใหลในการสร้างสรรค์และมุ่งมั่นที่จะมอบแพลตฟอร์มที่ดีที่สุดให้กับทุกคน
        </p>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4 border-4 border-primary/20">
                <AvatarImage src={member.imageUrl} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
