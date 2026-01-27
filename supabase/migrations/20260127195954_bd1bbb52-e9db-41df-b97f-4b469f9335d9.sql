-- 1) Add explicit flag for admin-granting invite codes (avoids implicit "created_by IS NULL" meaning)
ALTER TABLE public.invite_codes
ADD COLUMN IF NOT EXISTS grants_admin boolean NOT NULL DEFAULT false;

-- Normalize any NULL counters (defense-in-depth)
UPDATE public.invite_codes
SET current_uses = COALESCE(current_uses, 0)
WHERE current_uses IS NULL;

-- 2) Immediately deactivate the previously hardcoded admin code (and ensure it cannot grant admin)
UPDATE public.invite_codes
SET is_active = false,
    grants_admin = false,
    max_uses = COALESCE(max_uses, 1)
WHERE code = 'impossivelpro';

-- 3) Replace admin-assignment function to ONLY honor codes explicitly marked as grants_admin
CREATE OR REPLACE FUNCTION public.handle_admin_invite_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only proceed when invite_code_used is set
  IF NEW.invite_code_used IS NULL OR NEW.invite_code_used = '' THEN
    RETURN NEW;
  END IF;

  -- Grant admin ONLY when the code is explicitly flagged and still valid
  IF EXISTS (
    SELECT 1
    FROM public.invite_codes ic
    WHERE ic.code = NEW.invite_code_used
      AND ic.grants_admin = true
      AND ic.is_active = true
      AND (ic.max_uses IS NULL OR COALESCE(ic.current_uses, 0) <= ic.max_uses)
      AND (ic.expires_at IS NULL OR ic.expires_at > now())
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 4) Bootstrap a new *non-hardcoded* admin invite code (single-use, expires in 7 days)
-- NOTE: the actual code value is generated at migration runtime (not stored in source control)
INSERT INTO public.invite_codes (code, created_by, max_uses, current_uses, is_active, expires_at, grants_admin)
SELECT
  encode(gen_random_bytes(16), 'hex') AS code,
  NULL::uuid AS created_by,
  1 AS max_uses,
  0 AS current_uses,
  true AS is_active,
  now() + interval '7 days' AS expires_at,
  true AS grants_admin
WHERE NOT EXISTS (
  SELECT 1
  FROM public.invite_codes
  WHERE grants_admin = true
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
);
