import { Prompt } from '@/types/prompt';
import { Check, Copy, Eye, Heart, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
  onCopy: (id: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export function PromptCard({ prompt, onClick, onCopy, isFavorite, onToggleFavorite }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    onCopy(prompt.id);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(prompt.id);
  };

  const isNew = (Date.now() - prompt.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000;
  
  // Get category label
  const getCategoryLabel = () => {
    const labels: Record<string, string> = {
      'retrato-realista': 'Retrato Realista',
      'foto-artistica': 'Foto Artística',
      'moda-estilo': 'Moda & Estilo',
      'cenarios': 'Cenários',
      'profile': 'Perfil',
      'social-media': 'Mídias Sociais',
      'video-effect': 'Video Effect',
      'body-art': 'Body Painting',
      'fotografia': 'Fotografia',
      'arte-digital': 'Arte Digital',
      'infographic': 'Infográfico',
      'youtube': 'YouTube',
      'comics': 'Quadrinhos',
      'poster': 'Pôster',
      'app-design': 'Design App',
      'logo-marca': 'Logo / Marca',
      'outro': 'Outro',
    };
    return labels[prompt.category] || prompt.category;
  };
  
  return (
    <article 
      className="prompt-card cursor-pointer group flex flex-col"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {prompt.imageUrl ? (
          <img 
            src={prompt.imageUrl} 
            alt={prompt.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-5xl opacity-50">📷</span>
          </div>
        )}
        
        {/* Category badge */}
        <Badge className="absolute top-2.5 left-2.5 bg-primary text-primary-foreground border-0 text-[10px] px-2 py-0.5">
          {getCategoryLabel()}
        </Badge>
        
        {/* Counters top right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-background/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-[11px] text-foreground">
            <Eye className="w-3 h-3" />
            {prompt.viewCount}
          </div>
          <div className="flex items-center gap-1 bg-background/70 backdrop-blur-sm rounded-full px-2 py-0.5 text-[11px] text-foreground">
            <Copy className="w-3 h-3" />
            {prompt.copyCount}
          </div>
          <button
            onClick={handleFavorite}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] transition-colors ${
              isFavorite 
                ? 'bg-primary/90 text-primary-foreground' 
                : 'bg-background/70 backdrop-blur-sm text-foreground hover:bg-primary/50'
            }`}
          >
            <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Author */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground truncate">
            {prompt.author}
            {prompt.authorHandle && <span className="text-primary/70 ml-1">{prompt.authorHandle}</span>}
          </span>
        </div>

        <h3 className="font-display text-sm tracking-wide leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {prompt.title}
        </h3>
        
        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 flex-1">
          {prompt.description}
        </p>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {prompt.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] text-primary/80 bg-primary/10 rounded-full px-2 py-0.5">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Copy button */}
        <div className="mt-3">
          <Button 
            size="sm" 
            className="w-full gap-1.5 h-8 text-xs btn-gradient rounded-lg"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar Prompt'}
          </Button>
        </div>
      </div>
    </article>
  );
}
