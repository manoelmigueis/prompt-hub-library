import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserPromptOption } from '@/hooks/usePortfolio';

interface Props {
  prompts: UserPromptOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxItems?: number;
}

export function PortfolioImageGrid({ prompts, selectedIds, onToggle, maxItems = 20 }: Props) {
  const selectedSet = new Set(selectedIds);

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
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-xs text-white truncate">{p.title}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
