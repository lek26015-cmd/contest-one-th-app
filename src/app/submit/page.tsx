'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated and redirects to the new admin competitions page.
export default function SubmitPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/competitions/new');
  }, [router]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="text-2xl font-bold">Redirecting...</h1>
      <p className="mt-4">This page has moved. You are being redirected to the new competition submission page.</p>
    </div>
  );
}
