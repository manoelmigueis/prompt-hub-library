import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { InviteCodeGate } from '@/components/auth/InviteCodeGate';
import { useReferences } from '@/hooks/useReferences';
import { useReferenceFavorites } from '@/hooks/useReferenceFavorites';
import { ReferenceCard } from '@/components/ReferenceCard';
import { AddReferenceModal } from '@/components/AddReferenceModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Camera, Filter, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import type { ReferenceCategory, ReferenceType, CameraReference } from '@/types/reference';

const CATEGORY_FILTERS: { id: ReferenceCategory; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'Shots', label: 'Shots / Planos' },
  { id: 'Movement', label: 'Movimentos' },
];

const TYPE_FILTERS: { id: ReferenceType; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'Distance & Size', label: 'Distância' },
  { id: 'Angles', label: 'Ângulos' },
  { id: 'Basic Moves', label: 'Básicos' },
  { id: 'Advanced Physical', label: 'Avançados' },
  { id: 'Cinematic & AI', label: 'Cinemáticos' },
];

export default function Referencias() {
  const { user, isAdmin, isModerator, hasAccess, profile, signOut, fetchUserData, grantAccess } = useAuth();
  const { references, isLoading, error, deleteReference } = useReferences();
  const { favoriteIds, isFavorite, toggleFavorite } = useReferenceFavorites(user?.id);
  const [showModal, setShowModal] = useState(false);
  const [editingRef, setEditingRef] = useState<CameraReference | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ReferenceCategory>('all');
  const [typeFilter, setTypeFilter] = useState<ReferenceType>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const canManage = isAdmin || isModerator;

  const filtered = useMemo(() => {
    return references.filter((ref) => {
      if (showFavoritesOnly && !favoriteIds.includes(ref.id)) return false;
      if (categoryFilter !== 'all' && ref.category !== categoryFilter) return false;
      if (typeFilter !== 'all' && ref.type !== typeFilter) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          ref.name.toLowerCase().includes(q) ||
          ref.prompt_keyword.toLowerCase().includes(q) ||
          ref.description?.toLowerCase().includes(q) ||
          ref.prompt_example?.toLowerCase().includes(q) ||
          ref.pt_explanation?.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [references, showFavoritesOnly, favoriteIds, categoryFilter, typeFilter, search]);

  const handleEdit = (ref: CameraReference) => {
    setEditingRef(ref);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReference.mutateAsync(id);
      toast({ title: 'Referência excluída!' });
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const handleCloseModal = (open: boolean) => {
    setShowModal(open);
    if (!open) setEditingRef(null);
  };

  const handleCategoryChange = (category: ReferenceCategory) => {
    setShowFavoritesOnly(false);
    setCategoryFilter(category);
    setTypeFilter('all');
  };

  const handleFavoritesTab = () => {
    if (showFavoritesOnly) {
      setShowFavoritesOnly(false);
      return;
    }

    setShowFavoritesOnly(true);
    setCategoryFilter('all');
    setTypeFilter('all');
  };

  return (
    <div className="min-h-screen bg-background">
      {user && !authLoading && !hasAccess && (
        <InviteCodeGate isOpen={true} userId={user.id} onAccessGranted={() => { grantAccess(); fetchUserData(user.id); }} />
      )}
      <Header
        isAdmin={isAdmin}
        isModerator={isModerator}
        isAuthenticated={!!user}
        displayName={profile?.display_name || undefined}
        avatarUrl={profile?.avatar_url || undefined}
        onAdminClick={() => {}}
        onSubmitClick={() => {}}
        onProfileClick={() => {}}
        onLogout={signOut}
      />

      <main className="container mx-auto px-4 pt-20 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-5 h-5 text-primary" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Módulo de Referências</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-wide text-foreground">
              Vocabulário Visual
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Planos, ângulos e movimentos de câmera para seus prompts de IA.
            </p>
          </div>
          {canManage && (
            <Button onClick={() => { setEditingRef(null); setShowModal(true); }} className="btn-gradient gap-2 rounded-full shrink-0">
              <Plus className="w-4 h-4" />
              Nova Referência
            </Button>
          )}
        </div>

        <div className="space-y-3 mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, keyword..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <button
              onClick={handleFavoritesTab}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border-2 transition-colors ${
                showFavoritesOnly
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-primary bg-card text-foreground hover:bg-secondary'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favoritos
            </button>

            {CATEGORY_FILTERS.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCategoryChange(c.id)}
                className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border-2 transition-colors ${
                  categoryFilter === c.id && !showFavoritesOnly
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-primary bg-card text-foreground hover:bg-secondary'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TYPE_FILTERS.filter((t) => {
              if (categoryFilter === 'all') return true;
              if (categoryFilter === 'Shots') return ['all', 'Distance & Size', 'Angles'].includes(t.id);
              if (categoryFilter === 'Movement') return ['all', 'Basic Moves', 'Advanced Physical', 'Cinematic & AI'].includes(t.id);
              return false;
            }).map((t) => (
              <Badge
                key={t.id}
                variant={typeFilter === t.id ? 'default' : 'outline'}
                className="cursor-pointer text-[10px]"
                onClick={() => setTypeFilter(t.id)}
              >
                {t.label}
              </Badge>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card/60 rounded-xl animate-pulse">
                <div className="aspect-video bg-muted rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-8 bg-muted rounded w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-destructive text-sm">Erro ao carregar referências. Tente novamente.</p>
          </div>
        ) : filtered.length === 0 ? (
          showFavoritesOnly ? (
            <div className="text-center py-20">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Você ainda não tem nenhum favorito. Clique no coração nos cards para salvá-los aqui!
              </p>
            </div>
          ) : (
            <div className="text-center py-20">
              <Camera className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma referência encontrada.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((ref, i) => (
              <ReferenceCard
                key={ref.id}
                reference={ref}
                index={i}
                isAdmin={canManage}
                isFavorite={isFavorite(ref.id)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            {filtered.length} referência{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          </p>
        )}
      </main>

      <AddReferenceModal open={showModal} onOpenChange={handleCloseModal} editingReference={editingRef} />
    </div>
  );
}
