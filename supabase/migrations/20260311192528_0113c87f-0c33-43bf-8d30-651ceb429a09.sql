
-- Create tools table for Ferramentas page
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'ia-imagem',
  image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view tools
CREATE POLICY "Anyone can view tools" ON public.tools
  FOR SELECT TO authenticated USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage tools" ON public.tools
  FOR ALL TO authenticated
  USING (public.is_admin_or_moderator(auth.uid()))
  WITH CHECK (public.is_admin_or_moderator(auth.uid()));

-- Storage policies for avatars bucket (ensure users can upload/update their own avatars)
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
