import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const [state, setState] = useState<'loading' | 'granted' | 'denied'>('loading');

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        if (!cancelled) setState('denied');
        return;
      }

      const userId = session.user.id;

      // Check admin role first (bypass)
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const isAdmin = roleData?.some(r => r.role === 'admin');
      if (isAdmin) {
        if (!cancelled) setState('granted');
        return;
      }

      // Check has_access on profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_access')
        .eq('id', userId)
        .single();

      if (!cancelled) {
        setState((profile as any)?.has_access === true ? 'granted' : 'denied');
      }
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setState('loading');
      check();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state === 'denied') {
    return <Navigate to="/invite" replace />;
  }

  return <Outlet />;
}
