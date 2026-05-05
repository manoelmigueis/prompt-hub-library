import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

export interface PortfolioRow {
  id: string;
  user_id: string;
  title: string | null;
  about: string | null;
  cover_prompt_id: string | null;
  cover_image_url: string | null;
  is_published: boolean;
}

export interface PortfolioItem {
  id: string;
  prompt_id: string;
  position: number;
}

export interface UserPromptOption {
  id: string;
  title: string;
  image_url: string | null;
  category: string;
  tags: string[];
}

export type PortfolioOrder = Tables<'portfolio_orders'>;

export function usePortfolio(userId?: string, isAdmin: boolean = false) {
  const [portfolio, setPortfolio] = useState<PortfolioRow | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [userPrompts, setUserPrompts] = useState<UserPromptOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Every portfolio can include approved images from the full public acervo.
      let promptQuery = supabase
        .from('prompts')
        .select('id, title, image_url, category, tags')
        .eq('status', 'approved')
        .not('image_url', 'is', null)
        .limit(500)
        .order('created_at', { ascending: false });

      const { data: promptData, error: promptErr } = await promptQuery;
      if (promptErr) throw promptErr;
      setUserPrompts(
        (promptData || []).map((p: any) => ({
          id: p.id,
          title: p.title,
          image_url: p.image_url,
          category: p.category,
          tags: p.tags || [],
        }))
      );

      // Load existing portfolio
      const { data: portfolioData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (portfolioData) {
        setPortfolio(portfolioData as PortfolioRow);
        const { data: itemsData } = await supabase
          .from('portfolio_items')
          .select('id, prompt_id, position')
          .eq('portfolio_id', portfolioData.id)
          .order('position', { ascending: true });
        setItems((itemsData || []) as PortfolioItem[]);
      } else {
        setPortfolio(null);
        setItems([]);
      }
    } catch (err) {
      console.error('[Portfolio] load error', err);
      toast.error('Erro ao carregar portfólio');
    } finally {
      setLoading(false);
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  const ensurePortfolio = useCallback(async (): Promise<PortfolioRow | null> => {
    if (!userId) return null;
    if (portfolio) return portfolio;
    const { data, error } = await supabase
      .from('portfolios')
      .insert({ user_id: userId, is_published: true })
      .select()
      .single();
    if (error) {
      console.error('[Portfolio] ensure error', error);
      toast.error('Erro ao criar portfólio');
      return null;
    }
    setPortfolio(data as PortfolioRow);
    return data as PortfolioRow;
  }, [userId, portfolio]);

  const savePortfolio = useCallback(
    async (
      selectedPromptIds: string[],
      meta: {
        title?: string | null;
        about?: string | null;
        cover_prompt_id?: string | null;
        cover_image_url?: string | null;
        is_published?: boolean;
      }
    ) => {
      if (!userId) return false;
      setSaving(true);
      try {
        const pf = await ensurePortfolio();
        if (!pf) return false;

        const { error: updateErr } = await supabase
          .from('portfolios')
          .update({
            title: meta.title ?? null,
            about: meta.about ?? null,
            cover_prompt_id: meta.cover_prompt_id ?? null,
            cover_image_url: meta.cover_image_url ?? null,
            is_published: meta.is_published ?? true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pf.id);
        if (updateErr) throw updateErr;

        // Replace items: delete all then insert in order
        const { error: delErr } = await supabase
          .from('portfolio_items')
          .delete()
          .eq('portfolio_id', pf.id);
        if (delErr) throw delErr;

        if (selectedPromptIds.length > 0) {
          const rows = selectedPromptIds.map((pid, idx) => ({
            portfolio_id: pf.id,
            prompt_id: pid,
            position: idx,
          }));
          const { error: insErr } = await supabase.from('portfolio_items').insert(rows);
          if (insErr) throw insErr;
        }

        console.log('[Portfolio] saved', { count: selectedPromptIds.length, meta });
        await load();
        toast.success('Portfólio salvo!');
        return true;
      } catch (err: any) {
        console.error('[Portfolio] save error', err);
        toast.error('Erro ao salvar: ' + (err?.message || 'desconhecido'));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [userId, ensurePortfolio, load]
  );

  return {
    portfolio,
    items,
    userPrompts,
    loading,
    saving,
    reload: load,
    savePortfolio,
  };
}

// Public lookup
export interface PublicPortfolioData {
  user_id: string;
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
  portfolio_id: string | null;
  title: string | null;
  about: string | null;
  cover_prompt_id: string | null;
  cover_image_url: string | null;
  is_published: boolean | null;
}

export interface PublicPortfolioPrompt {
  id: string;
  title: string;
  image_url: string | null;
  category: string;
  tags: string[];
  position: number;
}

export async function fetchPublicPortfolio(
  username: string
): Promise<{ profile: PublicPortfolioData; prompts: PublicPortfolioPrompt[] } | null> {
  try {
    const { data, error } = await supabase.rpc('get_public_portfolio_by_username', {
      _username: username,
    });
    if (error) throw error;
    const row = (data as any[])?.[0];
    if (!row) return null;
    const profile: PublicPortfolioData = row;

    let prompts: PublicPortfolioPrompt[] = [];
    if (profile.portfolio_id) {
      const { data: itemsData } = await supabase
        .from('portfolio_items')
        .select('prompt_id, position')
        .eq('portfolio_id', profile.portfolio_id)
        .order('position', { ascending: true });

      const promptIds = (itemsData || []).map((i: any) => i.prompt_id);
      if (promptIds.length > 0) {
        const { data: promptRows } = await supabase
          .from('prompts')
          .select('id, title, image_url, category, tags')
          .in('id', promptIds)
          .eq('status', 'approved');
        const positionMap = new Map<string, number>(
          (itemsData || []).map((i: any) => [i.prompt_id, i.position])
        );
        prompts = (promptRows || [])
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            image_url: p.image_url,
            category: p.category,
            tags: p.tags || [],
            position: positionMap.get(p.id) ?? 0,
          }))
          .sort((a, b) => a.position - b.position);
      }
    }
    return { profile, prompts };
  } catch (err) {
    console.error('[Portfolio] fetchPublic error', err);
    return null;
  }
}

export async function createPortfolioOrder(input: {
  portfolioId: string;
  ownerUserId: string;
  selectedPromptIds: string[];
  selectedImageUrls: string[];
  customerName?: string | null;
  customerEmail?: string | null;
  customerWhatsapp?: string | null;
  customerNote?: string | null;
}) {
  const { error } = await supabase.from('portfolio_orders').insert({
    portfolio_id: input.portfolioId,
    owner_user_id: input.ownerUserId,
    selected_prompt_ids: input.selectedPromptIds,
    selected_image_urls: input.selectedImageUrls,
    customer_name: input.customerName || null,
    customer_email: input.customerEmail || null,
    customer_whatsapp: input.customerWhatsapp || null,
    customer_note: input.customerNote || null,
  });

  if (error) throw error;
}

export async function fetchPortfolioOrders(ownerUserId: string): Promise<PortfolioOrder[]> {
  const { data, error } = await supabase
    .from('portfolio_orders')
    .select('*')
    .eq('owner_user_id', ownerUserId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as PortfolioOrder[];
}
