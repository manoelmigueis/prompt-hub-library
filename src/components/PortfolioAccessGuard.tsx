import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'portfolio-access-fallback-dismissed';

export function PortfolioAccessGuard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [isDismissed, setIsDismissed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'true');

  useEffect(() => {
    if (location.pathname.startsWith('/portfolio')) {
      return;
    }

    setIsDismissed(sessionStorage.getItem(STORAGE_KEY) === 'true');
  }, [location.pathname]);

  if (loading || !isAuthenticated || isDismissed || location.pathname.startsWith('/portfolio')) {
    return null;
  }

  return (
    <Button
      type="button"
      size="sm"
      data-portfolio-fallback="true"
      className="fixed bottom-4 right-4 z-[60] rounded-full shadow-lg gap-2"
      onClick={() => navigate('/portfolio')}
      onDoubleClick={() => {
        sessionStorage.setItem(STORAGE_KEY, 'true');
        setIsDismissed(true);
      }}
    >
      <Briefcase className="w-4 h-4" />
      Portfólio
    </Button>
  );
}