-- 1. Add bio, username, whatsapp to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON public.profiles (LOWER(username))
  WHERE username IS NOT NULL;

-- 2. Portfolios table (one per user)
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  title TEXT,
  about TEXT,
  cover_prompt_id UUID,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published portfolios"
  ON public.portfolios FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY "Users manage own portfolio insert"
  ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own portfolio update"
  ON public.portfolios FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own portfolio delete"
  ON public.portfolios FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Portfolio items
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(portfolio_id, prompt_id)
);

CREATE INDEX IF NOT EXISTS portfolio_items_portfolio_idx
  ON public.portfolio_items(portfolio_id, position);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view items of published portfolios"
  ON public.portfolio_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = portfolio_id
        AND (p.is_published = true OR p.user_id = auth.uid())
    )
  );

CREATE POLICY "Users insert items in own portfolio"
  ON public.portfolio_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = portfolio_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users update items in own portfolio"
  ON public.portfolio_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = portfolio_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users delete items in own portfolio"
  ON public.portfolio_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolios p
      WHERE p.id = portfolio_id AND p.user_id = auth.uid()
    )
  );

-- 4. Validation trigger: only owner's approved prompts can be added
CREATE OR REPLACE FUNCTION public.validate_portfolio_item()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
  v_prompt_owner UUID;
  v_prompt_status TEXT;
BEGIN
  SELECT user_id INTO v_owner FROM public.portfolios WHERE id = NEW.portfolio_id;
  SELECT user_id, status INTO v_prompt_owner, v_prompt_status FROM public.prompts WHERE id = NEW.prompt_id;

  IF v_prompt_owner IS DISTINCT FROM v_owner THEN
    RAISE EXCEPTION 'Only your own prompts can be added to your portfolio';
  END IF;
  IF v_prompt_status <> 'approved' THEN
    RAISE EXCEPTION 'Only approved prompts can be added to your portfolio';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_portfolio_item_trigger
  BEFORE INSERT OR UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.validate_portfolio_item();

-- 5. Public profile lookup by username (for /portfolio/[username])
CREATE OR REPLACE FUNCTION public.get_public_portfolio_by_username(_username TEXT)
RETURNS TABLE (
  user_id UUID,
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
  portfolio_id UUID,
  title TEXT,
  about TEXT,
  cover_prompt_id UUID,
  is_published BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, p.display_name, p.username, p.avatar_url, p.bio,
    p.instagram, p.whatsapp, p.website, p.youtube, p.tiktok, p.twitter,
    pf.id, pf.title, pf.about, pf.cover_prompt_id, pf.is_published
  FROM public.profiles p
  LEFT JOIN public.portfolios pf ON pf.user_id = p.id
  WHERE LOWER(p.username) = LOWER(_username)
    AND (pf.is_published = true OR pf.id IS NULL);
$$;

-- 6. Helper to check username availability
CREATE OR REPLACE FUNCTION public.is_username_available(_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE LOWER(username) = LOWER(_username)
      AND id <> COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
  );
$$;