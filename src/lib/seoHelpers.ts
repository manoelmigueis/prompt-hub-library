import { Category } from '@/types/prompt';

// SEO descriptions by category
const categoryDescriptions: Record<Category, string> = {
  'all': 'Prompt versátil para criação de imagens IA de alta qualidade.',
  'profile': 'Prompt otimizado para criar avatares e fotos de perfil profissionais com IA.',
  'social-media': 'Prompt para gerar posts virais e criativos para redes sociais.',
  'infographic': 'Prompt especializado em infográficos informativos e visualmente atraentes.',
  'youtube': 'Prompt para criar miniaturas impactantes que aumentam o CTR no YouTube.',
  'comics': 'Prompt para produzir quadrinhos e storyboards com estilos artísticos únicos.',
  'poster': 'Prompt para design de pôsteres e flyers promocionais de alto impacto.',
  'app-design': 'Prompt para criar mockups e interfaces de apps/websites modernos.',
};

// Tags by category
const categoryTags: Record<Category, string[]> = {
  'all': ['ia', 'imagem', 'prompt', 'criativo'],
  'profile': ['avatar', 'perfil', 'retrato', 'profissional', 'linkedin', 'foto'],
  'social-media': ['instagram', 'tiktok', 'post', 'viral', 'engajamento', 'stories'],
  'infographic': ['dados', 'estatísticas', 'visual', 'informação', 'gráfico', 'educativo'],
  'youtube': ['thumbnail', 'miniatura', 'clickbait', 'ctr', 'youtube', 'vídeo'],
  'comics': ['quadrinhos', 'manga', 'storyboard', 'narrativa', 'arte sequencial'],
  'poster': ['pôster', 'flyer', 'cartaz', 'evento', 'promoção', 'design gráfico'],
  'app-design': ['ui', 'ux', 'interface', 'mockup', 'app', 'website', 'design'],
};

export function generateSEODescription(category: Category, title?: string): string {
  const baseDescription = categoryDescriptions[category] || categoryDescriptions['all'];
  if (title) {
    return `${title} - ${baseDescription}`;
  }
  return baseDescription;
}

export function generateTags(category: Category): string[] {
  return categoryTags[category] || categoryTags['all'];
}

export function generateMetaTags(category: Category, title: string, description: string): {
  title: string;
  description: string;
  keywords: string;
} {
  const tags = generateTags(category);
  return {
    title: `${title} | Prompt IA para ${getCategoryLabel(category)}`,
    description: description.substring(0, 155) + (description.length > 155 ? '...' : ''),
    keywords: tags.join(', '),
  };
}

function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    'all': 'Todos',
    'profile': 'Perfil',
    'social-media': 'Mídias Sociais',
    'infographic': 'Infográfico',
    'youtube': 'YouTube',
    'comics': 'Quadrinhos',
    'poster': 'Pôster',
    'app-design': 'Design de App',
  };
  return labels[category] || 'Imagem';
}
