import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Copy, Trash2, Pencil, Link2, Image as ImageIcon, Loader2, X, Search, Upload, Eye } from 'lucide-react';
import { expandSearchTerms } from '@/lib/searchTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  PortfolioCollection,
  usePortfolioCollections,
} from '@/hooks/usePortfolioCollections';
import type { UserPromptOption } from '@/hooks/usePortfolio';

interface Props {
  userId?: string;
  username?: string;
  prompts: UserPromptOption[];
}

const MAX_IMAGES = 40;

export function CollectionsPanel({ userId, username, prompts }: Props) {
  const {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    duplicateCollection,
    fetchCollectionImages,
  } = usePortfolioCollections(userId);

  const [editing, setEditing] = useState<PortfolioCollection | null>(null);
  const [creating, setCreating] = useState(false);

  const promptMap = useMemo(() => {
    const m = new Map<string, UserPromptOption>();
    prompts.forEach((p) => m.set(p.id, p));
    return m;
  }, [prompts]);

  const handleCopyLink = (c: PortfolioCollection) => {
    if (!username) {
      toast.error('Defina seu nome de usuário acima para gerar links públicos.');
      return;
    }
    const url = `${window.location.origin}/ensaio/${username}/${c.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copiado!');
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl tracking-wider mb-1">MEUS ENSAIOS</h2>
          <p className="text-sm text-muted-foreground">
            Pacotes prontos reutilizáveis. Crie uma vez, compartilhe sempre.
          </p>
        </div>
        <Button
          onClick={() => setCreating(true)}
          className="gap-2"
          disabled={!userId}
        >
          <Plus className="w-4 h-4" /> Novo Ensaio
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="font-display text-lg">Você ainda não criou nenhum ensaio</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Salve seleções recorrentes como pacotes prontos.
          </p>
          <Button onClick={() => setCreating(true)} disabled={!userId} className="gap-2">
            <Plus className="w-4 h-4" /> Criar primeiro ensaio
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((c) => (
            <article
              key={c.id}
              className="group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/60 transition-all"
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                {c.cover_image_url ? (
                  <img
                    src={c.cover_image_url}
                    alt={c.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-display text-lg tracking-wide truncate">{c.title}</h3>
                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.description}</p>
                )}
                <p className="text-[11px] text-muted-foreground mt-2">
                  {c.image_count ?? 0} {c.image_count === 1 ? 'foto' : 'fotos'} • /{c.slug}
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => setEditing(c)}>
                    <Pencil className="w-3 h-3" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => handleCopyLink(c)}>
                    <Link2 className="w-3 h-3" /> Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs"
                    onClick={() => duplicateCollection(c.id)}
                  >
                    <Copy className="w-3 h-3" /> Duplicar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      if (confirm(`Excluir o ensaio "${c.title}"?`)) deleteCollection(c.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" /> Excluir
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <CollectionEditorModal
          open
          editing={editing}
          prompts={prompts}
          promptMap={promptMap}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onCreate={createCollection}
          onUpdate={updateCollection}
          fetchCollectionImages={fetchCollectionImages}
        />
      )}
    </section>
  );
}

// ============================================================
// Editor Modal
// ============================================================
interface EditorProps {
  open: boolean;
  editing: PortfolioCollection | null;
  prompts: UserPromptOption[];
  promptMap: Map<string, UserPromptOption>;
  onClose: () => void;
  onCreate: ReturnType<typeof usePortfolioCollections>['createCollection'];
  onUpdate: ReturnType<typeof usePortfolioCollections>['updateCollection'];
  fetchCollectionImages: ReturnType<typeof usePortfolioCollections>['fetchCollectionImages'];
}

function CollectionEditorModal({
  open,
  editing,
  prompts,
  promptMap,
  onClose,
  onCreate,
  onUpdate,
  fetchCollectionImages,
}: EditorProps) {
  const [title, setTitle] = useState(editing?.title || '');
  const [description, setDescription] = useState(editing?.description || '');
  const [coverUrl, setCoverUrl] = useState<string | null>(editing?.cover_image_url || null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [hydrating, setHydrating] = useState(!!editing);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadCover = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Imagem muito grande (máx 8MB).');
      return;
    }
    setUploadingCover(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;
      if (!uid) throw new Error('Sessão expirada.');
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${uid}/collection-cover-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      setCoverUrl(pub.publicUrl);
      toast.success('Capa enviada!');
    } catch (err: any) {
      console.error('[CollectionEditor] upload cover', err);
      toast.error('Erro ao enviar capa: ' + (err?.message || ''));
    } finally {
      setUploadingCover(false);
    }
  };

  useEffect(() => {
    if (!editing) {
      setHydrating(false);
      return;
    }
    setHydrating(true);
    fetchCollectionImages(editing.id).then((ids) => {
      setSelectedIds(ids);
      setHydrating(false);
    });
  }, [editing, fetchCollectionImages]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return prompts;
    return prompts.filter((p) =>
      [p.title, p.category, ...(p.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [prompts, search]);

  const toggle = (id: string) => {
    setSelectedIds((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX_IMAGES) {
        toast.error(`Máximo de ${MAX_IMAGES} imagens.`);
        return cur;
      }
      const next = [...cur, id];
      // Auto-set first selected as cover if none
      if (!coverUrl) {
        const p = promptMap.get(id);
        if (p?.image_url) setCoverUrl(p.image_url);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Dê um nome ao ensaio.');
      return;
    }
    if (selectedIds.length === 0) {
      toast.error('Selecione ao menos uma imagem.');
      return;
    }
    setSaving(true);
    let ok = false;
    if (editing) {
      ok = await onUpdate(editing.id, {
        title,
        description,
        cover_image_url: coverUrl,
        promptIds: selectedIds,
      });
    } else {
      const created = await onCreate({
        title,
        description,
        cover_image_url: coverUrl,
        promptIds: selectedIds,
      });
      ok = !!created;
    }
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto pb-24">
        <DialogHeader>
          <DialogTitle className="font-display tracking-wider text-2xl">
            {editing ? 'EDITAR ENSAIO' : 'NOVO ENSAIO'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nome do ensaio *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Ensaio Advogada"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Para quem é esse ensaio? O que ele entrega?"
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Label className="block mb-2">Capa do ensaio</Label>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                {coverUrl ? (
                  <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadCover(f);
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
              >
                {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {coverUrl ? 'Trocar capa' : 'Fazer upload'}
              </Button>
              {coverUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-xs"
                  onClick={() => setCoverUrl(null)}
                >
                  <X className="w-3 h-3" /> Remover
                </Button>
              )}
              <p className="text-[11px] text-muted-foreground basis-full">
                Ou use "Definir capa" sobre uma imagem do acervo abaixo.
              </p>
            </div>
          </div>

          <div>
            <Label className="block mb-2">
              Imagens ({selectedIds.length}/{MAX_IMAGES})
            </Label>
            <div className="relative max-w-sm mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, tag ou categoria..."
                className="pl-9"
              />
            </div>

            {hydrating ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border rounded-lg text-sm text-muted-foreground">
                Nenhuma imagem encontrada.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[40vh] overflow-y-auto p-1">
                {filtered.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  const isCover = coverUrl && p.image_url === coverUrl;
                  return (
                    <div key={p.id} className="relative">
                      <button
                        type="button"
                        onClick={() => toggle(p.id)}
                        className={cn(
                          'w-full aspect-square rounded-lg overflow-hidden border-2 transition-all bg-muted',
                          isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
                        )}
                      >
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title} loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] p-1 text-center">
                            {p.title}
                          </div>
                        )}
                      </button>
                      {isSelected && p.image_url && (
                        <button
                          type="button"
                          onClick={() => setCoverUrl(p.image_url)}
                          className={cn(
                            'absolute bottom-1 left-1 right-1 text-[10px] rounded px-1 py-0.5 backdrop-blur',
                            isCover
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background/80 text-foreground hover:bg-primary/80 hover:text-primary-foreground'
                          )}
                        >
                          {isCover ? '★ Capa' : 'Definir capa'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'Salvar alterações' : 'Criar ensaio'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
