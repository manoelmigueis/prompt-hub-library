import { useState } from 'react';
import { Copy, Camera, Pencil, Trash2, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import type { CameraReference } from '@/types/reference';

interface ReferenceCardProps {
  reference: CameraReference;
  index: number;
  isAdmin?: boolean;
  onEdit?: (reference: CameraReference) => void;
  onDelete?: (id: string) => void;
}

export function ReferenceCard({ reference, index, isAdmin, onEdit, onDelete }: ReferenceCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const handleCopy = async () => {
    const text = `Keywords: ${reference.prompt_keyword}\n\n${reference.prompt_example || ''}`.trim();
    try {
      await navigator.clipboard.writeText(text);
      console.log('[ReferencesModule] Copied prompt for:', reference.name);
      toast({ title: 'Prompt copiado!', description: reference.name });
    } catch (err) {
      console.error('[ReferencesModule] Copy failed:', err);
      toast({ title: 'Erro ao copiar', description: 'Não foi possível copiar o prompt.', variant: 'destructive' });
    }
  };

  const handleDelete = () => {
    onDelete?.(reference.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className="group relative bg-card/60 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:border-primary/30 animate-in fade-in slide-in-from-bottom-4"
        style={{ animationDelay: `${Math.min(index * 50, 500)}ms`, animationFillMode: 'both' }}
      >
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-muted cursor-pointer" onClick={() => reference.image_url && setShowLightbox(true)}>
          {reference.image_url ? (
            <>
              <img
                src={reference.image_url}
                alt={reference.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Zoom overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Maximize className="w-6 h-6 text-white drop-shadow-lg" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-muted-foreground/40" />
            </div>
          )}

          {/* Category badge overlay */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm border-0">
              {reference.category}
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-background/80 backdrop-blur-sm border-0">
              {reference.type}
            </Badge>
          </div>

          {/* Admin actions overlay */}
          {isAdmin && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(reference); }}
                className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-foreground" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm hover:bg-destructive/80 hover:text-destructive-foreground transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-display text-lg leading-tight tracking-wide text-foreground">
            {reference.name}
          </h3>
          {reference.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {reference.description}
            </p>
          )}

          {/* Portuguese explanation */}
          {reference.pt_explanation && (
            <div className="pt-1">
              <p className="text-[11px] font-medium text-primary/70 mb-0.5">Como usar:</p>
              <p className="text-xs text-muted-foreground/80 italic line-clamp-3">
                {reference.pt_explanation}
              </p>
            </div>
          )}

          {/* Keywords */}
          <div className="flex flex-wrap gap-1 pt-1">
            {reference.prompt_keyword.split(',').map((kw, i) => (
              <span
                key={i}
                className="inline-block px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary"
              >
                {kw.trim()}
              </span>
            ))}
          </div>

          {/* Copy button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 gap-2 text-xs"
            onClick={handleCopy}
          >
            <Copy className="w-3.5 h-3.5" />
            Copiar Prompt
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir referência?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{reference.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox / Zoom modal */}
      <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] p-0 bg-black/90 border-0 overflow-hidden flex items-center justify-center">
          {reference.image_url && (
            <img
              src={reference.image_url}
              alt={reference.name}
              className="max-w-full max-h-[85vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
