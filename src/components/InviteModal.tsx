import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Key, ArrowRight } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onSubmit: (code: string) => void;
}

export function InviteModal({ isOpen, onSubmit }: InviteModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length < 4) {
      setError('Código inválido');
      return;
    }
    setError('');
    onSubmit(code.trim().toUpperCase());
  };
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md" hideClose>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl">🍌</div>
          <DialogTitle className="font-display text-3xl">PromptHub</DialogTitle>
          <DialogDescription className="text-base">
            Acesso exclusivo por convite
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Código de Convite
            </Label>
            <Input
              id="invite-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              className="text-center text-2xl font-mono tracking-widest border-2 border-primary h-14"
              maxLength={9}
            />
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
          </div>
          
          <Button type="submit" variant="generate" className="w-full gap-2">
            Entrar
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            Não tem um código? Solicite ao administrador.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
