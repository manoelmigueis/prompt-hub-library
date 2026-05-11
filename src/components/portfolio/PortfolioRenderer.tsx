import { useEffect, useState, useCallback, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  MessageCircle,
  Check,
  ShoppingBag,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createPortfolioOrder } from '@/hooks/usePortfolio';
import logo from '@/assets/logo.png';

export interface PortfolioRendererProfile {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  about?: string | null;
  instagram: string | null;
  whatsapp: string | null;
  website: string | null;
  youtube: string | null;
  tiktok: string | null;
  twitter: string | null;
  show_social_links: boolean | null;
  /** ID of the owner's portfolio used to attach orders. Required to enable ordering. */
  portfolio_id?: string | null;
  /** Title displayed in hero. Falls back to display_name. */
  title?: string | null;
  cover_image_url?: string | null;
}

export interface PortfolioRendererPrompt {
  id: string;
  title: string;
  image_url: string | null;
}

interface Props {
  profile: PortfolioRendererProfile;
  prompts: PortfolioRendererPrompt[];
  /** Hero subtitle (e.g. ensaio description). */
  subtitle?: string | null;
  /** When true, hides the Acervo footer (used for sub-pages if needed). */
  hideFooter?: boolean;
  /** Override the default cover URL resolution. */
  coverUrlOverride?: string | null;
  /** Disable orders even if portfolio_id exists. */
  disableOrders?: boolean;
}

