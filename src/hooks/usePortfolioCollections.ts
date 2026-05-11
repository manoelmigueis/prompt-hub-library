import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PortfolioCollection {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_template: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  image_count?: number;
}

export interface CollectionImage {
  id: string;
  collection_id: string;
  prompt_id: string;
  sort_order: number;
}

export const slugifyTitle = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || `ensaio-${Date.now().toString(36)}`;

export function usePortfolioCollections(userId?: string) {
  const [collections, setCollections] = useState<PortfolioCollection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) {
      setCollections([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('portfolio_collections')
        .select('*, portfolio_collection_images(count)')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      const mapped: PortfolioCollection[] = (data || []).map((c: any) => ({
        ...c,
        image_count: c.portfolio_collection_images?.[0]?.count ?? 0,
      }));
      setCollections(mapped);
      console.log('[PortfolioCollections]', { collections: mapped.length });
    } catch (err: any) {
      console.error('[PortfolioCollections] load', err);
      toast.error('Erro ao carregar ensaios');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const ensureUniqueSlug = useCallback(
    async (base: string, excludeId?: string): Promise<string> => {
      if (!userId) return base;
      let candidate = base;
      let i = 1;
      while (true) {
        const q = (supabase as any)
          .from('portfolio_collections')
          .select('id')
          .eq('user_id', userId)
          .ilike('slug', candidate)
          .maybeSingle();
        const { data } = await q;
        if (!data || data.id === excludeId) return candidate;
        i += 1;
        candidate = `${base}-${i}`;
      }
    },
    [userId]
  );

  const createCollection = useCallback(
    async (input: {
      title: string;
      description?: string | null;
      cover_image_url?: string | null;
      promptIds: string[];
      is_public?: boolean;
    }) => {
      if (!userId) return null;
      try {
        const slug = await ensureUniqueSlug(slugifyTitle(input.title));
        const { data, error } = await (supabase as any)
          .from('portfolio_collections')
          .insert({
            user_id: userId,
            title: input.title.trim() || 'Novo ensaio',
            slug,
            description: input.description || null,
            cover_image_url: input.cover_image_url || null,
            is_public: input.is_public ?? true,
          })
          .select()
          .single();
        if (error) throw error;

        if (input.promptIds.length) {
          const rows = input.promptIds.map((pid, idx) => ({
            collection_id: data.id,
            prompt_id: pid,
            sort_order: idx,
          }));
          const { error: insErr } = await (supabase as any)
            .from('portfolio_collection_images')
            .insert(rows);
          if (insErr) throw insErr;
        }

        toast.success('Ensaio criado!');
        await load();
        return data as PortfolioCollection;
      } catch (err: any) {
        console.error('[PortfolioCollections] create', err);
        toast.error('Erro ao criar ensaio: ' + (err?.message || ''));
        return null;
      }
    },
    [userId, ensureUniqueSlug, load]
  );

  const updateCollection = useCallback(
    async (
      id: string,
      input: {
        title?: string;
        description?: string | null;
        cover_image_url?: string | null;
        is_public?: boolean;
        promptIds?: string[];
      }
    ) => {
      try {
        const patch: any = {};
        if (input.title !== undefined) {
          patch.title = input.title.trim() || 'Ensaio';
          patch.slug = await ensureUniqueSlug(slugifyTitle(input.title), id);
        }
        if (input.description !== undefined) patch.description = input.description;
        if (input.cover_image_url !== undefined) patch.cover_image_url = input.cover_image_url;
        if (input.is_public !== undefined) patch.is_public = input.is_public;

        if (Object.keys(patch).length) {
          const { error } = await (supabase as any)
            .from('portfolio_collections')
            .update(patch)
            .eq('id', id);
          if (error) throw error;
        }

        if (input.promptIds) {
          const { error: delErr } = await (supabase as any)
            .from('portfolio_collection_images')
            .delete()
            .eq('collection_id', id);
          if (delErr) throw delErr;

          if (input.promptIds.length) {
            const rows = input.promptIds.map((pid, idx) => ({
              collection_id: id,
              prompt_id: pid,
              sort_order: idx,
            }));
            const { error: insErr } = await (supabase as any)
              .from('portfolio_collection_images')
              .insert(rows);
            if (insErr) throw insErr;
          }
        }

        toast.success('Ensaio atualizado!');
        await load();
        return true;
      } catch (err: any) {
        console.error('[PortfolioCollections] update', err);
        toast.error('Erro ao salvar ensaio: ' + (err?.message || ''));
        return false;
      }
    },
    [ensureUniqueSlug, load]
  );

  const deleteCollection = useCallback(
    async (id: string) => {
      try {
        const { error } = await (supabase as any)
          .from('portfolio_collections')
          .delete()
          .eq('id', id);
        if (error) throw error;
        toast.success('Ensaio excluído');
        await load();
        return true;
      } catch (err: any) {
        console.error('[PortfolioCollections] delete', err);
        toast.error('Erro ao excluir');
        return false;
      }
    },
    [load]
  );

  const duplicateCollection = useCallback(
    async (id: string) => {
      if (!userId) return null;
      try {
        const { data: src, error: e1 } = await (supabase as any)
          .from('portfolio_collections')
          .select('*')
          .eq('id', id)
          .single();
        if (e1) throw e1;

        const { data: imgs, error: e2 } = await (supabase as any)
          .from('portfolio_collection_images')
          .select('prompt_id, sort_order')
          .eq('collection_id', id)
          .order('sort_order', { ascending: true });
        if (e2) throw e2;

        const newTitle = `${src.title} Copy`;
        const slug = await ensureUniqueSlug(slugifyTitle(newTitle));
        const { data: dup, error: e3 } = await (supabase as any)
          .from('portfolio_collections')
          .insert({
            user_id: userId,
            title: newTitle,
            slug,
            description: src.description,
            cover_image_url: src.cover_image_url,
            is_public: src.is_public,
          })
          .select()
          .single();
        if (e3) throw e3;

        if (imgs?.length) {
          const rows = imgs.map((r: any) => ({
            collection_id: dup.id,
            prompt_id: r.prompt_id,
            sort_order: r.sort_order,
          }));
          const { error: e4 } = await (supabase as any)
            .from('portfolio_collection_images')
            .insert(rows);
          if (e4) throw e4;
        }

        toast.success('Ensaio duplicado!');
        await load();
        return dup as PortfolioCollection;
      } catch (err: any) {
        console.error('[PortfolioCollections] duplicate', err);
        toast.error('Erro ao duplicar');
        return null;
      }
    },
    [userId, ensureUniqueSlug, load]
  );

  const fetchCollectionImages = useCallback(async (collectionId: string): Promise<string[]> => {
    const { data, error } = await (supabase as any)
      .from('portfolio_collection_images')
      .select('prompt_id, sort_order')
      .eq('collection_id', collectionId)
      .order('sort_order', { ascending: true });
    if (error) {
      console.error('[PortfolioCollections] fetch images', error);
      return [];
    }
    return (data || []).map((r: any) => r.prompt_id);
  }, []);

  return {
    collections,
    loading,
    reload: load,
    createCollection,
    updateCollection,
    deleteCollection,
    duplicateCollection,
    fetchCollectionImages,
  };
}

// ============================================================
// Public fetch by username + slug (for /c/:username/:slug page)
// ============================================================
export interface PublicCollectionData {
  collection_id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_public: boolean;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  instagram: string | null;
  whatsapp: string | null;
  website: string | null;
  youtube: string | null;
  tiktok: string | null;
  twitter: string | null;
  show_social_links: boolean | null;
  /** Owner's portfolio id, used to attach customer orders. */
  portfolio_id: string | null;
}

export interface PublicCollectionPrompt {
  id: string;
  title: string;
  image_url: string | null;
  category: string;
  tags: string[];
  position: number;
}

export async function fetchPublicCollection(
  username: string,
  slug: string
): Promise<{ data: PublicCollectionData; prompts: PublicCollectionPrompt[] } | null> {
  try {
    const { data, error } = await (supabase as any).rpc('get_public_collection', {
      _username: username,
      _slug: slug,
    });
    if (error) throw error;
    const row = (data as any[])?.[0];
    if (!row) return null;

    const { data: items } = await (supabase as any)
      .from('portfolio_collection_images')
      .select('prompt_id, sort_order')
      .eq('collection_id', row.collection_id)
      .order('sort_order', { ascending: true });

    const ids = (items || []).map((i: any) => i.prompt_id);
    let prompts: PublicCollectionPrompt[] = [];
    if (ids.length) {
      const { data: promptRows } = await supabase
        .from('prompts')
        .select('id, title, image_url, category, tags')
        .in('id', ids)
        .eq('status', 'approved');
      const posMap = new Map<string, number>(
        (items || []).map((i: any) => [i.prompt_id, i.sort_order])
      );
      prompts = (promptRows || [])
        .map((p: any) => ({
          id: p.id,
          title: p.title,
          image_url: p.image_url,
          category: p.category,
          tags: p.tags || [],
          position: posMap.get(p.id) ?? 0,
        }))
        .sort((a, b) => a.position - b.position);
    }

    // Fetch the owner's published portfolio id so the renderer can enable orders
    const { data: pf } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', row.user_id)
      .eq('is_published', true)
      .maybeSingle();

    const enriched: PublicCollectionData = {
      ...(row as PublicCollectionData),
      portfolio_id: pf?.id ?? null,
    };
    return { data: enriched, prompts };
  } catch (err) {
    console.error('[PortfolioCollections] fetchPublic', err);
    return null;
  }
}
