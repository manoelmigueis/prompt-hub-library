
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin_or_moderator(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_status(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_portfolio_by_username(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_public_collection(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.validate_invite_code(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.use_invite_code(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_username_available(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_copy_count(uuid) TO anon, authenticated, service_role;