export function PortfolioRenderer({
  profile,
  prompts,
  subtitle,
  hideFooter,
  coverUrlOverride,
  disableOrders,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [orderOpen, setOrderOpen] = useState(false);
  const [sendingOrder, setSendingOrder] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [customerNote, setCustomerNote] = useState('');

  const orderingEnabled = !disableOrders && !!profile.portfolio_id;
  const visiblePrompts = prompts.filter((p) => p.image_url);

  console.log('[PORTFOLIO_RENDER]', {
    rendererUsed: 'PortfolioRenderer',
    imageCount: visiblePrompts.length,
    socialLinks: {
      ig: !!profile.instagram,
      wa: !!profile.whatsapp,
      tw: !!profile.twitter,
      yt: !!profile.youtube,
      tk: !!profile.tiktok,
      web: !!profile.website,
    },
    orderingEnabled,
  });

  const initials = (profile.display_name || profile.username || '?').slice(0, 2).toUpperCase();
  const coverFromPrompt = visiblePrompts[0];
  const coverUrl =
    coverUrlOverride !== undefined
      ? coverUrlOverride
      : profile.cover_image_url || coverFromPrompt?.image_url || null;
  const showSocials = profile.show_social_links !== false;
  const selectedPrompts = prompts.filter((p) => selectedIds.includes(p.id));

  const toggleOrderImage = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }, []);

  // Lightbox keyboard + body lock
  const closeLightbox = useCallback(() => setActiveIndex(null), []);
  const next = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % visiblePrompts.length));
  }, [visiblePrompts.length]);
  const prev = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + visiblePrompts.length) % visiblePrompts.length
    );
  }, [visiblePrompts.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex, closeLightbox, next, prev]);

  // Preload neighbours
  useEffect(() => {
    if (activeIndex === null) return;
    const preload = (idx: number) => {
      const url = visiblePrompts[idx]?.image_url;
      if (url) {
        const img = new Image();
        img.src = url;
      }
    };
    preload((activeIndex + 1) % visiblePrompts.length);
    preload((activeIndex - 1 + visiblePrompts.length) % visiblePrompts.length);
  }, [activeIndex, visiblePrompts]);

  // Touch swipe
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  const handleSendOrder = async () => {
    if (!profile.portfolio_id || selectedPrompts.length === 0) return;
    if (!customerName.trim() && !customerEmail.trim() && !customerWhatsapp.trim()) {
      toast.error('Informe pelo menos nome, e-mail ou WhatsApp.');
      return;
    }
    setSendingOrder(true);
    try {
      await createPortfolioOrder({
        portfolioId: profile.portfolio_id,
        ownerUserId: profile.user_id,
        selectedPromptIds: selectedPrompts.map((p) => p.id),
        selectedImageUrls: selectedPrompts.map((p) => p.image_url).filter(Boolean) as string[],
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerWhatsapp: customerWhatsapp.trim(),
        customerNote: customerNote.trim(),
      });
      toast.success('Pedido enviado!');
      setOrderOpen(false);
      setSelectedIds([]);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerWhatsapp('');
      setCustomerNote('');
    } catch (error) {
      console.error('[PortfolioRenderer] order error', error);
      toast.error('Não foi possível enviar o pedido. Tente novamente.');
    } finally {
      setSendingOrder(false);
    }
  };

  const activeImage = activeIndex !== null ? visiblePrompts[activeIndex] : null;

  return (
    <div className="min-h-screen bg-background select-none" onContextMenu={(e) => e.preventDefault()}>
      {coverUrl && (
        <div className="relative h-48 sm:h-72 md:h-96 w-full overflow-hidden">
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
        </div>
      )}

      <div className={`container mx-auto px-4 max-w-5xl ${coverUrl ? '-mt-20' : 'pt-12'}`}>
        <header className="flex flex-col items-center text-center mb-10 relative z-10">
          <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="font-display text-4xl md:text-5xl tracking-wider mt-4">
            {profile.title || profile.display_name || profile.username}
          </h1>
          {profile.display_name && profile.title && profile.title !== profile.display_name && (
            <p className="text-muted-foreground mt-1">por {profile.display_name}</p>
          )}
          {profile.bio && <p className="text-muted-foreground max-w-xl mt-3">{profile.bio}</p>}
          {subtitle && <p className="max-w-2xl mt-4 text-sm leading-relaxed">{subtitle}</p>}
          {profile.about && !subtitle && (
            <p className="max-w-2xl mt-4 text-sm leading-relaxed">{profile.about}</p>
          )}

          {showSocials && (
            <div className="flex flex-wrap gap-2 mt-5 justify-center">
              <SocialLink
                href={profile.instagram ? `https://instagram.com/${profile.instagram}` : null}
                icon={<Instagram className="w-4 h-4" />}
                label="Instagram"
              />
              <SocialLink
                href={
                  profile.whatsapp
                    ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`
                    : null
                }
                icon={<MessageCircle className="w-4 h-4" />}
                label="WhatsApp"
              />
              <SocialLink
                href={profile.twitter ? `https://twitter.com/${profile.twitter}` : null}
                icon={<Twitter className="w-4 h-4" />}
                label="Twitter"
              />
              <SocialLink
                href={profile.youtube ? `https://youtube.com/${profile.youtube}` : null}
                icon={<Youtube className="w-4 h-4" />}
                label="YouTube"
              />
              <SocialLink
                href={
                  profile.tiktok
                    ? `https://www.tiktok.com/@${profile.tiktok.replace('@', '')}`
                    : null
                }
                icon={<TikTokIcon />}
                label="TikTok"
              />
              <SocialLink
                href={
                  profile.website
                    ? profile.website.startsWith('http')
                      ? profile.website
                      : `https://${profile.website}`
                    : null
                }
                icon={<Globe className="w-4 h-4" />}
                label="Site"
              />
            </div>
          )}
        </header>

        {visiblePrompts.length > 0 && orderingEnabled && (
          <div className="sticky top-3 z-40 mb-5 flex justify-center">
            <Button
              type="button"
              onClick={() => setOrderOpen(true)}
              disabled={selectedIds.length === 0}
              className="gap-2 shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              Fazer pedido {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </Button>
          </div>
        )}

        {visiblePrompts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            Este portfólio ainda não tem imagens.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
            {visiblePrompts.map((p, idx) => (
              <article
                key={p.id}
                className="group relative overflow-hidden rounded-xl bg-muted border border-border hover:border-primary/50 transition-all"
              >
                <ProtectedPortfolioImage
                  src={p.image_url!}
                  alt={p.title}
                  onOpen={() => setActiveIndex(idx)}
                />
                {orderingEnabled && (
                  <button
                    type="button"
                    onClick={() => toggleOrderImage(p.id)}
                    className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label={
                      selectedIds.includes(p.id) ? 'Remover do pedido' : 'Selecionar para pedido'
                    }
                  >
                    {selectedIds.includes(p.id) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <ShoppingBag className="w-4 h-4" />
                    )}
                  </button>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-left">
                  <p className="text-sm text-white font-medium line-clamp-1">{p.title}</p>
                </div>
              </article>
            ))}
          </div>
        )}

        {!hideFooter && (
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
        )}
      </div>

      {/* Lightbox carousel */}
      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
            aria-label="Fechar imagem"
            className="fixed top-4 right-4 z-[60] inline-flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-foreground border border-border shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {visiblePrompts.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Imagem anterior"
                className="hidden sm:inline-flex fixed left-4 top-1/2 -translate-y-1/2 z-[60] h-12 w-12 items-center justify-center rounded-full bg-background/80 text-foreground border border-border shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Próxima imagem"
                className="hidden sm:inline-flex fixed right-4 top-1/2 -translate-y-1/2 z-[60] h-12 w-12 items-center justify-center rounded-full bg-background/80 text-foreground border border-border shadow-lg hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] px-3 py-1 rounded-full bg-background/80 border border-border text-xs">
                {activeIndex! + 1} / {visiblePrompts.length}
              </div>
            </>
          )}

          <img
            key={activeImage.id}
            onClick={(e) => e.stopPropagation()}
            src={activeImage.image_url!}
            alt={activeImage.title}
            className="max-w-full max-h-full object-contain protected-image select-none animate-in fade-in duration-200"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      )}

      {/* Order modal */}
      {orderingEnabled && (
        <Dialog open={orderOpen} onOpenChange={setOrderOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto pb-24">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl tracking-wider">FAZER PEDIDO</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {selectedPrompts.slice(0, 8).map(
                  (p) =>
                    p.image_url && (
                      <div
                        key={p.id}
                        className="aspect-square rounded-md overflow-hidden bg-muted border border-border"
                      >
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-full h-full object-cover protected-image"
                          draggable={false}
                        />
                      </div>
                    )
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-name">Nome</Label>
                <Input
                  id="order-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="order-email">E-mail</Label>
                  <Input
                    id="order-email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="voce@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order-whatsapp">WhatsApp</Label>
                  <Input
                    id="order-whatsapp"
                    value={customerWhatsapp}
                    onChange={(e) => setCustomerWhatsapp(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order-note">Observação</Label>
                <Textarea
                  id="order-note"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  rows={3}
                  placeholder="Detalhes do pedido"
                />
              </div>
              <Button
                onClick={handleSendOrder}
                disabled={sendingOrder || selectedPrompts.length === 0}
                className="w-full h-11 gap-2"
              >
                {sendingOrder ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar pedido
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function ProtectedPortfolioImage({
  src,
  alt,
  onOpen,
}: {
  src: string;
  alt: string;
  onOpen: () => void;
}) {
  return (
    <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={`Ampliar ${alt}`}>
      <div className="relative">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03] animate-in fade-in protected-image pointer-events-none"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
        <div className="absolute inset-0" aria-hidden="true" />
      </div>
    </button>
  );
}

function SocialLink({
  href,
  icon,
  label,
}: {
  href: string | null;
  icon: React.ReactNode;
  label: string;
}) {
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

function TikTokIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  );
}
