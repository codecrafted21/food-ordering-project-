'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import AdminPageClient from "@/components/admin/admin-page-client";
import { Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Authenticating...</p>
      </div>
    );
  }

  if (user) {
    return (
       <>
        <header className="flex h-16 items-center border-b bg-card px-4 lg:px-6 sticky top-0 z-30">
          <h1 className="flex-1 text-lg font-semibold">Live Orders</h1>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
           <AdminPageClient />
        </div>
      </>
    );
  }
  
  return null;
}
