
-- Update use_invite_code to also set has_access = true on the profile
CREATE OR REPLACE FUNCTION public.use_invite_code(_code text, _user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_code_id UUID;
BEGIN
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
      used_by = CASE WHEN max_uses = 1 THEN _user_id ELSE used_by END
  WHERE id = v_code_id;
  
  UPDATE public.profiles
  SET invite_code_used = _code,
      has_access = true
  WHERE id = _user_id;
  
  RETURN TRUE;
END;
$$;
