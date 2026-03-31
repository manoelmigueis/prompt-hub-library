import { Prompt, CATEGORIES } from '@/types/prompt';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Instagram, Eye, Heart, X, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface PromptModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onCopy?: (id: string) => void;
  isAdmin?: boolean;
}

export function PromptModal({ prompt, isOpen, onClose, isFavorite, onToggleFavorite, onCopy, isAdmin }: PromptModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!prompt) return null;

  const categoryLabel = CATEGORIES.find((c) => c.id === prompt.category)?.labelPt || prompt.category;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    onCopy?.(prompt.id);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="flex flex-col md:flex-row">
          {/* Left: Image */}
          <div className="relative md:w-1/2 bg-black flex items-center justify-center min-h-[300px]">
            {prompt.imageUrl && (
              <img
                src={prompt.imageUrl}
                alt={prompt.title}
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            )}
            {/* Category badge */}
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 text-xs">
              {categoryLabel}
            </Badge>
            {/* Counters bottom */}
            <div className="absolute bottom-3 left-3 flex items-center gap-3">
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Eye className="w-3.5 h-3.5" />
                {prompt.viewCount} views
              </div>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <Copy className="w-3.5 h-3.5" />
                {prompt.copyCount} cópias
              </div>
              <button
                onClick={() => onToggleFavorite?.(prompt.id)}
                className={`flex items-center gap-1 text-xs ${isFavorite ? 'text-primary' : 'text-white/80 hover:text-primary'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Right: Content */}
          <div className="md:w-1/2 p-5 flex flex-col">
            {/* Close button */}
            <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10">
              <X className="w-5 h-5" />
            </button>

            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={prompt.authorAvatar} alt={prompt.author} />
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                  {prompt.author.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{prompt.author}</p>
                <p className="text-xs text-muted-foreground">Criador do prompt</p>
              </div>
            </div>

            {/* Social Links */}
            {prompt.authorHandle && (
              <div className="flex flex-wrap gap-2 mb-4">
                <a
                  href={`https://instagram.com/${prompt.authorHandle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted text-xs rounded-full hover:bg-muted/80 transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  Instagram
                </a>
              </div>
            )}

            {/* Title & Description */}
            <h2 className="font-display text-xl tracking-wide mb-2">{prompt.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">{prompt.description}</p>

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {prompt.tags.map((tag) => (
                  <span key={tag} className="text-xs text-primary/80 bg-primary/10 rounded-full px-2.5 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Prompt Content */}
            <div className="flex-1">
              <h3 className="font-display font-bold text-xs uppercase mb-2 text-muted-foreground">PROMPT COMPLETO</h3>
              <div className="bg-muted rounded-lg p-3 border border-border max-h-[200px] overflow-y-auto">
                <p className="text-xs leading-relaxed whitespace-pre-wrap font-mono">{prompt.content}</p>
              </div>
            </div>

            {/* Download Button - Admin Only */}
            {isAdmin && prompt.imageUrl && (
              <Button
                variant="outline"
                className="w-full mt-4 gap-2 h-11 bg-muted/50 border-border hover:bg-muted transition-colors"
                disabled={isDownloading}
                onClick={async () => {
                  try {
                    setIsDownloading(true);
                    console.log('[ImageDetails - Download] Starting download for:', prompt.imageUrl);
                    const response = await fetch(prompt.imageUrl!);
                    if (!response.ok) throw new Error('Falha ao baixar imagem');
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${prompt.title || 'image'}.${blob.type.split('/')[1] || 'png'}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success('Download iniciado!');
                    console.log('[ImageDetails - Download] Success');
                  } catch (err) {
                    console.error('[ImageDetails - Download] Error:', err);
                    toast.error('Erro ao baixar imagem');
                  } finally {
                    setIsDownloading(false);
                  }
                }}
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Baixar Imagem em Alta Qualidade
              </Button>
            )}

            {/* Copy Button */}
            <Button className="w-full mt-4 gap-2 btn-gradient h-11" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Prompt'}
            </Button>

            {/* SEO Description */}
            <p className="text-[11px] text-muted-foreground mt-3 italic">{prompt.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
