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
  | 'app-design';

export interface CategoryInfo {
  id: Category;
  label: string;
  labelPt: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'all', label: 'All', labelPt: 'Tudo' },
  { id: 'profile', label: 'Profile / Avatar', labelPt: 'Perfil / Avatar' },
  { id: 'social-media', label: 'Social Media', labelPt: 'Mídias Sociais' },
  { id: 'infographic', label: 'Infographic', labelPt: 'Infográfico' },
  { id: 'youtube', label: 'YouTube Thumbnail', labelPt: 'Miniatura YouTube' },
  { id: 'comics', label: 'Comics / Storyboard', labelPt: 'Quadrinhos' },
  { id: 'poster', label: 'Poster / Flyer', labelPt: 'Pôster / Flyer' },
  { id: 'app-design', label: 'App / Web Design', labelPt: 'Design App/Web' },
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
