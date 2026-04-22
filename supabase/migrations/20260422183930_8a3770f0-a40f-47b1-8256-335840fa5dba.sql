
-- 1) Restrict profiles SELECT: drop broad policy, create owner+admin only
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;

-- (Existing "Users can view own profile" and "Admins can view all profiles" remain.)

-- 2) Create a safe public view exposing only non-sensitive author fields
CREATE OR REPLACE VIEW public.public_profiles
WITH (security_invoker = true) AS
SELECT id, display_name, avatar_url, instagram
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Allow authenticated reads of just these columns through the view by adding
-- a column-restricted SELECT policy on profiles (view runs as invoker).
CREATE POLICY "Authenticated can read public profile fields"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- The above is still broad; replace it: drop and recreate restricted via view only.
DROP POLICY "Authenticated can read public profile fields" ON public.profiles;

-- Instead, expose the view as SECURITY DEFINER function-style by giving the view
-- bypass rights. We re-create the view as security_definer-ish using a function.
DROP VIEW IF EXISTS public.public_profiles;

CREATE OR REPLACE FUNCTION public.get_public_profiles(_ids uuid[])
RETURNS TABLE(id uuid, display_name text, avatar_url text, instagram text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.avatar_url, p.instagram
  FROM public.profiles p
  WHERE p.id = ANY(_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO anon, authenticated;

-- 3) Refactor use_invite_code to drop _user_id parameter (use auth.uid())
DROP FUNCTION IF EXISTS public.use_invite_code(text, uuid);

CREATE OR REPLACE FUNCTION public.use_invite_code(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_code_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated';
  END IF;

  SELECT id INTO v_code_id
  FROM public.invite_codes
  WHERE code = _code
    AND is_active = true
    AND (max_uses IS NULL OR current_uses < max_uses)
    AND (expires_at IS NULL OR expires_at > now());

  IF v_code_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.invite_codes
  SET current_uses = current_uses + 1,
      used_by = CASE WHEN max_uses = 1 THEN v_user_id ELSE used_by END
  WHERE id = v_code_id;

  UPDATE public.profiles
  SET invite_code_used = _code,
      has_access = true
  WHERE id = v_user_id;

  RETURN TRUE;
END;
$$;

-- 4) Tighten prompt-images INSERT to enforce uid path scoping
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;

CREATE POLICY "Users can upload to own folder in prompt-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'prompt-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5) Restrict broad listing on public buckets while still allowing direct URL access.
-- Public buckets serve files via signed-less public URLs regardless of RLS, so dropping
-- the broad SELECT only stops listing, not direct image fetches via getPublicUrl.
DROP POLICY IF EXISTS "Anyone can view prompt images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
