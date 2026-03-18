import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReferenceFavoriteRow {
  reference_id: string;
}

const referenceFavoritesClient = supabase as any;

export function useReferenceFavorites(userId?: string) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavoriteIds([]);
      return;
    }

    setIsLoading(true);

    const { data, error } = await referenceFavoritesClient
      .from('reference_favorites')
      .select('reference_id')
      .eq('user_id', userId);

    if (error) {
      console.error('[ReferenceFavorites] Error fetching favorites:', error);
      toast({
        title: 'Erro ao carregar favoritos',
        description: 'Não foi possível buscar suas referências favoritas.',
        variant: 'destructive',
      });
      setFavoriteIds([]);
      setIsLoading(false);
      return;
    }

    setFavoriteIds((data as ReferenceFavoriteRow[] | null)?.map((favorite) => favorite.reference_id) ?? []);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const favorites = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const isFavorite = useCallback((referenceId: string) => favorites.has(referenceId), [favorites]);

  const toggleFavorite = useCallback(async (referenceId: string) => {
    if (!userId) {
      toast({
        title: 'Faça login para favoritar',
        description: 'Entre na sua conta para salvar referências favoritas.',
        variant: 'destructive',
      });
      return;
    }

    const wasFavorite = favoriteIds.includes(referenceId);
    const previousIds = favoriteIds;

    if (wasFavorite) {
      setFavoriteIds((current) => current.filter((id) => id !== referenceId));

      const { error } = await referenceFavoritesClient
        .from('reference_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('reference_id', referenceId);

      if (error) {
        console.error('[ReferenceFavorites] Error removing favorite:', error);
        setFavoriteIds(previousIds);
        toast({
          title: 'Erro ao remover favorito',
          description: 'Não foi possível atualizar sua lista de favoritos.',
          variant: 'destructive',
        });
      }

      return;
    }

    setFavoriteIds((current) => [...current, referenceId]);

    const { error } = await referenceFavoritesClient
      .from('reference_favorites')
      .insert({ user_id: userId, reference_id: referenceId });

    if (error) {
      console.error('[ReferenceFavorites] Error adding favorite:', error);

      if (error.code !== '23505') {
        setFavoriteIds(previousIds);
        toast({
          title: 'Erro ao salvar favorito',
          description: 'Não foi possível adicionar a referência aos favoritos.',
          variant: 'destructive',
        });
      }
    }
  }, [favoriteIds, userId]);

  return {
    favoriteIds,
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
  };
}
