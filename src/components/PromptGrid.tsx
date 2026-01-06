import { Prompt } from '@/types/prompt';
import { PromptCard } from './PromptCard';

interface PromptGridProps {
  prompts: Prompt[];
  onPromptClick: (prompt: Prompt) => void;
}

export function PromptGrid({ prompts, onPromptClick }: PromptGridProps) {
  if (prompts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🍌</div>
        <h3 className="font-display text-2xl font-bold mb-2">Nenhum prompt encontrado</h3>
        <p className="text-muted-foreground">Tente ajustar seus filtros ou busca</p>
      </div>
    );
  }
  
  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt, index) => (
            <div 
              key={prompt.id} 
              className={`slide-up stagger-${(index % 4) + 1}`}
              style={{ opacity: 0 }}
            >
              <PromptCard 
                prompt={prompt} 
                onClick={() => onPromptClick(prompt)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
