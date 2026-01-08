import { Search, Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalPrompts: number;
}

export function HeroSection({ searchQuery, onSearchChange, totalPrompts }: HeroSectionProps) {
  return (
    <section className="pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      <div className="container mx-auto text-center relative">
        {/* Logo and Title */}
        <div className="mb-10">
          <div className="flex justify-center mb-6">
            <img 
              src={logo} 
              alt="Ensaios Impossíveis" 
              className="h-32 md:h-40 w-auto logo-particles drop-shadow-2xl"
            />
          </div>
          <h1 className="hero-title mb-2">
            <span className="hero-gradient-text">ENSAIOS</span>
          </h1>
          <h2 className="hero-title text-foreground/80">
            IMPOSSÍVEIS
          </h2>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore e compartilhe os melhores prompts para gerar ensaios fotográficos incríveis com IA
          </p>
        </div>
        
        {/* Search Box */}
        <div className="max-w-2xl mx-auto">
          <div className="search-box p-2 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar ensaios..."
                className="w-full h-12 pl-12 pr-4 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
              />
            </div>
            
            <button className="btn-gradient px-6 h-12 rounded-xl flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4" />
              Buscar
            </button>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{totalPrompts}</span> ensaios disponíveis
          </p>
        </div>
      </div>
    </section>
  );
}