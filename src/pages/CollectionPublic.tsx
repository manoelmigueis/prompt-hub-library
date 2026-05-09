import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, X } from 'lucide-react';
import {
  fetchPublicCollection,
  type PublicCollectionData,
  type PublicCollectionPrompt,
} from '@/hooks/usePortfolioCollections';

export default function CollectionPublic() {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<{
    data: PublicCollectionData;
    prompts: PublicCollectionPrompt[];
  } | null>(null);
  const [active, setActive] = useState<string | null>(null);

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

  useEffect(() => {
    if (!active) return;
    const handle = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null);
    window.addEventListener('keydown', handle);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handle);
      document.body.style.overflow = prev;
    };
  }, [active]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="font-display text-3xl tracking-wider mb-2">Ensaio não encontrado</h1>
        <p className="text-muted-foreground">Verifique o link ou peça outro ao autor.</p>
        <Link to="/" className="mt-4 text-primary underline">
          Voltar
        </Link>
      </div>
    );
  }

  const { data, prompts } = payload;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-8 flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 mb-3">
            <AvatarImage src={data.avatar_url || undefined} alt={data.display_name || ''} />
            <AvatarFallback>{(data.display_name || '?').slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {data.display_name || data.username}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wider mt-1">{data.title}</h1>
          {data.description && (
            <p className="text-sm text-muted-foreground mt-3 max-w-xl">{data.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {prompts.length} {prompts.length === 1 ? 'imagem' : 'imagens'}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {prompts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">Nenhuma imagem neste ensaio.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {prompts.map((p) =>
              p.image_url ? (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActive(p.image_url)}
                  className="aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:border-primary transition-all group"
                >
                  <img
                    src={p.image_url}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform protected-image"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </button>
              ) : null
            )}
          </div>
        )}
      </main>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActive(null);
            }}
            className="fixed top-4 right-4 z-[90] inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-card-foreground border border-border shadow-lg hover:bg-primary hover:text-primary-foreground"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={active}
            alt=""
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
            className="max-h-full max-w-full object-contain rounded-lg protected-image"
          />
        </div>
      )}
    </div>
  );
}
