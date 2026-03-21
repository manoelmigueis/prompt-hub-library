import { useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import logo from '@/assets/logo.png';

interface InviteCodeGateProps {
  isOpen: boolean;
  userId: string;
  onAccessGranted: () => void;
}

export function InviteCodeGate({ isOpen, userId, onAccessGranted }: InviteCodeGateProps) {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      setError('Digite um código de convite');
      return;
    }

    setError('');
    setIsValidating(true);
    console.log('[InviteSystem] Validating code for user:', userId);

    try {
      const { data: success, error: rpcError } = await supabase.rpc('use_invite_code', {
        _code: trimmedCode,
        _user_id: userId,
      });

      if (rpcError) {
        console.error('[InviteSystem] RPC error:', rpcError);
        setError('Erro ao validar código. Tente novamente.');
        toast.error('Erro ao validar código');
        setIsValidating(false);
        return;
      }

      if (!success) {
        console.log('[InviteSystem] Invalid or used code');
        setError('Código inválido, expirado ou já utilizado.');
        toast.error('Código inválido ou já utilizado');
        setIsValidating(false);
        return;
      }

      console.log('[InviteSystem] Access granted!');
      toast.success('Acesso liberado! Bem-vindo à plataforma 🎉');
      onAccessGranted();
    } catch (err: any) {
      console.error('[InviteSystem] Unexpected error:', err);
      setError('Erro inesperado. Tente novamente.');
      toast.error('Erro inesperado');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent
        className="max-w-md w-[90%] rounded-2xl animate-in fade-in-0 zoom-in-95 duration-300"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AlertDialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Ensaios Impossíveis"
              className="h-16 w-auto"
            />
          </div>
          <AlertDialogTitle className="font-display text-2xl tracking-wider flex items-center justify-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Acesso Restrito
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground">
            Insira seu código de convite único para acessar a plataforma.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(''); }}
                placeholder="XXXX-XXXX"
                className="h-12 pl-10 rounded-xl font-mono tracking-widest text-center text-lg"
                autoFocus
                maxLength={20}
              />
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-lg animate-in fade-in-0 duration-200">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-12 btn-gradient rounded-xl gap-2"
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validando...
              </>
            ) : (
              'Validar Acesso'
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Não tem um código? Solicite ao administrador.
          </p>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
