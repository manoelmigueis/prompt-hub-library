import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InviteCode {
  id: string;
  code: string;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export function useInviteCodes() {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInviteCodes = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invite_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invite codes:', error);
        return;
      }

      setInviteCodes(data || []);
    } catch (error) {
      console.error('Error in fetchInviteCodes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInviteCodes();
  }, [fetchInviteCodes]);

  const generateCode = async (userId: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const code = Array.from(bytes)
      .map((byte) => chars[byte % chars.length])
      .join('');

    const { data, error } = await supabase
      .from('invite_codes')
      .insert({
        code,
        max_uses: 1,
        is_active: true,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error generating code:', error);
      toast.error('Erro ao gerar código: ' + error.message);
      return null;
    }

    setInviteCodes(prev => [data, ...prev]);
    toast.success('Novo código gerado!');
    return data;
  };

  const deleteCode = async (id: string) => {
    const { error } = await supabase
      .from('invite_codes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting code:', error);
      toast.error('Erro ao remover código: ' + error.message);
      return false;
    }

    setInviteCodes(prev => prev.filter(c => c.id !== id));
    toast.success('Código removido');
    return true;
  };

  const toggleCodeStatus = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('invite_codes')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      console.error('Error toggling code status:', error);
      toast.error('Erro ao atualizar código: ' + error.message);
      return false;
    }

    setInviteCodes(prev => prev.map(c =>
      c.id === id ? { ...c, is_active: isActive } : c
    ));
    return true;
  };

  return {
    inviteCodes,
    loading,
    fetchInviteCodes,
    generateCode,
    deleteCode,
    toggleCodeStatus,
  };
}
