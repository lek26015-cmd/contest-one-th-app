'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Trophy, Calendar, CheckCircle2, MessageSquare, ArrowRight, Star, Award, Gavel } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SectionProps {
  content: any;
  settings?: any;
  isEditing?: boolean;
}

export const HeroSection: React.FC<SectionProps> = ({ content, settings }) => {
  const { title, subtitle, ctaText, ctaLink, imageUrl, backgroundType = 'gradient' } = content;
  const paddingClass = settings?.padding === 'large' ? 'py-32' : settings?.padding === 'small' ? 'py-12' : 'py-20';
  
  return (
    <section className={cn(
      "relative overflow-hidden flex items-center min-h-[60vh]",
      paddingClass,
      settings?.backgroundColor || "bg-slate-900"
    )}>
      {backgroundType === 'image' && imageUrl && (
        <div className="absolute inset-0 z-0">
          <Image src={imageUrl} alt="Hero Background" fill className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>
      )}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
          {title || "หัวข้อที่น่าสนใจของคุณ"}
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto font-medium">
          {subtitle || "คำอธิบายที่ช่วยดึงดูดความสนใจและสร้างความน่าเชื่อถือให้กับงานของคุณ"}
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="lp-btn bg-primary hover:bg-primary/90 text-white font-bold px-8 py-6 rounded-xl text-lg shadow-xl" asChild>
            <Link href={ctaLink || "#"}>
              {ctaText || "ปุ่มดำเนินการ"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export const AboutSection: React.FC<SectionProps> = ({ content, settings }) => {
  const { title, description, features } = content;
  const paddingClass = settings?.padding === 'large' ? 'py-24' : settings?.padding === 'small' ? 'py-12' : 'py-16';

  return (
    <section className={cn(paddingClass, settings?.backgroundColor || "bg-white")}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4 font-bold border-primary text-primary px-4 py-1">ABOUT THE EVENT</Badge>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">{title || "เกี่ยวกับงานนี้"}</h2>
          <p className="text-lg text-slate-600 font-medium leading-relaxed">{description || "รายละเอียดเกี่ยวกับงานแช่งชันของคุณ"}</p>
        </div>
        
        {features && features.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature: any, idx: number) => (
              <div key={idx} className="lp-card p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <Star className="h-6 w-6 fill-primary/20" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const PrizesSection: React.FC<SectionProps> = ({ content, settings }) => {
  const { prizes, totalPrize, totalPrizeText } = content;
  const paddingClass = settings?.padding === 'large' ? 'py-24' : settings?.padding === 'small' ? 'py-12' : 'py-16';

  return (
    <section className={cn(paddingClass, settings?.backgroundColor || "bg-slate-50")}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">รางวัลการแข่งขัน</h2>
          {totalPrizeText ? (
             <div className="text-2xl font-black text-primary max-w-2xl mx-auto">{totalPrizeText}</div>
          ) : totalPrize && (
             <div className="text-2xl font-black text-primary">รวมกว่า {totalPrize.toLocaleString()} บาท</div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {prizes?.map((prize: any, idx: number) => (
            <div key={idx} className="lp-card bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-6">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">{prize.rank}</h3>
              <p className="text-primary font-black text-xl md:text-2xl mb-2 break-words max-w-full">{prize.amount}</p>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">{prize.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Renderer: React.FC<{ sections: any[], theme?: any, selectedId?: string | null }> = ({ sections, theme, selectedId }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (selectedId && containerRef.current) {
      const element = containerRef.current.querySelector(`[data-section-id="${selectedId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedId]);

  return (
    <div 
      ref={containerRef}
      className="w-full"
      style={{ 
        '--primary': theme?.primaryColor || '#3b82f6',
        '--radius': theme?.borderRadius || '0.75rem',
        fontFamily: theme?.fontFamily || 'inherit'
      } as any}
    >
      <style jsx global>{`
        .lp-btn { border-radius: var(--radius); }
        .lp-card { border-radius: var(--radius); }
      `}</style>
      {sections.map((section) => {
        const sectionProps = { key: section.id, content: section.content, settings: section.settings };
        return (
          <div key={section.id} data-section-id={section.id} className={cn(selectedId === section.id && "ring-4 ring-primary/20 relative z-20")}>
            {(() => {
              switch (section.type) {
                case 'hero': return <HeroSection {...sectionProps} />;
                case 'about': return <AboutSection {...sectionProps} />;
                case 'prizes': return <PrizesSection {...sectionProps} />;
                default: return null;
              }
            })()}
          </div>
        );
      })}
    </div>
  );
};
