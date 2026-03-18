-- Create table to persist per-user favorite camera references
CREATE TABLE IF NOT EXISTS public.reference_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reference_id UUID NOT NULL REFERENCES public.camera_references(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT reference_favorites_user_id_reference_id_key UNIQUE (user_id, reference_id)
);

-- Helpful indexes for filtering favorites by user/reference
CREATE INDEX IF NOT EXISTS idx_reference_favorites_user_id ON public.reference_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_reference_favorites_reference_id ON public.reference_favorites(reference_id);

-- Enable row level security
ALTER TABLE public.reference_favorites ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users to manage only their own reference favorites
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reference_favorites'
      AND policyname = 'Users can view their own reference favorites'
  ) THEN
    CREATE POLICY "Users can view their own reference favorites"
    ON public.reference_favorites
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reference_favorites'
      AND policyname = 'Users can add reference favorites'
  ) THEN
    CREATE POLICY "Users can add reference favorites"
    ON public.reference_favorites
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reference_favorites'
      AND policyname = 'Users can remove reference favorites'
  ) THEN
    CREATE POLICY "Users can remove reference favorites"
    ON public.reference_favorites
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;