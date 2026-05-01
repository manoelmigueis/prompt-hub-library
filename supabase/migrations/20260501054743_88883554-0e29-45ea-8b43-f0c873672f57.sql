ALTER TABLE public.portfolios
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_social_links BOOLEAN NOT NULL DEFAULT true;

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
  v_is_admin BOOLEAN;
BEGIN
  SELECT user_id INTO v_owner FROM public.portfolios WHERE id = NEW.portfolio_id;
  SELECT user_id, status INTO v_prompt_owner, v_prompt_status FROM public.prompts WHERE id = NEW.prompt_id;

  v_is_admin := public.is_admin_or_moderator(v_owner);

  IF v_prompt_status <> 'approved' THEN
    RAISE EXCEPTION 'Only approved prompts can be added to a portfolio';
  END IF;

  IF NOT v_is_admin AND v_prompt_owner IS DISTINCT FROM v_owner THEN
    RAISE EXCEPTION 'Only your own prompts can be added to your portfolio';
  END IF;

  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.get_public_portfolio_by_username(text);

CREATE OR REPLACE FUNCTION public.get_public_portfolio_by_username(_username text)
RETURNS TABLE(
  user_id uuid, display_name text, username text, avatar_url text, bio text,
  instagram text, whatsapp text, website text, youtube text, tiktok text, twitter text,
  show_social_links boolean,
  portfolio_id uuid, title text, about text, cover_prompt_id uuid, cover_image_url text, is_published boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, p.display_name, p.username, p.avatar_url, p.bio,
    p.instagram, p.whatsapp, p.website, p.youtube, p.tiktok, p.twitter,
    p.show_social_links,
    pf.id, pf.title, pf.about, pf.cover_prompt_id, pf.cover_image_url, pf.is_published
  FROM public.profiles p
  LEFT JOIN public.portfolios pf ON pf.user_id = p.id
  WHERE LOWER(p.username) = LOWER(_username)
    AND (pf.is_published = true OR pf.id IS NULL);
$$;