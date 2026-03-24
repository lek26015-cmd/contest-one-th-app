'use client';
import { AuthForm } from '@/components/auth-form';
import { useUser } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function LoginPageContent() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!isUserLoading && user) {
      router.replace(redirect);
    }
  }, [user, isUserLoading, router, redirect]);

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full overflow-hidden font-body">
      {/* Left Side: Branding & Illustration (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        {/* Full-bleed Illustration */}
        <div className="absolute inset-0">
          <img 
            src="/login-illustration.png" 
            alt="ContestOne Branding" 
            className="w-full h-full object-cover opacity-80"
          />
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-lg text-center space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000 p-12">
          <div className="space-y-4">
             <h2 className="text-5xl font-black text-white tracking-tight font-headline leading-tight drop-shadow-2xl">
               ปลดล็อกศักยภาพ <br /> <span className="text-primary italic">ผ่านการแข่งขัน</span>
             </h2>
             <p className="text-slate-200 font-bold text-xl leading-relaxed drop-shadow-lg">
               ContestOne ช่วยให้คุณเข้าถึงงานประกวดระดับสากล <br /> และจัดการงานแข่งอย่างเป็นมืออาชีพในที่เดียว
             </p>
          </div>
          <div className="pt-8 opacity-50">
             <img src="/logo_3_th.png" alt="ContestOne" className="h-8 mx-auto brightness-0 invert" />
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20 bg-white relative">
        {/* Decorative background for mobile */}
        <div className="lg:hidden absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />
        
        <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <div className="flex flex-col items-center lg:items-start space-y-2 mb-8">
            <div className="lg:hidden mb-12">
               <img src="/logo_3_th.png" alt="ContestOne" className="h-10" />
            </div>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
