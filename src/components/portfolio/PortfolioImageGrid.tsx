import { useEffect, useState } from 'react';
import { Check, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserPromptOption } from '@/hooks/usePortfolio';

interface Props {
  prompts: UserPromptOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxItems?: number;
}

export function PortfolioImageGrid({ prompts, selectedIds, onToggle, maxItems = 40 }: Props) {
  const selectedSet = new Set(selectedIds);
  const [expandedImage, setExpandedImage] = useState<UserPromptOption | null>(null);

  useEffect(() => {
    if (!expandedImage) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpandedImage(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expandedImage]);

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
        Você ainda não tem prompts aprovados. Envie e aguarde aprovação para montar seu portfólio.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {prompts.map((p) => {
        const isSelected = selectedSet.has(p.id);
        const disabled = !isSelected && selectedIds.length >= maxItems;
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(p.id)}
            className={cn(
              'group relative aspect-square overflow-hidden rounded-lg border-2 transition-all bg-muted',
              isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50',
              disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">
                {p.title}
              </div>
            )}
            {isSelected && (
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                <Check className="w-4 h-4" />
              </div>
            )}
            {p.image_url && (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  console.log('[PortfolioModal] opening builder image', p.id);
                  setExpandedImage(p);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    setExpandedImage(p);
                  }
                }}
                className="absolute top-2 left-2 bg-background/80 backdrop-blur rounded-full w-7 h-7 flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-foreground"
                aria-label={`Ampliar ${p.title}`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-xs text-white truncate">{p.title}</p>
            </div>
          </button>
        );
      })}
      {expandedImage?.image_url && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => {
            console.log('[PortfolioModal] closing builder image via overlay');
            setExpandedImage(null);
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              console.log('[PortfolioModal] closing builder image via X');
              setExpandedImage(null);
            }}
            className="fixed top-4 right-4 z-[90] inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-card-foreground border border-border shadow-lg hover:bg-primary hover:text-primary-foreground"
            aria-label="Fechar imagem"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={expandedImage.image_url}
            alt={expandedImage.title}
            className="max-h-full max-w-full object-contain rounded-lg protected-image"
            draggable={false}
            onClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.preventDefault()}
          />
        </div>
      )}
    </div>
  );
}
