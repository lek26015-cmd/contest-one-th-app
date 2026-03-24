'use client';
import CompetitionForm from '@/components/competition-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewCompetitionPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
          <Button variant="ghost" asChild>
          <Link href="/admin/competitions" className="flex items-center text-sm text-muted-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าจัดการแข่งขัน
          </Link>
          </Button>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary font-headline">
          สร้างการแข่งขันใหม่
        </h1>
        <p className="mt-4 text-lg text-foreground/80">
          กรอกแบบฟอร์มด้านล่างเพื่อเพิ่มการแข่งขันใหม่เข้าระบบ
        </p>
      </div>
      <CompetitionForm />
    </div>
  );
}
