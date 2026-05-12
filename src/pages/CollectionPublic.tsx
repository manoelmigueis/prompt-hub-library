import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import {
  fetchPublicCollection,
  type PublicCollectionData,
  type PublicCollectionPrompt,
} from '@/hooks/usePortfolioCollections';
import { PortfolioRenderer } from '@/components/portfolio/PortfolioRenderer';
import PublicPortfolio404 from '@/components/PublicPortfolio404';

export default function CollectionPublic() {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<{
    data: PublicCollectionData;
    prompts: PublicCollectionPrompt[];
  } | null>(null);

  useEffect(() => {
    if (!username || !slug) return;
    setLoading(true);
    fetchPublicCollection(username, slug).then((res) => {
      setPayload(res);
      setLoading(false);
    });
  }, [username, slug]);

  useEffect(() => {
    if (payload?.data?.title) {
      document.title = `${payload.data.title} — ${payload.data.display_name || 'Ensaio'}`;
    }
  }, [payload]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!payload) {
    console.log('[PUBLIC_PORTFOLIO]', {
      route: '/c/:username/:slug',
      slug,
      username,
      portfolioFound: false,
      fallbackTriggered: 'PublicPortfolio404',
      redirectedTo: null,
    });
    return <PublicPortfolio404 />;
  }

  const { data, prompts } = payload;

  return (
    <PortfolioRenderer
      profile={{
        user_id: data.user_id,
        display_name: data.display_name,
        username: data.username,
        avatar_url: data.avatar_url,
        bio: data.bio,
        about: null,
        instagram: data.instagram,
        whatsapp: data.whatsapp,
        website: data.website,
        youtube: data.youtube,
        tiktok: data.tiktok,
        twitter: data.twitter,
        show_social_links: data.show_social_links,
        portfolio_id: data.portfolio_id,
        title: data.title,
        cover_image_url: data.cover_image_url,
      }}
      prompts={prompts}
      subtitle={data.description}
    />
  );
}
