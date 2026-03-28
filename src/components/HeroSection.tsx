import { Search, Sparkles, Image, Tag, Layers, X, Loader2 } from 'lucide-react';
import logo from '@/assets/logo.png';
import { CATEGORIES } from '@/types/prompt';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalPrompts: number;
  isSearching?: boolean;
}

export function HeroSection({ searchQuery, onSearchChange, totalPrompts, isSearching }: HeroSectionProps) {
  const totalCategories = CATEGORIES.length - 1; // exclude 'all'

  return (
    <section className="pt-20 pb-10 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto text-center relative">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-wider text-primary leading-none mb-1">
            O ENSAIO
          </h1>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider text-foreground/80 leading-none">
            IMPOSSÍVEL
          </h2>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Explore e compartilhe os melhores prompts para gerar ensaios fotográficos incríveis com IA
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mb-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-primary">
              <Image className="w-4 h-4" />
              <span className="font-display text-2xl sm:text-3xl">{totalPrompts}</span>
            </div>
            <span className="text-xs text-muted-foreground mt-0.5">Ensaios</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-secondary">
              <Tag className="w-4 h-4" />
              <span className="font-display text-2xl sm:text-3xl">50+</span>
            </div>
            <span className="text-xs text-muted-foreground mt-0.5">Tags</span>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-accent">
              <Layers className="w-4 h-4" />
              <span className="font-display text-2xl sm:text-3xl">{totalCategories}</span>
            </div>
            <span className="text-xs text-muted-foreground mt-0.5">Categorias</span>
          </div>
        </div>
        
        {/* Search Box */}
        <div className="max-w-xl mx-auto">
          <div className="search-box p-1.5 flex gap-1.5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar ensaios, tags..."
                className="w-full h-10 pl-10 pr-9 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
              />
              {searchQuery.length > 0 && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground transition-opacity duration-200 opacity-70 hover:opacity-100"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button className="btn-gradient px-5 h-10 rounded-xl flex items-center gap-1.5 font-semibold text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Buscar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
