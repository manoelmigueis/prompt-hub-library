import { Prompt } from '@/types/prompt';
import { Check, Copy, Instagram, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useImageAspectRatio, getAspectRatioLabel } from '@/hooks/useImageAspectRatio';
import { Badge } from '@/components/ui/badge';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const { ratio, className: aspectClassName, loading } = useImageAspectRatio(prompt.imageUrl);
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: prompt.title,
        text: `Confira este prompt incrível: ${prompt.title}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy URL
      navigator.clipboard.writeText(window.location.href);
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };
  
  return (
    <article 
      className="prompt-card cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${loading ? 'aspect-[4/3]' : aspectClassName}`}>
        {prompt.imageUrl ? (
          <img 
            src={prompt.imageUrl} 
            alt={prompt.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none select-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-6xl opacity-50">📷</span>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Aspect Ratio Badge */}
        {!loading && ratio !== 'unknown' && (
          <Badge 
            variant="secondary" 
            className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white border-0 text-xs"
          >
            {ratio}
          </Badge>
        )}
        
        {/* Featured Badge */}
        {prompt.isFeatured && (
          <div className="absolute top-3 right-3 badge-featured">
            ⭐ DESTAQUE
          </div>
        )}
        
        {/* Status Badge for pending */}
        {prompt.status === 'pending' && (
          <div className="absolute top-3 left-3 badge-pending">
            PENDENTE
          </div>
        )}
        
        {/* Hover actions */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1 gap-2 bg-white/90 text-foreground hover:bg-white"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar Prompt'}
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="icon" 
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={handleShare}
              >
                <Send className="w-3 h-3 text-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Compartilhar</TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Author & Date */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{prompt.author}</span>
            {prompt.authorHandle && (
              <a 
                href={`https://instagram.com/${prompt.authorHandle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <Instagram className="w-3 h-3" />
                {prompt.authorHandle}
              </a>
            )}
          </div>
          <span className="text-xs">{formatDate(prompt.createdAt)}</span>
        </div>
        
        {/* Title */}
        <h3 className="font-display text-xl tracking-wide leading-tight group-hover:text-primary transition-colors">
          {prompt.title.toUpperCase()}
        </h3>
        
        {/* Description */}
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {prompt.description}
        </p>
      </div>
    </article>
  );
}
