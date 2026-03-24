import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'moderator' | 'user';
export type UserStatus = 'active' | 'banned' | 'suspended';

const ADMIN_EMAIL = 'juniorthemaster88@gmail.com';

export interface UserProfile {
  id: string;
  display_name: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  youtube: string | null;
  website: string | null;
  avatar_url: string | null;
  status: UserStatus;
  has_access: boolean;
  invite_code_used: string | null;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const isPrimaryAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isAdmin = roles.includes('admin') || isPrimaryAdmin;
  const isModerator = roles.includes('moderator') || isAdmin;
  const isAuthenticated = !!session && !!user;
  const hasAccess = profile?.has_access === true || isAdmin;

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [profileResponse, rolesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId),
      ]);

      const { data: profileData } = profileResponse;
      setProfile(profileData ? (profileData as UserProfile) : null);

      const { data: rolesData } = rolesResponse;
      setRoles((rolesData || []).map(r => r.role as UserRole));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setProfile(null);
      setRoles([]);
    }
  }, []);

  const grantAccess = useCallback(() => {
    setProfile(prev => prev ? { ...prev, has_access: true } : null);
  }, []);

  const hydrateSession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);

    const nextUser = nextSession?.user ?? null;
    setUser(nextUser);

    if (!nextUser) {
      setProfile(null);
      setRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      await fetchUserData(nextUser.id);
    } finally {
      setLoading(false);
    }
  }, [fetchUserData]);

  useEffect(() => {
    let isActive = true;

    const syncSession = async (nextSession: Session | null) => {
      if (!isActive) return;
      await hydrateSession(nextSession);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await syncSession(session);
      }
    );

    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      await syncSession(session);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [hydrateSession]);

  const signUp = async (email: string, password: string, displayName: string, inviteCode: string) => {
    const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    
    // Skip invite code validation for admin email
    if (!isAdminEmail) {
      const { data: isValid } = await supabase.rpc('validate_invite_code', { _code: inviteCode });
      
      if (!isValid) {
        return { error: { message: 'Código de convite inválido ou expirado' } };
      }
    }

    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName
        }
      }
    });

    if (!error && data.user) {
      if (isAdminEmail) {
        // Admin email gets admin role directly - handled via database
        // We'll create a special system invite code usage for tracking
      } else {
        // Use the invite code - admin role assignment is handled server-side via database trigger
        await supabase.rpc('use_invite_code', { _code: inviteCode, _user_id: data.user.id });
      }
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error && data.user) {
      // Check if user is banned
      const { data: profileData } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', data.user.id)
        .single();
      
      if (profileData?.status === 'banned') {
        await supabase.auth.signOut();
        return { error: { message: 'Sua conta foi banida. Entre em contato com o administrador.' } };
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRoles([]);
      toast.info('Você saiu da plataforma');
    }
    return { error };
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: { message: 'Usuário não autenticado' } };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Perfil atualizado!');
    }

    return { error };
  };

  return {
    user,
    session,
    profile,
    roles,
    loading,
    isAuthenticated,
    isAdmin,
    isModerator,
    hasAccess,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchUserData,
    grantAccess
  };
}