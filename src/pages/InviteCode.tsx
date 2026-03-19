import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, KeyRound } from 'lucide-react';

export default function InviteCode() {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // If no session at all, redirect to home (login)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/', { replace: true });
        return;
      }
      // Check if already has access
      supabase
        .from('profiles')
        .select('has_access')
        .eq('id', session.user.id)
        .single()
        .then(({ data }) => {
          if ((data as any)?.has_access === true) {
            navigate('/', { replace: true });
          } else {
            setChecking(false);
          }
        });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('Sessão expirada. Faça login novamente.');
        navigate('/', { replace: true });
        return;
      }

      const userId = session.user.id;

      // Validate via RPC
      const { data: isValid } = await supabase.rpc('validate_invite_code', { _code: trimmed });

      if (!isValid) {
        setCode('');
        toast.error('Código inválido, esgotado ou expirado.');
        setSubmitting(false);
        return;
      }

      // Use the invite code (increments uses + sets invite_code_used on profile)
      const { data: used } = await supabase.rpc('use_invite_code', {
        _code: trimmed,
        _user_id: userId,
      });

      if (!used) {
        setCode('');
        toast.error('Não foi possível resgatar o código. Tente novamente.');
        setSubmitting(false);
        return;
      }

      // Grant access
      await supabase
        .from('profiles')
        .update({ has_access: true } as any)
        .eq('id', userId);

      toast.success('Acesso liberado com sucesso! 🎉');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Invite code error:', err);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Código de Convite</h1>
          <p className="text-muted-foreground text-sm">
            Insira o código de convite que você recebeu para acessar a plataforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Ex: NJKTE2Z6"
            className="text-center text-lg tracking-widest uppercase"
            maxLength={20}
            disabled={submitting}
            autoFocus
          />
          <Button
            type="submit"
            className="w-full"
            disabled={submitting || !code.trim()}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Validar Código
          </Button>
        </form>
      </div>
    </div>
  );
}
