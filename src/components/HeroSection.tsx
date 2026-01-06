import { Search, Sparkles, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalPrompts: number;
}

export function HeroSection({ searchQuery, onSearchChange, totalPrompts }: HeroSectionProps) {
  return (
    <section className="pt-24 pb-12 px-4">
      <div className="container mx-auto text-center">
        {/* Title */}
        <div className="mb-8">
          <h1 className="hero-title mb-4">
            PROMPT
            <span className="floating-banana inline-block mx-2">🍌</span>
            HUB
          </h1>
          <div className="hero-subtitle">
            PROMPTS
          </div>
        </div>
        
        {/* Search Box */}
        <div className="max-w-3xl mx-auto">
          <div className="search-box p-2 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Descreva a imagem que você deseja gerar..."
                className="w-full h-14 pl-12 pr-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-lg"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="gap-2 h-14">
                <Sparkles className="w-4 h-4" />
                Automático
              </Button>
              <Button variant="outline" size="lg" className="gap-2 h-14">
                <Shuffle className="w-4 h-4" />
                Aleatório
              </Button>
              <Button variant="generate" className="h-14">
                <Sparkles className="w-5 h-5" />
                GERAR
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
