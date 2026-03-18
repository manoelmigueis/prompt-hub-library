import { Button } from '@/components/ui/button';
import { Shield, Plus, LogOut, User, Settings, Menu, Wrench, Heart, Library } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
          <img 
            src={logo} 
            alt="Ensaios Impossíveis" 
            className="h-8 w-auto"
          />
          <span className="font-display text-lg tracking-wider text-primary hidden sm:inline">ENSAIOS</span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              {/* Ferramentas */}
              <Button
                variant={location.pathname === '/ferramentas' ? 'default' : 'ghost'}
                size="sm"
                className={`gap-1.5 rounded-full text-xs ${location.pathname === '/ferramentas' ? 'bg-primary/20 text-primary' : ''}`}
                onClick={() => navigate('/ferramentas')}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ferramentas</span>
              </Button>

              {/* Enviar Prompt */}
              <Button 
                onClick={onSubmitClick}
                size="sm"
                className="btn-gradient gap-1.5 rounded-full text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Enviar Prompt</span>
              </Button>

              {/* Favoritos */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-full text-xs"
                onClick={() => { navigate('/'); /* scroll to favorites section could be added */ }}
              >
                <Heart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Favoritos</span>
              </Button>
              
              {(isAdmin || isModerator) && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onAdminClick}
                  className="gap-1.5 rounded-full text-xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
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