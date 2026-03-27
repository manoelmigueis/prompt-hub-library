import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Upload, ExternalLink } from 'lucide-react';
import { useState, useRef } from 'react';
import { TOOL_CATEGORIES, ToolCategory, CreateToolData } from '@/hooks/useTools';
import { supabase } from '@/integrations/supabase/client';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateToolData) => Promise<boolean>;
}

export function AddToolModal({ isOpen, onClose, onSubmit }: AddToolModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ToolCategory>('ia-imagem');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `tools/${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('prompt-images').upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('prompt-images').getPublicUrl(data.path);
      setImageUrl(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !url.trim()) return;
    setSubmitting(true);
    const success = await onSubmit({ name, url, description, category, imageUrl: imageUrl || undefined, isFeatured });
    setSubmitting(false);
    if (success) {
      setName(''); setUrl(''); setDescription(''); setCategory('ia-imagem'); setImageUrl(''); setIsFeatured(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wider">Adicionar Ferramenta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: ChatGPT, Midjourney..." className="h-11 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>URL *</Label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="h-11 pl-10 rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descrição da ferramenta..." className="rounded-xl resize-y min-h-[80px]" />
          </div>

          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={category} onValueChange={v => setCategory(v as ToolCategory)}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TOOL_CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Imagem (opcional)</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 transition-colors"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{uploading ? 'Enviando...' : 'Clique para fazer upload'}</p>
                </>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-xl">
            <div>
              <p className="text-sm font-medium">Destacar</p>
              <p className="text-xs text-muted-foreground">Mostrar em destaque na lista</p>
            </div>
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
          </div>

          <Button onClick={handleSubmit} disabled={submitting || !name.trim() || !url.trim()} className="w-full h-12 btn-gradient rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            {submitting ? 'Adicionando...' : 'Adicionar Ferramenta'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}