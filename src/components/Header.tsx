import { Button } from '@/components/ui/button';
import { Shield, Plus, LogOut } from 'lucide-react';

interface HeaderProps {
  isAdmin: boolean;
  isAuthenticated: boolean;
  onAdminClick: () => void;
  onSubmitClick: () => void;
  onLogout: () => void;
}

export function Header({ 
  isAdmin, 
  isAuthenticated, 
  onAdminClick, 
  onSubmitClick,
  onLogout 
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-primary">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍌</span>
          <span className="font-display font-bold text-xl">PromptHub</span>
        </div>
        
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onSubmitClick}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar Prompt</span>
              </Button>
              
              {isAdmin && (
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={onAdminClick}
                  className="gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
