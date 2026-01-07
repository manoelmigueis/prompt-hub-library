import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, Category } from '@/types/prompt';
import { useState } from 'react';
import { Send, Image, Link } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { toast } from '@/hooks/use-toast';

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
}

type ImageInputMode = 'upload' | 'url';

export function SubmitPromptModal({ isOpen, onClose, onSubmit }: SubmitPromptModalProps) {
  const [formData, setFormData] = useState<SubmitPromptData>({
    title: '',
    description: '',
    content: '',
    imageUrl: '',
    category: 'profile',
  });
  const [imageInputMode, setImageInputMode] = useState<ImageInputMode>('upload');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      content: '',
      imageUrl: '',
      category: 'profile',
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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <span className="text-2xl">🍌</span>
            Enviar Novo Prompt
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="description">Descrição curta</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Uma breve descrição do que o prompt cria"
              required
              className="border-2 border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
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
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
                className="border-2 border-primary"
              />
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
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
