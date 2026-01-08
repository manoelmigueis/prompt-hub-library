import { Button } from '@/components/ui/button';
import { Shield, Plus, LogOut, User, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/logo.png';

interface HeaderProps {
  isAdmin: boolean;
  isModerator?: boolean;
  isAuthenticated: boolean;
  displayName?: string;
  avatarUrl?: string;
  onAdminClick: () => void;
  onSubmitClick: () => void;
  onProfileClick?: () => void;
  onLogout: () => void;
}

export function Header({ 
  isAdmin,
  isModerator,
  isAuthenticated, 
  displayName,
  avatarUrl,
  onAdminClick, 
  onSubmitClick,
  onProfileClick,
  onLogout 
}: HeaderProps) {
  const initials = displayName?.slice(0, 2).toUpperCase() || 'U';
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Ensaios Impossíveis" 
            className="h-10 w-auto logo-particles"
          />
          <div className="flex flex-col">
            <span className="font-display text-xl tracking-wider text-primary">ENSAIOS</span>
            <span className="font-display text-sm tracking-widest text-secondary -mt-1">IMPOSSÍVEIS</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              <Button 
                onClick={onSubmitClick}
                className="btn-gradient gap-2 rounded-full"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar Ensaio</span>
              </Button>
              
              {(isAdmin || isModerator) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onAdminClick}
                  className="gap-2 rounded-full"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Painel</span>
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{displayName || 'Usuário'}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onProfileClick} className="gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onProfileClick} className="gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="gap-2 cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}