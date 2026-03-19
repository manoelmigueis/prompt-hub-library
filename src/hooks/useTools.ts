import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type ToolCategory = 'ia-imagem' | 'ia-texto' | 'ia-video' | 'editor' | 'recurso' | 'artigo' | 'tutorial' | 'outro';

export interface ToolCategoryInfo {
  id: ToolCategory;
  label: string;
}

export const TOOL_CATEGORIES: ToolCategoryInfo[] = [
  { id: 'ia-imagem', label: 'IA de Imagem' },
  { id: 'ia-texto', label: 'IA de Texto' },
  { id: 'ia-video', label: 'IA de Vídeo' },
  { id: 'editor', label: 'Editor' },
  { id: 'recurso', label: 'Recurso' },
  { id: 'artigo', label: 'Artigo' },
  { id: 'tutorial', label: 'Tutorial' },
  { id: 'outro', label: 'Outro' },
];

export interface Tool {
  id: string;
  name: string;
  url: string;
  description: string | null;
  category: ToolCategory;
  imageUrl: string | null;
  isFeatured: boolean;
  createdAt: Date;
}

export interface CreateToolData {
  name: string;
  url: string;
  description?: string;
  category: ToolCategory;
  imageUrl?: string;
  isFeatured?: boolean;
}

export type UpdateToolData = Partial<CreateToolData>;

export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTools = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tools:', error);
        return;
      }

      setTools((data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        url: t.url,
        description: t.description,
        category: t.category as ToolCategory,
        imageUrl: t.image_url,
        isFeatured: t.is_featured,
        createdAt: new Date(t.created_at),
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTools(); }, [fetchTools]);

  const createTool = async (data: CreateToolData) => {
    const { data: newTool, error } = await supabase
      .from('tools')
      .insert({
        name: data.name,
        url: data.url,
        description: data.description || null,
        category: data.category,
        image_url: data.imageUrl || null,
        is_featured: data.isFeatured || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tool:', error);
      toast.error('Erro ao adicionar ferramenta');
      return false;
    }

    setTools(prev => [{
      id: newTool.id,
      name: newTool.name,
      url: newTool.url,
      description: newTool.description,
      category: newTool.category as ToolCategory,
      imageUrl: newTool.image_url,
      isFeatured: newTool.is_featured,
      createdAt: new Date(newTool.created_at),
    }, ...prev]);
    
    toast.success('Ferramenta adicionada!');
    return true;
  };

  const deleteTool = async (id: string) => {
    const { error } = await supabase.from('tools').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao excluir');
      return false;
    }
    setTools(prev => prev.filter(t => t.id !== id));
    toast.success('Ferramenta excluída');
    return true;
  };

  return { tools, loading, createTool, deleteTool, fetchTools };
}