import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'portfolio-access-fallback-dismissed';

export function PortfolioAccessGuard() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || loading) return;
    const dismissed = sessionStorage.getItem(STORAGE_KEY) === 'true';
    const hasPortfolioNav = Boolean(document.querySelector('[data-portfolio-nav="true"]'));

    if (!dismissed && !hasPortfolioNav) {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [isAuthenticated, loading]);

  if (loading || !isAuthenticated || sessionStorage.getItem(STORAGE_KEY) === 'true') {
    return null;
  }

  return (
    <Button
      type="button"
      size="sm"
      data-portfolio-fallback="true"
      className="fixed bottom-4 right-4 z-[60] rounded-full shadow-lg gap-2 sm:hidden"
      onClick={() => navigate('/portfolio')}
      onDoubleClick={() => sessionStorage.setItem(STORAGE_KEY, 'true')}
    >
      <Briefcase className="w-4 h-4" />
      Portfólio
    </Button>
  );
}