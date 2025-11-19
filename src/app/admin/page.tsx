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
    // If loading is finished and there is no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [isUserLoading, user, router]);

  // While loading, show a loader.
  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Authenticating...</p>
      </div>
    );
  }

  // If there's a user, render the dashboard content.
  if (user) {
    return (
      <div>
        <h1 className="text-3xl font-headline font-bold mb-6">Live Orders</h1>
        <AdminPageClient />
      </div>
    );
  }
  
  // If no user and not loading, this will be briefly rendered before the redirect happens.
  return null;
}
