import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const fetchFavorites = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('favorites')
      .select('prompt_id')
      .eq('user_id', userId);
    
    if (data) {
      setFavorites(new Set(data.map(f => f.prompt_id)));
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (promptId: string) => {
    if (!userId) return;

    if (favorites.has(promptId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('prompt_id', promptId);
      setFavorites(prev => {
        const next = new Set(prev);
        next.delete(promptId);
        return next;
      });
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, prompt_id: promptId });
      setFavorites(prev => new Set(prev).add(promptId));
    }
  };

  const isFavorite = (promptId: string) => favorites.has(promptId);

  return { favorites, toggleFavorite, isFavorite };
}
