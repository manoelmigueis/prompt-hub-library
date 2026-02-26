import { Button } from '@/components/ui/button';
import { Shield, Plus, LogOut, User, Settings, Menu } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <img 
            src={logo} 
            alt="Ensaios Impossíveis" 
            className="h-8 w-auto"
          />
          <span className="font-display text-lg tracking-wider text-primary hidden sm:inline">ENSAIOS</span>
        </div>
        
        {/* Nav Links - scrollable on mobile */}
        <nav className="hidden md:flex items-center gap-1 mx-4">
          <a href="#categorias" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
            Categorias
          </a>
          <a href="#novos" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
            Novos Prompts
          </a>
          <a href="#favoritos" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
            Favoritos
          </a>
        </nav>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <Button 
                onClick={onSubmitClick}
                size="sm"
                className="btn-gradient gap-1.5 rounded-full text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Enviar</span>
              </Button>
              
              {(isAdmin || isModerator) && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={onAdminClick}
                  className="rounded-full h-8 w-8"
                >
                  <Shield className="w-3.5 h-3.5" />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <Avatar className="h-7 w-7 border-2 border-primary/30">
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
