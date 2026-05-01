import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Instagram, Twitter, Youtube, Globe, MessageCircle } from 'lucide-react';
import {
  fetchPublicPortfolio,
  type PublicPortfolioData,
  type PublicPortfolioPrompt,
} from '@/hooks/usePortfolio';
import logo from '@/assets/logo.png';

export default function PortfolioPublic() {
  const { username } = useParams<{ username: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ profile: PublicPortfolioData; prompts: PublicPortfolioPrompt[] } | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

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
        <p className="text-muted-foreground">O usuário "{username}" não existe ou seu portfólio não está público.</p>
        <Button asChild>
          <Link to="/">Voltar ao acervo</Link>
        </Button>
      </div>
    );
  }

  const { profile, prompts } = data;
  const initials = (profile.display_name || profile.username || '?').slice(0, 2).toUpperCase();
  const coverFromPrompt = prompts.find((p) => p.id === profile.cover_prompt_id) || prompts[0];
  const coverUrl = profile.cover_image_url || coverFromPrompt?.image_url || null;
  const showSocials = profile.show_social_links !== false;

  return (
    <div className="min-h-screen bg-background">
      {/* Cover */}
      {coverUrl && (
        <div className="relative h-48 sm:h-72 md:h-96 w-full overflow-hidden">
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>
      )}

      <div className={`container mx-auto px-4 max-w-5xl ${coverUrl ? '-mt-20' : 'pt-12'}`}>
        {/* Header */}
        <header className="flex flex-col items-center text-center mb-10 relative z-10">
          <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <h1 className="font-display text-4xl md:text-5xl tracking-wider mt-4">
            {profile.title || profile.display_name || profile.username}
          </h1>
          {profile.display_name && profile.title && (
            <p className="text-muted-foreground mt-1">por {profile.display_name}</p>
          )}
          {profile.bio && <p className="text-muted-foreground max-w-xl mt-3">{profile.bio}</p>}
          {profile.about && <p className="max-w-2xl mt-4 text-sm leading-relaxed">{profile.about}</p>}

          {/* Socials */}
          {showSocials && (
            <div className="flex flex-wrap gap-2 mt-5 justify-center">
              <SocialLink href={profile.instagram ? `https://instagram.com/${profile.instagram}` : null} icon={<Instagram className="w-4 h-4" />} label="Instagram" />
              <SocialLink
                href={profile.whatsapp ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}` : null}
                icon={<MessageCircle className="w-4 h-4" />}
                label="WhatsApp"
              />
              <SocialLink href={profile.twitter ? `https://twitter.com/${profile.twitter}` : null} icon={<Twitter className="w-4 h-4" />} label="Twitter" />
              <SocialLink href={profile.youtube ? `https://youtube.com/${profile.youtube}` : null} icon={<Youtube className="w-4 h-4" />} label="YouTube" />
              <SocialLink href={profile.website ? (profile.website.startsWith('http') ? profile.website : `https://${profile.website}`) : null} icon={<Globe className="w-4 h-4" />} label="Site" />
            </div>
          )}
        </header>

        {/* Grid */}
        {prompts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Este portfólio ainda não tem imagens.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
            {prompts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => p.image_url && setActiveImage(p.image_url)}
                className="group relative overflow-hidden rounded-xl bg-muted border border-border hover:border-primary/50 transition-all"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03] animate-in fade-in"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                  />
                ) : (
                  <div className="aspect-square flex items-center justify-center text-sm text-muted-foreground p-4">
                    {p.title}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-left">
                  <p className="text-sm text-white font-medium line-clamp-1">{p.title}</p>
                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.tags.slice(0, 3).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px] py-0 h-4">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-2">
            <img src={logo} alt="Acervo" className="h-5 w-auto" />
            <span>Portfólio criado no Acervo</span>
          </div>
          <a
            href="https://ensaioimpossivel.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Ensaio Impossível →
          </a>
        </footer>
      </div>

      {/* Lightbox */}
      {activeImage && (
        <div
          onClick={() => setActiveImage(null)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img src={activeImage} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string | null; icon: React.ReactNode; label: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary text-xs transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}
