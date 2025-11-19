'use client';

import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
      // After signing out, onAuthStateChanged will trigger and the
      // protected layout will redirect to the login page.
      router.push('/admin/login');
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleLogout}>
      Exit Dashboard
    </Button>
  );
}
