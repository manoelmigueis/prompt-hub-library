import { Button } from '@/components/ui/button';
import { Shield, Plus, LogOut, User, Settings, Wrench, Heart, Library, Briefcase, Store } from 'lucide-react';
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
  showFavoritesOnly?: boolean;
  onAdminClick: () => void;
  onSubmitClick: () => void;
  onProfileClick?: () => void;
  onFavoritesClick?: () => void;
  onShopClick?: () => void;
  onLogout: () => void;
}

export function Header({ 
  isAdmin,
  isModerator,
  isAuthenticated, 
  displayName,
  avatarUrl,
  showFavoritesOnly,
  onAdminClick, 
  onSubmitClick,
  onProfileClick,
  onFavoritesClick,
  onShopClick,
  onLogout 
}: HeaderProps) {
  const initials = displayName?.slice(0, 2).toUpperCase() || 'U';
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="group flex items-center gap-2 shrink-0 cursor-pointer transition-opacity hover:opacity-80" onClick={() => navigate('/')}>
          <img 
            src={logo} 
            alt="Acervo" 
            className="h-8 w-auto"
          />
          <span className="font-display text-lg tracking-wider text-primary hidden sm:inline">ACERVO</span>
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

              {/* Referências */}
              <Button
                variant={location.pathname === '/referencias' ? 'default' : 'ghost'}
                size="sm"
                className={`gap-1.5 rounded-full text-xs ${location.pathname === '/referencias' ? 'bg-primary/20 text-primary' : ''}`}
                onClick={() => navigate('/referencias')}
              >
                <Library className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Referências</span>
              </Button>

              {/* Portfólio */}
              <Button
                data-portfolio-nav="true"
                variant={location.pathname.startsWith('/portfolio') ? 'default' : 'ghost'}
                size="sm"
                className={`gap-1.5 rounded-full text-xs shrink-0 ${location.pathname.startsWith('/portfolio') ? 'bg-primary/20 text-primary' : ''}`}
                onClick={() => navigate('/portfolio')}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Portfólio</span>
              </Button>

              {onShopClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 rounded-full text-xs shrink-0"
                  onClick={onShopClick}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Loja</span>
                </Button>
              )}

              {/* Enviar Prompt - apenas admins/moderadores */}
              {(isAdmin || isModerator) && (
                <Button 
                  onClick={onSubmitClick}
                  size="sm"
                  className="btn-gradient gap-1.5 rounded-full text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Enviar Prompt</span>
                </Button>
              )}

              {/* Favoritos */}
              <Button
                variant={showFavoritesOnly ? 'default' : 'ghost'}
                size="sm"
                className={`gap-1.5 rounded-full text-xs ${showFavoritesOnly ? 'bg-primary/20 text-primary' : ''}`}
                onClick={() => {
                  if (location.pathname !== '/') navigate('/');
                  onFavoritesClick?.();
                }}
              >
                <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
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
                  <DropdownMenuItem onClick={() => navigate('/portfolio')} className="gap-2 cursor-pointer">
                    <Briefcase className="w-4 h-4" />
                    Meu Portfólio
                  </DropdownMenuItem>
                  {onShopClick && (
                    <DropdownMenuItem onClick={onShopClick} className="gap-2 cursor-pointer">
                      <Store className="w-4 h-4" />
                      Loja
                    </DropdownMenuItem>
                  )}
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