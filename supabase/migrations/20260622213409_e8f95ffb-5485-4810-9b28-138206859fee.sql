
-- 1) Drop broad SELECT on storage.objects for avatars (public bucket still serves files via public URL, listing disabled)
DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;

-- 2) Restrict camera_references INSERT to admins/moderators (drop open authenticated INSERT; "Admins can manage references" ALL policy already covers admins)
DROP POLICY IF EXISTS "Authenticated users can insert references" ON public.camera_references;

-- 3) Remove portfolio_orders from realtime publication (prevents authenticated users from opening a Realtime subscription that streams customer data)
ALTER PUBLICATION supabase_realtime DROP TABLE public.portfolio_orders;

-- 4) Lock down SECURITY DEFINER helpers / triggers that should NOT be callable from PostgREST
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_admin_email() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_admin_invite_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_portfolio_item() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin_or_moderator(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_status(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_copy_count(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.use_invite_code(text) FROM anon, PUBLIC;

-- Keep public/authenticated EXECUTE on functions that the app intentionally calls from clients:
--   validate_invite_code(text), is_username_available(text), get_public_profiles(uuid[]),
--   get_public_portfolio_by_username(text), get_public_collection(text,text),
--   increment_view_count/increment_copy_count for authenticated users.
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_copy_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.use_invite_code(text) TO authenticated;

-- 5) Document profiles sensitivity to prevent future broad SELECT policies leaking whatsapp/invite_code_used
COMMENT ON COLUMN public.profiles.whatsapp IS 'SENSITIVE: never expose via public SELECT policy. Use get_public_profiles() for public-facing fields only.';
COMMENT ON COLUMN public.profiles.invite_code_used IS 'SENSITIVE: never expose via public SELECT policy. Owner+admin only.';
COMMENT ON COLUMN public.profiles.has_access IS 'SENSITIVE: never expose via public SELECT policy. Owner+admin only.';
COMMENT ON COLUMN public.profiles.status IS 'SENSITIVE: never expose via public SELECT policy. Owner+admin only.';
