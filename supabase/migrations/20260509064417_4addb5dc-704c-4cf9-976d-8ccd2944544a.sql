
-- =========================================
-- Table: portfolio_collections (ensaios)
-- =========================================
CREATE TABLE IF NOT EXISTS public.portfolio_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_template BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS portfolio_collections_user_slug_idx
  ON public.portfolio_collections (user_id, lower(slug));

CREATE INDEX IF NOT EXISTS portfolio_collections_user_idx
  ON public.portfolio_collections (user_id);

ALTER TABLE public.portfolio_collections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view public collections"
  ON public.portfolio_collections
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users insert own collections"
  ON public.portfolio_collections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own collections"
  ON public.portfolio_collections
  FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users delete own collections"
  ON public.portfolio_collections
  FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin_or_moderator(auth.uid()));

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_portfolio_collections_updated_at ON public.portfolio_collections;
CREATE TRIGGER update_portfolio_collections_updated_at
  BEFORE UPDATE ON public.portfolio_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- Table: portfolio_collection_images
-- =========================================
CREATE TABLE IF NOT EXISTS public.portfolio_collection_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.portfolio_collections(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (collection_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS portfolio_collection_images_collection_idx
  ON public.portfolio_collection_images (collection_id, sort_order);

ALTER TABLE public.portfolio_collection_images ENABLE ROW LEVEL SECURITY;

-- Policies: visible if parent collection is visible
CREATE POLICY "View images of accessible collections"
  ON public.portfolio_collection_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_collections c
      WHERE c.id = portfolio_collection_images.collection_id
        AND (c.is_public = true OR c.user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()))
    )
  );

CREATE POLICY "Owner inserts images in own collection"
  ON public.portfolio_collection_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolio_collections c
      WHERE c.id = portfolio_collection_images.collection_id
        AND (c.user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()))
    )
  );

CREATE POLICY "Owner updates images in own collection"
  ON public.portfolio_collection_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_collections c
      WHERE c.id = portfolio_collection_images.collection_id
        AND (c.user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()))
    )
  );

CREATE POLICY "Owner deletes images in own collection"
  ON public.portfolio_collection_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_collections c
      WHERE c.id = portfolio_collection_images.collection_id
        AND (c.user_id = auth.uid() OR public.is_admin_or_moderator(auth.uid()))
    )
  );

-- =========================================
-- Public RPC: fetch a collection by username + slug
-- =========================================
CREATE OR REPLACE FUNCTION public.get_public_collection(_username TEXT, _slug TEXT)
RETURNS TABLE (
  collection_id UUID,
  user_id UUID,
  title TEXT,
  slug TEXT,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN,
  display_name TEXT,
  username TEXT,
  avatar_url TEXT,
  bio TEXT,
  instagram TEXT,
  whatsapp TEXT,
  website TEXT,
  youtube TEXT,
  tiktok TEXT,
  twitter TEXT,
  show_social_links BOOLEAN
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id, p.id, c.title, c.slug, c.description, c.cover_image_url, c.is_public,
    p.display_name, p.username, p.avatar_url, p.bio,
    p.instagram, p.whatsapp, p.website, p.youtube, p.tiktok, p.twitter,
    p.show_social_links
  FROM public.portfolio_collections c
  JOIN public.profiles p ON p.id = c.user_id
  WHERE LOWER(p.username) = LOWER(_username)
    AND LOWER(c.slug) = LOWER(_slug)
    AND c.is_public = true
  LIMIT 1;
$$;
