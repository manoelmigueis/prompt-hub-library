import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import {
  fetchPublicPortfolio,
  type PublicPortfolioData,
  type PublicPortfolioPrompt,
} from '@/hooks/usePortfolio';
import { PortfolioRenderer } from '@/components/portfolio/PortfolioRenderer';
import PublicPortfolio404 from '@/components/PublicPortfolio404';

export default function PortfolioPublic() {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    profile: PublicPortfolioData;
    prompts: PublicPortfolioPrompt[];
  } | null>(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetchPublicPortfolio(username).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [username]);

  useEffect(() => {
    if (data?.profile?.display_name) {
      document.title = `${data.profile.title || data.profile.display_name} — Portfólio`;
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data || !data.profile) {
    console.log('[PUBLIC_PORTFOLIO]', {
      route: '/portfolio/:username',
      username,
      portfolioFound: false,
      fallbackTriggered: 'PublicPortfolio404',
      redirectedTo: null,
    });
    return <PublicPortfolio404 />;
  }

  return <PortfolioRenderer profile={data.profile} prompts={data.prompts} subtitle={data.profile.about} />;
}
