import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Loader2, Package, Mail, Phone, User, Image as ImageIcon, Check,
  Archive, Trash2, Volume2, VolumeX, MessageCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  fetchPortfolioOrders,
  updatePortfolioOrder,
  deletePortfolioOrder,
  type PortfolioOrder,
} from '@/hooks/usePortfolio';
import { supabase } from '@/integrations/supabase/client';
import { PromptModal } from '@/components/PromptModal';
import type { Prompt, Category, PromptStatus } from '@/types/prompt';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PortfolioShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

type OrderStatus = 'novo' | 'em_producao' | 'concluido' | 'entregue' | 'arquivado';

const STATUS_META: Record<OrderStatus, { label: string; className: string }> = {
  novo:        { label: 'Novo',         className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  em_producao: { label: 'Em produção',  className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  concluido:   { label: 'Concluído',    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  entregue:    { label: 'Entregue',     className: 'bg-primary/15 text-primary border-primary/30' },
  arquivado:   { label: 'Arquivado',    className: 'bg-muted text-muted-foreground border-border' },
};

const STATUS_FLOW: OrderStatus[] = ['novo', 'em_producao', 'concluido', 'entregue'];

// Discreet "ding" via WebAudio (no asset needed)
function playDing() {
  try {
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext);
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.5);
  } catch {/* noop */}
}

export function PortfolioShopModal({ isOpen, onClose, userId }: PortfolioShopModalProps) {
  const [orders, setOrders] = useState<PortfolioOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState<boolean>(() => localStorage.getItem('store_muted') === '1');
  const [showArchived, setShowArchived] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
  const [loadingPromptId, setLoadingPromptId] = useState<string | null>(null);
  const initialLoad = useRef(true);

  const loadOrders = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const rows = await fetchPortfolioOrders(userId);
      setOrders(rows);
    } catch (error) {
      console.error('[STORE_WORKFLOW] load error', error);
      toast.error('Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
      initialLoad.current = false;
    }
  };

  useEffect(() => {
    if (isOpen) {
      initialLoad.current = true;
      loadOrders();
    }
  }, [isOpen, userId]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`portfolio_orders_owner_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'portfolio_orders', filter: `owner_user_id=eq.${userId}` },
        (payload) => {
          console.log('[STORE_WORKFLOW] realtime', payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as PortfolioOrder;
            setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
            toast.success('Novo pedido recebido!', { description: `${newOrder.selected_image_urls?.length ?? 0} imagens` });
            if (!muted) playDing();
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as PortfolioOrder;
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
          } else if (payload.eventType === 'DELETE') {
            const old = payload.old as PortfolioOrder;
            setOrders((prev) => prev.filter((o) => o.id !== old.id));
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, muted]);

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem('store_muted', next ? '1' : '0');
      return next;
    });
  };

  const newCount = useMemo(() => orders.filter((o) => o.status === 'novo' && !o.archived_at).length, [orders]);
  const activeOrders = orders.filter((o) => !o.archived_at && o.status !== 'arquivado');
  const archivedOrders = orders.filter((o) => o.archived_at || o.status === 'arquivado');
  const visibleOrders = showArchived ? archivedOrders : activeOrders;

  const setStatus = async (order: PortfolioOrder, status: OrderStatus) => {
    console.log('[STORE_WORKFLOW]', { orderId: order.id, status });
    const prev = orders;
    setOrders((p) => p.map((o) => (o.id === order.id ? { ...o, status } : o)));
    try {
      await updatePortfolioOrder(order.id, { status });
    } catch (e) {
      console.error('[STORE_WORKFLOW] status error', e);
      setOrders(prev);
      toast.error('Erro ao atualizar status.');
    }
  };

  const toggleCompleted = async (order: PortfolioOrder, index: number) => {
    const current = order.completed_image_indexes || [];
    const next = current.includes(index) ? current.filter((i) => i !== index) : [...current, index];
    console.log('[STORE_WORKFLOW]', { orderId: order.id, completedImages: next });
    setOrders((p) => p.map((o) => (o.id === order.id ? { ...o, completed_image_indexes: next } : o)));
    try {
      await updatePortfolioOrder(order.id, { completed_image_indexes: next });
      // Auto-mark concluído if all done
      if (next.length === order.selected_image_urls.length && order.status !== 'entregue') {
        await updatePortfolioOrder(order.id, { status: 'concluido' });
      }
    } catch (e) {
      console.error('[STORE_WORKFLOW] checklist error', e);
      toast.error('Erro ao salvar checklist.');
      loadOrders();
    }
  };

  const archiveOrder = async (order: PortfolioOrder) => {
    try {
      await updatePortfolioOrder(order.id, { archived_at: new Date().toISOString(), status: 'arquivado' });
      toast.success('Pedido arquivado.');
    } catch (e) {
      console.error('[STORE_WORKFLOW] archive error', e);
      toast.error('Erro ao arquivar.');
    }
  };

  const unarchiveOrder = async (order: PortfolioOrder) => {
    try {
      await updatePortfolioOrder(order.id, { archived_at: null as any, status: 'novo' });
      toast.success('Pedido restaurado.');
    } catch (e) {
      console.error('[STORE_WORKFLOW] unarchive error', e);
    }
  };

  const removeOrder = async (order: PortfolioOrder) => {
    if (!confirm('Excluir este pedido permanentemente? Esta ação não pode ser desfeita.')) return;
    try {
      await deletePortfolioOrder(order.id);
      toast.success('Pedido excluído.');
    } catch (e) {
      console.error('[STORE_WORKFLOW] delete error', e);
      toast.error('Erro ao excluir.');
    }
  };

  const openPromptForImage = async (order: PortfolioOrder, index: number) => {
    const promptId = order.selected_prompt_ids?.[index];
    if (!promptId) {
      toast.error('Prompt não associado a esta imagem.');
      return;
    }
    console.log('[STORE_WORKFLOW]', { orderId: order.id, selectedImage: index, promptId });
    setLoadingPromptId(`${order.id}-${index}`);
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        toast.error('Prompt não encontrado.');
        return;
      }
      const mapped: Prompt = {
        id: data.id,
        title: data.title,
        description: data.description || data.content?.substring(0, 120) || '',
        content: data.content,
        imageUrl: data.image_url || order.selected_image_urls[index],
        author: data.author_name || 'Anônimo',
        authorHandle: data.author_instagram ? `@${data.author_instagram}` : undefined,
        category: data.category as Category,
        status: data.status as PromptStatus,
        isFeatured: data.is_featured,
        tags: (data as any).tags || [],
        viewCount: data.view_count || 0,
        copyCount: data.copy_count || 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      setActivePrompt(mapped);
    } catch (e) {
      console.error('[STORE_WORKFLOW] open prompt error', e);
      toast.error('Erro ao abrir prompt.');
    } finally {
      setLoadingPromptId(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto pb-24">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <DialogTitle className="font-display text-3xl tracking-wider flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" /> LOJA
                {newCount > 0 && (
                  <Badge className="bg-primary text-primary-foreground ml-1">{newCount} novo{newCount > 1 ? 's' : ''}</Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={toggleMute} title={muted ? 'Ativar som' : 'Silenciar'}>
                  {muted ? <VolumeOff /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  type="button"
                  variant={showArchived ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowArchived((v) => !v)}
                >
                  <Archive className="w-4 h-4 mr-1" />
                  {showArchived ? `Arquivados (${archivedOrders.length})` : `Arquivados`}
                </Button>
              </div>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground">
              {showArchived ? 'Nenhum pedido arquivado.' : 'Nenhum pedido recebido ainda.'}
            </div>
          ) : (
            <div className="space-y-4">
              {visibleOrders.map((order) => {
                const status = (order.status as OrderStatus) || 'novo';
                const meta = STATUS_META[status] || STATUS_META.novo;
                const completed = order.completed_image_indexes || [];
                const total = order.selected_image_urls.length;
                const done = completed.length;
                const isOpenCard = expanded[order.id] ?? status === 'novo';
                return (
                  <article
                    key={order.id}
                    className={cn(
                      'border rounded-lg bg-card p-4 space-y-4 transition-all',
                      status === 'novo' ? 'border-primary/40 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]' : 'border-border',
                    )}
                  >
                    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">Pedido #{order.id.slice(0, 8)}</h3>
                          <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                          <Badge variant="outline" className="gap-1">
                            <ImageIcon className="w-3 h-3" /> {done}/{total}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded((e) => ({ ...e, [order.id]: !isOpenCard }))}>
                        {isOpenCard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </header>

                    {isOpenCard && (
                      <>
                        {/* Checklist grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {order.selected_image_urls.map((url, index) => {
                            const isDone = completed.includes(index);
                            const isLoadingThis = loadingPromptId === `${order.id}-${index}`;
                            return (
                              <div key={`${order.id}-${index}`} className="relative group">
                                <button
                                  type="button"
                                  onClick={() => openPromptForImage(order, index)}
                                  className="block w-full aspect-square rounded-md overflow-hidden bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                  title="Abrir prompt"
                                >
                                  <img
                                    src={url}
                                    alt={`Imagem ${index + 1}`}
                                    className={cn(
                                      'w-full h-full object-cover protected-image transition-opacity',
                                      isDone && 'opacity-50',
                                    )}
                                    draggable={false}
                                  />
                                  {isLoadingThis && (
                                    <div className="absolute inset-0 grid place-items-center bg-background/60">
                                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    </div>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); toggleCompleted(order, index); }}
                                  className={cn(
                                    'absolute top-1 right-1 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all',
                                    isDone
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'bg-background/80 border-border text-muted-foreground hover:text-foreground opacity-80 group-hover:opacity-100',
                                  )}
                                  title={isDone ? 'Desmarcar' : 'Marcar como produzida'}
                                >
                                  {isDone ? <Check className="w-3.5 h-3.5" /> : ''}
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Status flow buttons */}
                        {!order.archived_at && (
                          <div className="flex flex-wrap gap-1.5">
                            {STATUS_FLOW.map((s) => (
                              <Button
                                key={s}
                                type="button"
                                size="sm"
                                variant={status === s ? 'default' : 'outline'}
                                className="text-xs h-7"
                                onClick={() => setStatus(order, s)}
                              >
                                {STATUS_META[s].label}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Customer info */}
                        <div className="grid sm:grid-cols-3 gap-2 text-sm">
                          {order.customer_name && <Info icon={<User className="w-4 h-4" />} text={order.customer_name} />}
                          {order.customer_email && (
                            <Info
                              icon={<Mail className="w-4 h-4" />}
                              text={order.customer_email}
                              href={`mailto:${order.customer_email}`}
                            />
                          )}
                          {order.customer_whatsapp && (
                            <Info
                              icon={<MessageCircle className="w-4 h-4" />}
                              text={order.customer_whatsapp}
                              href={`https://wa.me/${order.customer_whatsapp.replace(/\D/g, '')}`}
                              external
                            />
                          )}
                        </div>
                        {order.customer_note && (
                          <p className="text-sm text-muted-foreground border-t border-border pt-3 whitespace-pre-wrap">
                            {order.customer_note}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                          {!order.archived_at ? (
                            <Button type="button" variant="outline" size="sm" onClick={() => archiveOrder(order)}>
                              <Archive className="w-4 h-4 mr-1" /> Arquivar
                            </Button>
                          ) : (
                            <Button type="button" variant="outline" size="sm" onClick={() => unarchiveOrder(order)}>
                              Restaurar
                            </Button>
                          )}
                          <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => removeOrder(order)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Excluir
                          </Button>
                        </div>
                      </>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <Button type="button" variant="outline" onClick={loadOrders} disabled={loading || !userId} className="w-full">
            Atualizar pedidos
          </Button>
        </DialogContent>
      </Dialog>

      <PromptModal
        prompt={activePrompt}
        isOpen={!!activePrompt}
        onClose={() => setActivePrompt(null)}
      />
    </>
  );
}

function VolumeOff() {
  return <VolumeX className="w-4 h-4" />;
}

function Info({ icon, text, href, external }: { icon: ReactNode; text: string; href?: string; external?: boolean }) {
  const cls = 'flex items-center gap-2 rounded-md border border-border px-3 py-2 text-muted-foreground min-w-0 hover:text-foreground hover:border-primary/40 transition-colors';
  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className={cls}>
        {icon}
        <span className="truncate">{text}</span>
      </a>
    );
  }
  return (
    <div className={cls}>
      {icon}
      <span className="truncate">{text}</span>
    </div>
  );
}
