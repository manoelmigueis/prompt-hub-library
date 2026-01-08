import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Key, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import logo from '@/assets/logo.png';

interface InviteModalProps {
  isOpen: boolean;
  onLogin: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string, displayName: string, inviteCode: string) => Promise<{ error: any }>;
  loading?: boolean;
}

export function InviteModal({ isOpen, onLogin, onSignUp, loading }: InviteModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    const { error } = await onLogin(email, password);
    if (error) {
      setError(error.message || 'Erro ao fazer login');
    }
    setIsSubmitting(false);
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName || !inviteCode) {
      setError('Preencha todos os campos');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    const { error } = await onSignUp(email, password, displayName, inviteCode);
    if (error) {
      setError(error.message || 'Erro ao criar conta');
    }
    setIsSubmitting(false);
  };
  
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md rounded-2xl" hideClose>
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img 
              src={logo} 
              alt="Ensaios Impossíveis" 
              className="h-20 w-auto logo-particles"
            />
          </div>
          <DialogTitle className="font-display text-3xl tracking-wider">
            <span className="hero-gradient-text">ENSAIOS</span>{' '}
            <span className="text-foreground">IMPOSSÍVEIS</span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Acesso exclusivo por convite
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={(v) => { setTab(v as 'login' | 'signup'); setError(''); }}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="h-12 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Senha
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl"
                />
              </div>
              
              {error && (
                <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-lg">{error}</p>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 btn-gradient rounded-xl gap-2"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nome de Exibição
                </Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome"
                  className="h-12 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="h-12 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Senha
                </Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invite-code" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Código de Convite
                </Label>
                <Input
                  id="invite-code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Digite seu código"
                  className="h-12 rounded-xl font-mono tracking-wider"
                />
              </div>
              
              {error && (
                <p className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-lg">{error}</p>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 btn-gradient rounded-xl gap-2"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">
                Não tem um código? Solicite ao administrador.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}