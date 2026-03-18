import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { CameraReference } from '@/types/reference';

export function useReferences() {
  const queryClient = useQueryClient();

  const { data: references = [], isLoading, error } = useQuery({
    queryKey: ['camera-references'],
    queryFn: async () => {
      console.log('[ReferencesModule] Fetching references...');
      const { data, error } = await supabase
        .from('camera_references')
        .select('*')
        .order('category', { ascending: true })
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('[ReferencesModule] Error fetching:', error);
        throw error;
      }
      console.log('[ReferencesModule] Fetched', data?.length, 'references');
      return data as CameraReference[];
    },
  });

  const addReference = useMutation({
    mutationFn: async (newRef: {
      name: string;
      category: string;
      type: string;
      prompt_keyword: string;
      description?: string;
      purpose?: string;
      prompt_example?: string;
      image_url?: string;
      created_by?: string;
    }) => {
      console.log('[ReferencesModule] Adding reference:', newRef.name);
      const { data, error } = await supabase
        .from('camera_references')
        .insert(newRef)
        .select()
        .single();

      if (error) {
        console.error('[ReferencesModule] Error adding:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camera-references'] });
    },
  });

  return { references, isLoading, error, addReference };
}
