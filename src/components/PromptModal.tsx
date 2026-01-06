import { Prompt } from '@/types/prompt';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, ExternalLink, X } from 'lucide-react';
import { useState } from 'react';

interface PromptModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptModal({ prompt, isOpen, onClose }: PromptModalProps) {
  const [copied, setCopied] = useState(false);
  
  if (!prompt) return null;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl pr-8">{prompt.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image */}
          {prompt.imageUrl && (
            <div className="rounded-lg overflow-hidden border-2 border-primary">
              <img 
                src={prompt.imageUrl} 
                alt={prompt.title}
                className="w-full h-auto"
              />
            </div>
          )}
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="bg-primary text-primary-foreground px-3 py-1 font-bold uppercase">
              Prompt
            </span>
            {prompt.isFeatured && (
              <span className="badge-featured">Em Destaque</span>
            )}
            <span className="text-muted-foreground">
              por <strong className="text-foreground">{prompt.author}</strong>
            </span>
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground">{prompt.description}</p>
          
          {/* Prompt Content */}
          <div className="bg-muted rounded-lg p-4 border-2 border-primary">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold text-sm uppercase">Prompt Completo</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-mono">
              {prompt.content}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="generate" className="flex-1">
              Usar Este Prompt
            </Button>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Ver Original
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
