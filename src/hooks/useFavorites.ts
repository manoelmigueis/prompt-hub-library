import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useFavorites(userId?: string) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavoriteIds([]);
      return;
    }
    const { data } = await supabase
      .from('favorites')
      .select('prompt_id')
      .eq('user_id', userId);
    
    if (data) {
      setFavoriteIds(data.map(f => f.prompt_id));
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const favorites = new Set(favoriteIds);

  const toggleFavorite = async (promptId: string) => {
    if (!userId) return;

    if (favorites.has(promptId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('prompt_id', promptId);
      setFavoriteIds(prev => prev.filter(id => id !== promptId));
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, prompt_id: promptId });
      setFavoriteIds(prev => [...prev, promptId]);
    }
  };

  const isFavorite = (promptId: string) => favorites.has(promptId);

  return { favorites, toggleFavorite, isFavorite, favoriteIds };
}
