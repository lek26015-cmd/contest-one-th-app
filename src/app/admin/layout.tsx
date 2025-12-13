'use client';

import AdminSidebar from '@/components/layout/admin-sidebar';
import { useUser } from '@/firebase';
import { ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult();
          setIsAdmin(!!tokenResult.claims.admin);

          // If the user isn't an admin according to claims, try to make them one if they are the first user.
          if (!tokenResult.claims.admin) {
              const functions = getFunctions();
              const makeFirstAdmin = httpsCallable(functions, 'makeFirstAdmin');
              const result = await makeFirstAdmin();
              const data = result.data as { isAdmin: boolean };
              if (data.isAdmin) {
                  setIsAdmin(true);
                  // Force refresh the token to get the new claim.
                  await user.getIdToken(true);
              }
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      }
      setIsCheckingAdmin(false);
    };

    if (!isUserLoading) {
      checkAdminStatus();
    }
  }, [user, isUserLoading]);

  if (isUserLoading || isCheckingAdmin) {
    return (
      <div className="container mx-auto py-12 text-center">
        <p>กำลังตรวจสอบสิทธิ์...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="flex flex-col items-center gap-4 text-destructive">
          <ShieldAlert className="h-16 w-16" />
          <h1 className="text-3xl font-bold">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="text-lg text-muted-foreground">
            ขออภัย คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
