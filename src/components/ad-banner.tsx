'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

type AdBannerProps = {
  'data-ad-client'?: string;
  'data-ad-slot': string;
  'data-ad-format'?: string;
  'data-full-width-responsive'?: string;
  style?: React.CSSProperties;
  className?: string;
};

const AdBanner = ({ className, ...props }: AdBannerProps) => {
  const pathname = usePathname();

  useEffect(() => {
    // Only run the script if the ad client and slot are provided
    if (props['data-ad-client'] && props['data-ad-slot']) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [pathname, props['data-ad-slot']]); // Re-run when path or slot changes

  // If the ad client or slot is missing, show a placeholder
  if (!props['data-ad-client'] || !props['data-ad-slot']) {
    return (
       <div className={cn("flex items-center justify-center bg-muted/40 border-2 border-dashed rounded-lg text-muted-foreground min-h-[100px]", className)}>
           <div className="flex flex-col items-center gap-2">
                <Megaphone className="h-8 w-8" />
                <span className="text-sm font-semibold">พื้นที่โฆษณา</span>
            </div>
        </div>
    );
  }

  // Render the actual ad unit
  // Add a key to the <ins> element to ensure React treats it as a new element when the slot or path changes
  return (
    <ins
      key={`${pathname}_${props['data-ad-slot']}`}
      className={cn("adsbygoogle", className)}
      style={{ display: 'block' }}
      {...props}
    />
  );
};

export default AdBanner;
