import { useEffect, useState } from 'react';
import { Loader2, Package, Mail, Phone, User, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchPortfolioOrders, type PortfolioOrder } from '@/hooks/usePortfolio';
import { toast } from 'sonner';

interface PortfolioShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function PortfolioShopModal({ isOpen, onClose, userId }: PortfolioShopModalProps) {
  const [orders, setOrders] = useState<PortfolioOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const rows = await fetchPortfolioOrders(userId);
      setOrders(rows);
    } catch (error) {
      console.error('[PortfolioShop] load error', error);
      toast.error('Erro ao carregar pedidos da loja.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadOrders();
  }, [isOpen, userId]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto pb-24">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl tracking-wider flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> LOJA
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground">
            Nenhum pedido recebido ainda.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="border border-border rounded-lg bg-card p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">Pedido #{order.id.slice(0, 8)}</h3>
                      <Badge variant="secondary">{order.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit gap-1">
                    <ImageIcon className="w-3 h-3" /> {order.selected_image_urls.length} imagens
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {order.selected_image_urls.slice(0, 8).map((url, index) => (
                    <div key={`${order.id}-${index}`} className="aspect-square rounded-md overflow-hidden bg-muted border border-border">
                      <img src={url} alt={`Imagem ${index + 1} do pedido`} className="w-full h-full object-cover protected-image" draggable={false} />
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-3 gap-2 text-sm">
                  {order.customer_name && <Info icon={<User className="w-4 h-4" />} text={order.customer_name} />}
                  {order.customer_email && <Info icon={<Mail className="w-4 h-4" />} text={order.customer_email} />}
                  {order.customer_whatsapp && <Info icon={<Phone className="w-4 h-4" />} text={order.customer_whatsapp} />}
                </div>
                {order.customer_note && (
                  <p className="text-sm text-muted-foreground border-t border-border pt-3 whitespace-pre-wrap">
                    {order.customer_note}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}

        <Button type="button" variant="outline" onClick={loadOrders} disabled={loading || !userId} className="w-full">
          Atualizar pedidos
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-muted-foreground min-w-0">
      {icon}
      <span className="truncate">{text}</span>
    </div>
  );
}