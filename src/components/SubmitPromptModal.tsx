import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { CATEGORIES, Category } from '@/types/prompt';
import { useState } from 'react';
import { Send, Image, Link, Sparkles, Tag, Loader2 } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubmitPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitPromptData) => void;
}

export interface SubmitPromptData {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  category: Category;
  tags?: string[];
}

type ImageInputMode = 'upload' | 'url';

export function SubmitPromptModal({ isOpen, onClose, onSubmit }: SubmitPromptModalProps) {
  const [formData, setFormData] = useState<SubmitPromptData>({
    title: '',
    description: '',
    content: '',
    imageUrl: '',
    category: 'profile',
    tags: [],
  });
  const [imageInputMode, setImageInputMode] = useState<ImageInputMode>('upload');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWithAI = async () => {
    if (!formData.content.trim()) {
      toast({
        title: "Prompt vazio",
        description: "Escreva o prompt primeiro para gerar título e descrição com IA.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-prompt-meta', {
        body: { prompt: formData.content },
      });

      if (error) throw error;

      const validCategories = ['retrato-realista','foto-artistica','moda-estilo','cenarios','profile','social-media','video-effect','body-art','fotografia','arte-digital','infographic','youtube','comics','poster','app-design','logo-marca','outro'];

      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        tags: data.tags || prev.tags,
        category: (data.category && validCategories.includes(data.category)) ? data.category as Category : prev.category,
      }));

      toast({
        title: "✨ Gerado com IA",
        description: "Título, descrição e tags preenchidos automaticamente!",
      });
    } catch (err: any) {
      console.error('AI generation error:', err);
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar com IA. Preencha manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      content: '',
      imageUrl: '',
      category: 'profile',
      tags: [],
    });
    onClose();
  };

  const handleImageUploadError = (error: string) => {
    toast({
      title: "Erro no upload",
      description: error,
      variant: "destructive",
    });
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      imageUrl: '',
      category: 'profile',
      tags: [],
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <span className="text-2xl">🍌</span>
            Enviar Novo Prompt
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt content FIRST so AI can use it */}
          <div className="space-y-2">
            <Label htmlFor="content">Prompt Completo</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Cole aqui o prompt completo que será usado para gerar imagens..."
              required
              className="min-h-[150px] border-2 border-primary font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Category }))}
            >
              <SelectTrigger className="border-2 border-primary">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.labelPt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* AI Generate button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerateWithAI}
            disabled={isGenerating || !formData.content.trim()}
            className="w-full gap-2 border-primary/50 hover:bg-primary/10"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-primary" />
            )}
            {isGenerating ? 'Gerando com IA...' : 'Preencher título, descrição e tags com IA'}
          </Button>

          <div className="space-y-2">
            <Label htmlFor="title">Título do Prompt</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Cartão de citação com retrato estilizado"
              required
              className="border-2 border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição SEO</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Uma breve descrição otimizada para SEO"
              required
              className="border-2 border-primary"
            />
          </div>

          {/* Tags */}
          {formData.tags && formData.tags.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Imagem de Exemplo (opcional)
              </Label>
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    imageInputMode === 'upload' 
                      ? 'bg-card text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                    imageInputMode === 'url' 
                      ? 'bg-card text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Link className="w-3 h-3" />
                  URL
                </button>
              </div>
            </div>

            {imageInputMode === 'upload' ? (
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                onError={handleImageUploadError}
              />
            ) : (
              <div className="space-y-3">
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="border-2 border-primary"
                />
                {formData.imageUrl && (
                  <div className="relative rounded-lg overflow-hidden border-2 border-primary">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover pointer-events-none select-none"
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        handleImageUploadError("Não foi possível carregar a imagem. Verifique a URL.");
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block';
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4 pb-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="generate" className="flex-1 gap-2">
              <Send className="w-4 h-4" />
              Enviar para Revisão
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
