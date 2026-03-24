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
    <div className="container flex min-h-[80vh] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <AuthForm />
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
