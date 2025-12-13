'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_KEY = 'cookie_consent';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // useEffect ensures this runs only on the client, avoiding hydration errors.
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    setIsVisible(false);
  };

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-500 ease-in-out",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
    >
        <div className="container mx-auto p-4">
            <div className="bg-secondary text-secondary-foreground p-6 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <Cookie className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="font-semibold">เว็บไซต์นี้ใช้คุกกี้</h3>
                        <p className="text-sm text-secondary-foreground/80">
                        เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์ของคุณ, วิเคราะห์การเข้าชม, และนำเสนอเนื้อหาที่เหมาะสม ดูเพิ่มเติมได้ที่{' '}
                        <Link href="/privacy" className="underline hover:text-primary">
                            นโยบายความเป็นส่วนตัว
                        </Link>
                        ของเรา
                        </p>
                    </div>
                </div>
                <Button onClick={handleAccept} className="w-full sm:w-auto flex-shrink-0">
                    ยอมรับ
                </Button>
            </div>
      </div>
    </div>
  );
}
