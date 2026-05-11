import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  fetchPublicPortfolio,
  type PublicPortfolioData,
  type PublicPortfolioPrompt,
} from '@/hooks/usePortfolio';
import { PortfolioRenderer } from '@/components/portfolio/PortfolioRenderer';

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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4 text-center">
        <h1 className="font-display text-3xl tracking-wider">Portfólio não encontrado</h1>
        <p className="text-muted-foreground">
          O usuário "{username}" não existe ou seu portfólio não está público.
        </p>
        <Button asChild>
          <Link to="/">Voltar ao acervo</Link>
        </Button>
      </div>
    );
  }

  return <PortfolioRenderer profile={data.profile} prompts={data.prompts} subtitle={data.profile.about} />;
}
