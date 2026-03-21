import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'moderator' | 'user';
export type UserStatus = 'active' | 'banned' | 'suspended';

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

  const isAdmin = roles.includes('admin');
  const isModerator = roles.includes('moderator') || isAdmin;
  const isAuthenticated = !!session && !!user;
  const hasAccess = profile?.has_access === true || isAdmin;

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Fetch roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (rolesData) {
        setRoles(rolesData.map(r => r.role as UserRole));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  const grantAccess = useCallback(() => {
    setProfile(prev => prev ? { ...prev, has_access: true } : null);
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer Supabase calls with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRoles([]);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  // Admin email that doesn't require invite code
  const ADMIN_EMAIL = 'juniorthemaster88@gmail.com';

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
    fetchUserData
  };
}