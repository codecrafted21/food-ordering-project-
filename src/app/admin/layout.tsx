'use client';

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useAuth();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      router.push('/admin/login');
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Authenticating...</p>
      </div>
    );
  }

  // If not loading and no user, redirect to login
  if (!user) {
    // In a real app, you might want a more robust way to handle this,
    // but a client-side redirect is fine for this case.
    if (typeof window !== 'undefined') {
       router.push('/admin/login');
    }
    return (
       <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4">Redirecting to login...</p>
      </div>
    );
  }


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <Logo />
          </div>
          <div className="flex-1">
            <AdminSidebar />
          </div>
          <div className="mt-auto p-4">
             <Button variant="outline" className="w-full" onClick={handleLogout}>
              Exit Dashboard
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 lg:px-6">
          <div className="w-full flex-1">
            <h1 className="font-semibold text-lg">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground hidden md:block">
            Logged in as <strong>{user.email}</strong>
          </p>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}