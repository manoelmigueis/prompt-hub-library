import { forwardRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const PortfolioAccessGuard = forwardRef<HTMLDivElement>(function PortfolioAccessGuard(_, ref) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (loading || !isAuthenticated || location.pathname.startsWith('/portfolio')) {
      setShowFallback(false);
      return;
    }

    const checkPortfolioAccess = () => {
      const navButton = document.querySelector('[data-portfolio-nav="true"]') as HTMLElement | null;
      const rect = navButton?.getBoundingClientRect();
      const isVisible = Boolean(navButton && rect && rect.width > 0 && rect.height > 0);
      setShowFallback(!isVisible);
    };

    checkPortfolioAccess();
    const timeout = window.setTimeout(checkPortfolioAccess, 300);
    window.addEventListener('resize', checkPortfolioAccess);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('resize', checkPortfolioAccess);
    };
  }, [isAuthenticated, loading, location.pathname]);

  if (!showFallback) {
    return null;
  }

  return (
    <div ref={ref}>
      <Button
        type="button"
        size="sm"
        data-portfolio-fallback="true"
        className="fixed bottom-4 right-4 z-[60] rounded-full shadow-lg gap-2"
        onClick={() => navigate('/portfolio')}
      >
        <Briefcase className="w-4 h-4" />
        Portfólio
      </Button>
    </div>
  );
});