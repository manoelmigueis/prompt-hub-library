import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Key, ArrowRight, Mail, Lock, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import logo from '@/assets/logo.png';
import { lovable } from '@/integrations/lovable/index';

interface InviteModalProps {
  isOpen: boolean;
  onLogin: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string, displayName: string, inviteCode: string) => Promise<{ error: any }>;
  loading?: boolean;
}

// Admin email that doesn't require invite code
const ADMIN_EMAIL = 'juniorthemaster88@gmail.com';

export function InviteModal({ isOpen, onLogin, onSignUp, loading }: InviteModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        setError(error.message || 'Erro ao entrar com Google');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao entrar com Google');
    }
    setIsGoogleLoading(false);
  };

  // Check if current email is admin
  const isAdminEmail = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  
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
    // Admin doesn't need invite code
    if (!email || !password || !displayName || (!isAdminEmail && !inviteCode)) {
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

              <div className="relative my-2">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">ou</span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl gap-3 font-medium"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {isGoogleLoading ? 'Conectando...' : 'Entrar com Google'}
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
              
              {/* Only show invite code field for non-admin emails */}
              {!isAdminEmail && (
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
              )}

              {isAdminEmail && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 text-center">
                  <p className="text-sm text-primary font-medium">
                    ✨ Acesso administrativo detectado
                  </p>
                </div>
              )}
              
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
              
              {!isAdminEmail && (
                <p className="text-center text-sm text-muted-foreground">
                  Não tem um código? Solicite ao administrador.
                </p>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}