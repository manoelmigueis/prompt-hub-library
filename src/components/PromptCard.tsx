import { Prompt } from '@/types/prompt';
import { Check, Copy, Send, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  
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
        text: `Confira este prompt: ${prompt.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const isNew = (Date.now() - prompt.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000;
  
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
        
        {/* Author badge overlay */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-background/80 backdrop-blur-sm rounded-full pl-1 pr-2.5 py-1">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[11px] font-medium text-foreground truncate max-w-[100px]">
            {prompt.author}
          </span>
        </div>
        
        {/* New / Featured badge */}
        {isNew && (
          <Badge className="absolute top-2.5 right-2.5 bg-primary text-primary-foreground border-0 text-[10px] px-2 py-0.5">
            Novo
          </Badge>
        )}
        {prompt.isFeatured && !isNew && (
          <Badge className="absolute top-2.5 right-2.5 bg-secondary text-secondary-foreground border-0 text-[10px] px-2 py-0.5">
            ⭐ Destaque
          </Badge>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-display text-base tracking-wide leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {prompt.title.toUpperCase()}
        </h3>
        
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 flex-1">
          {prompt.description}
        </p>
        
        {/* Action buttons - always visible */}
        <div className="flex gap-2 mt-3">
          <Button 
            size="sm" 
            className="flex-1 gap-1.5 h-8 text-xs btn-gradient rounded-lg"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar Prompt'}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 rounded-lg shrink-0"
            onClick={handleShare}
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </article>
  );
}
