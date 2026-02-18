'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import AuthModal from './AuthModal';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  useEffect(() => {
    // TODO: Check Supabase session
    setLoading(false);
  }, [setUser, setLoading]);

  return (
    <>
      {children}
      <AuthModal />
    </>
  );
}
