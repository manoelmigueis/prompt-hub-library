import { Prompt } from '@/types/prompt';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
      <div className="relative aspect-video overflow-hidden">
        {prompt.imageUrl ? (
          <img 
            src={prompt.imageUrl} 
            alt={prompt.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-4xl">🍌</span>
          </div>
        )}
        
        {/* Featured Badge */}
        {prompt.isFeatured && (
          <div className="absolute top-3 right-3 badge-featured">
            EM DESTAQUE
          </div>
        )}
        
        {/* Status Badge for pending */}
        {prompt.status === 'pending' && (
          <div className="absolute top-3 left-3 badge-pending">
            PENDENTE
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Tags Row */}
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 uppercase">
            Prompt
          </span>
          <span className="border border-primary text-xs font-semibold px-2 py-1 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Original
          </span>
        </div>
        
        {/* Author & Date */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>
            POR <a href="#" className="text-foreground font-semibold hover:underline">{prompt.authorHandle || prompt.author}</a>
          </span>
          <span className="font-mono text-xs">{formatDate(prompt.createdAt)}</span>
        </div>
        
        {/* Title */}
        <h3 className="font-display font-bold text-lg leading-tight mb-3 group-hover:text-coral-dark transition-colors">
          {prompt.title}
        </h3>
        
        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 gap-2"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </article>
  );
}
