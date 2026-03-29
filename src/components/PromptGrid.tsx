import { Prompt } from '@/types/prompt';
import { PromptCard } from './PromptCard';
import { Camera, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PromptGridProps {
  prompts: Prompt[];
  onPromptClick: (prompt: Prompt) => void;
  onCopyPrompt: (id: string) => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
  isAdmin?: boolean;
  onEditPrompt?: (prompt: Prompt) => void;
}

export function PromptGrid({ prompts, onPromptClick, onCopyPrompt, isFavorite, onToggleFavorite, isAdmin, onEditPrompt }: PromptGridProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  if (prompts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="glass-card max-w-md mx-auto p-12">
          <Camera className="w-16 h-16 mx-auto mb-4 text-primary/50" />
          <h3 className="font-display text-2xl tracking-wider mb-2">NENHUM ENSAIO</h3>
          <p className="text-muted-foreground">Tente ajustar seus filtros ou busca</p>
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
