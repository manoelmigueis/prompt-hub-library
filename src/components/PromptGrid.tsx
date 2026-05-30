import { Prompt } from '@/types/prompt';
import { PromptCard } from './PromptCard';
import { Camera, LayoutGrid, List, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 24;

interface PromptGridProps {
  prompts: Prompt[];
  onPromptClick: (prompt: Prompt) => void;
  onCopyPrompt: (id: string) => void | Promise<void>;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  isAdmin?: boolean;
  onEditPrompt?: (prompt: Prompt) => void;
  isSearching?: boolean;
  hasSearchQuery?: boolean;
}
  prompts: Prompt[];
  onPromptClick: (prompt: Prompt) => void;
  onCopyPrompt: (id: string) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  isAdmin?: boolean;
  onEditPrompt?: (prompt: Prompt) => void;
  isSearching?: boolean;
  hasSearchQuery?: boolean;
}

export function PromptGrid({ prompts, onPromptClick, onCopyPrompt, isFavorite, onToggleFavorite, isAdmin, onEditPrompt, isSearching = false, hasSearchQuery = false }: PromptGridProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  if (isSearching && hasSearchQuery) {
    return (
      <section id="novos" className="py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl tracking-wider flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              Buscando prompts...
            </h2>
          </div>

          <div className={
            view === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-3"
          }>
            {Array.from({ length: view === 'grid' ? 4 : 3 }).map((_, index) => (
              <div key={index} className="prompt-card overflow-hidden animate-pulse">
                <div className={view === 'grid' ? 'aspect-[4/5] bg-muted' : 'h-24 bg-muted'} />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-24 rounded-full bg-muted" />
                  <div className="h-4 w-3/4 rounded-full bg-muted" />
                  <div className="h-3 w-full rounded-full bg-muted" />
                  <div className="h-8 w-full rounded-lg bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="glass-card max-w-md mx-auto p-12">
          <Camera className="w-16 h-16 mx-auto mb-4 text-primary/50" />
          <h3 className="font-display text-2xl tracking-wider mb-2">
            {hasSearchQuery ? 'NENHUM RESULTADO' : 'NENHUM ENSAIO'}
          </h3>
          <p className="text-muted-foreground">
            {hasSearchQuery ? 'Nenhum prompt encontrado para esta busca' : 'Tente ajustar seus filtros ou busca'}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <section id="novos" className="py-6 px-4">
      <div className="container mx-auto">
        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl tracking-wider">
            <span className="text-primary">{prompts.length}</span> prompts disponíveis
          </h2>
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            <Button 
              variant={view === 'grid' ? 'default' : 'ghost'} 
              size="icon" 
              className="h-7 w-7 rounded-md"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant={view === 'list' ? 'default' : 'ghost'} 
              size="icon" 
              className="h-7 w-7 rounded-md"
              onClick={() => setView('list')}
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className={
          view === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "flex flex-col gap-3"
        }>
          {prompts.map((prompt, index) => (
            <div 
              key={prompt.id} 
              className={`slide-up stagger-${(index % 4) + 1}`}
              style={{ opacity: 0 }}
            >
              <PromptCard 
                prompt={prompt} 
                onClick={() => onPromptClick(prompt)}
                onCopy={onCopyPrompt}
                isFavorite={isFavorite(prompt.id)}
                onToggleFavorite={onToggleFavorite}
                isAdmin={isAdmin}
                onEdit={onEditPrompt}
                layout={view}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
