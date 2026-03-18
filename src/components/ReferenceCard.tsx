import { Copy, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import type { CameraReference } from '@/types/reference';

interface ReferenceCardProps {
  reference: CameraReference;
  index: number;
}

export function ReferenceCard({ reference, index }: ReferenceCardProps) {
  const handleCopy = async () => {
    const text = `Keywords: ${reference.prompt_keyword}\n\n${reference.prompt_example || ''}`.trim();
    try {
      await navigator.clipboard.writeText(text);
      console.log('[ReferencesModule] Copied prompt for:', reference.name);
      toast({ title: 'Prompt copiado!', description: reference.name });
    } catch (err) {
      console.error('[ReferencesModule] Copy failed:', err);
      toast({ title: 'Erro ao copiar', description: 'Não foi possível copiar o prompt.', variant: 'destructive' });
    }
  };

  return (
    <div
      className="group relative bg-card/60 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/30 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, animationFillMode: 'both' }}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {reference.image_url ? (
          <img
            src={reference.image_url}
            alt={reference.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
        {/* Category badge overlay */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm border-0">
            {reference.category}
          </Badge>
          <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur-sm border-0">
            {reference.type}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-display text-lg leading-tight tracking-wide text-foreground">
          {reference.name}
        </h3>
        {reference.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {reference.description}
          </p>
        )}
        {reference.purpose && (
          <p className="text-xs text-primary/80 italic line-clamp-1">
            {reference.purpose}
          </p>
        )}

        {/* Keywords */}
        <div className="flex flex-wrap gap-1 pt-1">
          {reference.prompt_keyword.split(',').map((kw, i) => (
            <span
              key={i}
              className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary"
            >
              {kw.trim()}
            </span>
          ))}
        </div>

        {/* Copy button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 gap-2 text-xs"
          onClick={handleCopy}
        >
          <Copy className="w-3.5 h-3.5" />
          Copiar Prompt
        </Button>
      </div>
    </div>
  );
}
