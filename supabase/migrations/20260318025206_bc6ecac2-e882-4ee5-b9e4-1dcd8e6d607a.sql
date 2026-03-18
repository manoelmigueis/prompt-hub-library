
CREATE TABLE public.camera_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL DEFAULT 'shots',
  type TEXT NOT NULL DEFAULT 'Distance & Size',
  name TEXT NOT NULL,
  description TEXT,
  purpose TEXT,
  prompt_keyword TEXT NOT NULL,
  prompt_example TEXT,
  image_url TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.camera_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view references"
ON public.camera_references FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can manage references"
ON public.camera_references FOR ALL TO authenticated
USING (is_admin_or_moderator(auth.uid()))
WITH CHECK (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Authenticated users can insert references"
ON public.camera_references FOR INSERT TO authenticated
WITH CHECK (auth.uid() = created_by);
