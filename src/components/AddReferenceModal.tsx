import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useReferences } from '@/hooks/useReferences';
import { useAuth } from '@/hooks/useAuth';
import { ImageUpload } from '@/components/ImageUpload';

interface AddReferenceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TYPES_BY_CATEGORY: Record<string, string[]> = {
  Shots: ['Distance & Size', 'Angles'],
  Movement: ['Basic Moves', 'Advanced Physical', 'Cinematic & AI'],
};

export function AddReferenceModal({ open, onOpenChange }: AddReferenceModalProps) {
  const { addReference } = useReferences();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Shots');
  const [type, setType] = useState('Distance & Size');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('');
  const [promptKeyword, setPromptKeyword] = useState('');
  const [promptExample, setPromptExample] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setCategory('Shots');
    setType('Distance & Size');
    setDescription('');
    setPurpose('');
    setPromptKeyword('');
    setPromptExample('');
    setImageUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !promptKeyword.trim()) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha o nome e as keywords do prompt.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addReference.mutateAsync({
        name: name.trim(),
        category,
        type,
        prompt_keyword: promptKeyword.trim(),
        description: description.trim() || undefined,
        purpose: purpose.trim() || undefined,
        prompt_example: promptExample.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        created_by: user?.id,
      });
      console.log('[ReferencesModule] Reference added successfully');
      toast({ title: 'Referência adicionada!', description: name });
      resetForm();
      onOpenChange(false);
    } catch (err) {
      console.error('[ReferencesModule] Failed to add reference:', err);
      toast({ title: 'Erro', description: 'Não foi possível adicionar a referência.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wide">Nova Referência</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ref-name">Nome *</Label>
            <Input id="ref-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Dutch Angle" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(v) => { setCategory(v); setType(TYPES_BY_CATEGORY[v]?.[0] || ''); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Shots">Shots</SelectItem>
                  <SelectItem value="Movement">Movement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(TYPES_BY_CATEGORY[category] || []).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="O que este plano/movimento faz..." rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Propósito / Efeito</Label>
            <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Ex: Cria tensão e desorientação" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref-keyword">Keywords do Prompt *</Label>
            <Input id="ref-keyword" value={promptKeyword} onChange={(e) => setPromptKeyword(e.target.value)} placeholder="Ex: Dutch Angle, Canted Angle" />
          </div>

          <div className="space-y-2">
            <Label>Exemplo de Prompt</Label>
            <Textarea value={promptExample} onChange={(e) => setPromptExample(e.target.value)} placeholder="Prompt completo de exemplo..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Imagem (URL ou Upload)</Label>
            <ImageUpload
              currentImageUrl={imageUrl}
              onImageChange={setImageUrl}
              bucket="prompt-images"
              folder="references"
            />
          </div>

          <Button type="submit" className="w-full btn-gradient" disabled={isSubmitting}>
            {isSubmitting ? 'Adicionando...' : 'Adicionar Referência'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
