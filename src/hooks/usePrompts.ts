import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Prompt, PromptStatus, Category } from '@/types/prompt';
import { toast } from 'sonner';

interface CreatePromptData {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  category: Category;
}

export function usePrompts(userId?: string, isAdmin?: boolean) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrompts = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching prompts:', error);
        toast.error('Erro ao carregar prompts');
        return;
      }

      // Map database format to app format
      const mappedPrompts: Prompt[] = (data || []).map(p => ({
        id: p.id,
        title: p.title,
        description: p.content.substring(0, 100) + (p.content.length > 100 ? '...' : ''),
        content: p.content,
        imageUrl: p.image_url || undefined,
        author: p.author_name || 'Anônimo',
        authorHandle: p.author_instagram ? `@${p.author_instagram}` : undefined,
        category: p.category as Category,
        status: p.status as PromptStatus,
        isFeatured: p.is_featured,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
      }));

      setPrompts(mappedPrompts);
    } catch (error) {
      console.error('Error in fetchPrompts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const createPrompt = async (data: CreatePromptData, profile?: { display_name?: string | null; instagram?: string | null }) => {
    if (!userId) {
      toast.error('Você precisa estar logado para enviar prompts');
      return null;
    }

    const { data: newPrompt, error } = await supabase
      .from('prompts')
      .insert({
        title: data.title,
        content: data.content,
        category: data.category,
        image_url: data.imageUrl || null,
        user_id: userId,
        author_name: profile?.display_name || 'Anônimo',
        author_instagram: profile?.instagram || null,
        status: 'pending',
        is_featured: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating prompt:', error);
      toast.error('Erro ao enviar prompt: ' + error.message);
      return null;
    }

    // Add to local state
    const mappedPrompt: Prompt = {
      id: newPrompt.id,
      title: newPrompt.title,
      description: newPrompt.content.substring(0, 100) + (newPrompt.content.length > 100 ? '...' : ''),
      content: newPrompt.content,
      imageUrl: newPrompt.image_url || undefined,
      author: newPrompt.author_name || 'Anônimo',
      authorHandle: newPrompt.author_instagram ? `@${newPrompt.author_instagram}` : undefined,
      category: newPrompt.category as Category,
      status: newPrompt.status as PromptStatus,
      isFeatured: newPrompt.is_featured,
      createdAt: new Date(newPrompt.created_at),
      updatedAt: new Date(newPrompt.updated_at),
    };

    setPrompts(prev => [mappedPrompt, ...prev]);
    return mappedPrompt;
  };

  const updatePromptStatus = async (id: string, status: PromptStatus) => {
    const { error } = await supabase
      .from('prompts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating prompt status:', error);
      toast.error('Erro ao atualizar status: ' + error.message);
      return false;
    }

    setPrompts(prev => prev.map(p =>
      p.id === id ? { ...p, status, updatedAt: new Date() } : p
    ));
    return true;
  };

  const toggleFeatured = async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return false;

    const newFeatured = !prompt.isFeatured;

    const { error } = await supabase
      .from('prompts')
      .update({ is_featured: newFeatured, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error toggling featured:', error);
      toast.error('Erro ao destacar: ' + error.message);
      return false;
    }

    setPrompts(prev => prev.map(p =>
      p.id === id ? { ...p, isFeatured: newFeatured } : p
    ));
    return true;
  };

  const deletePrompt = async (id: string) => {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Erro ao excluir: ' + error.message);
      return false;
    }

    setPrompts(prev => prev.filter(p => p.id !== id));
    return true;
  };

  return {
    prompts,
    loading,
    fetchPrompts,
    createPrompt,
    updatePromptStatus,
    toggleFeatured,
    deletePrompt,
  };
}
