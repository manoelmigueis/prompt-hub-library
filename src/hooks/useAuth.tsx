import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type UserRole = 'admin' | 'moderator' | 'user';
export type UserStatus = 'active' | 'banned' | 'suspended';

export interface UserProfile {
  id: string;
  display_name: string | null;
  username: string | null;
  bio: string | null;
  whatsapp: string | null;
  instagram: string | null;
  twitter: string | null;
  tiktok: string | null;
  youtube: string | null;
  website: string | null;
  avatar_url: string | null;
  status: UserStatus;
  invite_code_used: string | null;
  show_social_links: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: UserRole[];
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  signUp: (email: string, password: string, displayName: string, inviteCode: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  fetchUserData: (userId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = roles.includes('admin');
  const isModerator = roles.includes('moderator') || isAdmin;
  const isAuthenticated = !!session && !!user;

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile((prev) => {
          // Deep equality check to avoid unnecessary re-renders
          if (prev && JSON.stringify(prev) === JSON.stringify(profileData)) return prev;
          return profileData as UserProfile;
        });
      }

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesData) {
        const next = rolesData.map((r) => r.role as UserRole);
        setRoles((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
      }

      console.log('[OWNER_SYNC]', {
        userId,
        profileLoaded: !!profileData,
        roles: (rolesData || []).map((r) => r.role),
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    await fetchUserData(user.id);
  }, [user, fetchUserData]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession((prev) => (prev?.access_token === newSession?.access_token ? prev : newSession));
      setUser((prev) => (prev?.id === newSession?.user?.id ? prev : newSession?.user ?? null));

      if (newSession?.user) {
        setTimeout(() => fetchUserData(newSession.user.id), 0);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        fetchUserData(existing.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const signUp = async (email: string, password: string, displayName: string, inviteCode: string) => {
    const hasInviteCode = !!inviteCode && inviteCode.trim().length > 0;

    if (hasInviteCode) {
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
        data: { display_name: displayName },
      },
    });

    if (!error && data.user && hasInviteCode) {
      await supabase.rpc('use_invite_code', { _code: inviteCode });
    }

    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (!error && data.user) {
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

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      toast.success('Perfil atualizado!');
    }

    return { error };
  };

  const value: AuthContextValue = {
    user,
    session,
    profile,
    roles,
    loading,
    isAuthenticated,
    isAdmin,
    isModerator,
    signUp,
    signIn,
    signOut,
    updateProfile,
    fetchUserData,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>. Wrap your app in App.tsx.');
  }
  return ctx;
}
