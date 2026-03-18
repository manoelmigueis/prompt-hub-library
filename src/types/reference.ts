export interface CameraReference {
  id: string;
  category: string;
  type: string;
  name: string;
  description: string | null;
  purpose: string | null;
  prompt_keyword: string;
  prompt_example: string | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ReferenceCategory = 'all' | 'Shots' | 'Movement';
export type ReferenceType = 'all' | 'Distance & Size' | 'Angles' | 'Basic Moves' | 'Advanced Physical' | 'Cinematic & AI';
