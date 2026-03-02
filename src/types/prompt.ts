export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl?: string;
  author: string;
  authorHandle?: string;
  category: Category;
  status: PromptStatus;
  isFeatured: boolean;
  tags?: string[];
  viewCount: number;
  copyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type PromptStatus = 'pending' | 'approved' | 'rejected';

export type Category = 
  | 'all'
  | 'profile'
  | 'social-media'
  | 'infographic'
  | 'youtube'
  | 'comics'
  | 'poster'
  | 'app-design'
  | 'retrato-realista'
  | 'foto-artistica'
  | 'moda-estilo'
  | 'cenarios'
  | 'video-effect'
  | 'body-art'
  | 'fotografia'
  | 'arte-digital'
  | 'logo-marca'
  | 'outro';

export interface CategoryInfo {
  id: Category;
  label: string;
  labelPt: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'all', label: 'All', labelPt: 'Todos' },
  { id: 'retrato-realista', label: 'Realistic Portrait', labelPt: 'Retrato Realista' },
  { id: 'foto-artistica', label: 'Artistic Photo', labelPt: 'Foto Artística' },
  { id: 'moda-estilo', label: 'Fashion & Style', labelPt: 'Moda & Estilo' },
  { id: 'cenarios', label: 'Scenery', labelPt: 'Cenários Naturais' },
  { id: 'profile', label: 'Profile / Avatar', labelPt: 'Perfil / Avatar' },
  { id: 'social-media', label: 'Social Media', labelPt: 'Mídias Sociais' },
  { id: 'video-effect', label: 'Video Effect', labelPt: 'Video Effect' },
  { id: 'body-art', label: 'Body Painting', labelPt: 'Body Painting' },
  { id: 'fotografia', label: 'Photography', labelPt: 'Fotografia' },
  { id: 'arte-digital', label: 'Digital Art', labelPt: 'Arte Digital' },
  { id: 'infographic', label: 'Infographic', labelPt: 'Infográfico' },
  { id: 'youtube', label: 'YouTube Thumbnail', labelPt: 'Miniatura YouTube' },
  { id: 'comics', label: 'Comics / Storyboard', labelPt: 'Quadrinhos' },
  { id: 'poster', label: 'Poster / Flyer', labelPt: 'Pôster / Flyer' },
  { id: 'app-design', label: 'App / Web Design', labelPt: 'Design App/Web' },
  { id: 'logo-marca', label: 'Logo / Brand', labelPt: 'Logo / Marca' },
  { id: 'outro', label: 'Other', labelPt: 'Outro' },
];

export interface InviteCode {
  id: string;
  code: string;
  uses: number;
  maxUses: number;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}
