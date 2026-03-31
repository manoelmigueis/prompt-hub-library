import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ImageUpload';
import { Prompt, Category, CATEGORIES } from '@/types/prompt';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface EditPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onSave: (id: string, updates: { title?: string; description?: string; content?: string; category?: Category; imageUrl?: string }) => Promise<boolean>;
}

export function EditPromptModal({ isOpen, onClose, prompt, onSave }: EditPromptModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Category>('outro');
  const [imageUrl, setImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (prompt && isOpen) {
      setTitle(prompt.title);
      setDescription(prompt.description);
      setContent(prompt.content);
      setCategory(prompt.category);
      setImageUrl(prompt.imageUrl || '');
    }
  }, [prompt, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || isSaving || isUploadingImage) return;

    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setIsSaving(true);
    console.log('[EditPromptModal] Submitting edits for:', prompt.id);

    const success = await onSave(prompt.id, {
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      category,
      imageUrl: imageUrl.trim(),
    });

    setIsSaving(false);
    if (success) {
      toast.success('Ensaio atualizado com sucesso!');
      onClose();
    }
  };

  const editableCategories = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider">EDITAR ENSAIO</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image */}
          <div className="space-y-2">
            <Label>Imagem</Label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              onUploadingChange={setIsUploadingImage}
              bucket="prompt-images"
              maxSizeMB={20}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              maxLength={200}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)} disabled={isSaving}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {editableCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.labelPt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Descrição</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Content / Prompt */}
          <div className="space-y-2">
            <Label htmlFor="edit-content">Prompt</Label>
            <Textarea
              id="edit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSaving}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 pb-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-gradient min-h-[48px]"
              disabled={isSaving || isUploadingImage}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 flex-shrink-0" />
                  <span className="truncate">Salvando...</span>
                </>
              ) : isUploadingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 flex-shrink-0" />
                  <span className="truncate">Enviando...</span>
                </>
              ) : (
                <span>Salvar Alterações</span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
