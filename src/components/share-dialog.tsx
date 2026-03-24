'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Share2, 
  Copy, 
  Check, 
  Facebook, 
  Twitter, 
  MessageCircle, 
  Code2, 
  ExternalLink 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShareDialogProps {
  url: string;
  title: string;
  competitionId: string;
  trigger?: React.ReactNode;
}

export function ShareDialog({ url, title, competitionId, trigger }: ShareDialogProps) {
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const embedUrl = typeof window !== 'undefined' ? `${window.location.origin}/competitions/${competitionId}/embed` : '';
  const embedCode = `<iframe src="${embedUrl}" width="100%" height="500" frameborder="0" style="border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);"></iframe>`;

  const copyToClipboard = async (text: string, isEmbed: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isEmbed) {
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 2000);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
      toast({
        title: "คัดลอกสำเร็จ",
        description: isEmbed ? "คัดลอกโค้ดสำหรับฝังเว็บไซต์แล้ว" : "คัดลอกลิงก์เรียบร้อยแล้ว",
      });
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกได้",
        variant: "destructive",
      });
    }
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: 'bg-[#1877F2] hover:bg-[#1877F2]/90',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-[#1DA1F2] hover:bg-[#1DA1F2]/90',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'LINE',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-[#00BC00] hover:bg-[#00BC00]/90',
      href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}`
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 border-slate-200 font-bold hover:bg-slate-50 rounded-xl">
            <Share2 className="w-4 h-4" />
            แชร์
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl p-8">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-black font-headline tracking-tight">แชร์การแข่งขัน</DialogTitle>
          <DialogDescription className="font-bold text-slate-400">
            เลือกช่องทางที่คุณต้องการแชร์หรือนำไปฝังในเว็บไซต์
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-4">
          {/* Social Icons */}
          <div className="flex justify-center gap-4">
            {socialPlatforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex flex-col items-center gap-2 group transition-all",
                  "p-4 rounded-2xl bg-slate-50 hover:scale-105"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-all",
                  platform.color
                )}>
                  {platform.icon}
                </div>
                <span className="text-xs font-black text-slate-500 group-hover:text-slate-900">
                  {platform.name}
                </span>
              </a>
            ))}
          </div>

          <Separator className="bg-slate-50" />

          {/* Direct Link */}
          <div className="space-y-3">
            <Label className="font-black text-slate-900 ml-1">ลิงก์การแข่งขัน</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="h-12 bg-slate-50 border-none rounded-xl px-4 font-bold text-slate-600 focus:bg-white transition-all shadow-inner"
              />
              <Button
                onClick={() => copyToClipboard(shareUrl, false)}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-white shrink-0 shadow-lg shadow-primary/20"
              >
                {copiedLink ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <Label className="font-black text-slate-900">ฝังโค้ดลงเว็บ (Embed)</Label>
              <Button variant="link" className="h-auto p-0 text-primary font-black text-xs gap-1" asChild>
                <a href={embedUrl} target="_blank" rel="noopener noreferrer">
                  ดูตัวอย่าง <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
            <div className="relative">
              <textarea
                readOnly
                value={embedCode}
                className="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 font-mono text-[10px] text-slate-500 resize-none focus:outline-none shadow-inner"
              />
              <Button
                size="sm"
                onClick={() => copyToClipboard(embedCode, true)}
                className={cn(
                  "absolute bottom-3 right-3 rounded-lg font-black text-[10px] gap-1.5 h-8 px-3",
                  copiedEmbed ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-900 hover:bg-slate-800"
                )}
              >
                {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Code2 className="w-3.5 h-3.5" />}
                {copiedEmbed ? 'คัดลอกแล้ว' : 'คัดลอกโค้ด'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Separator = ({ className }: { className?: string }) => (
  <div className={cn("h-px w-full", className)} />
);
