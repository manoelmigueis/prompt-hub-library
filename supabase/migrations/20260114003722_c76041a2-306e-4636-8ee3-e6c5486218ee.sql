-- 1. Create function to handle admin role assignment server-side
-- This replaces the client-side admin code check
CREATE OR REPLACE FUNCTION public.handle_admin_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if used invite code is the admin code (stored in invite_codes with is_admin flag)
  IF EXISTS (
    SELECT 1 FROM public.invite_codes 
    WHERE code = NEW.invite_code_used 
    AND created_by IS NULL  -- Admin codes are system-created (no creator)
    AND is_active = true
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create trigger for admin code handling
DROP TRIGGER IF EXISTS on_admin_invite_code ON public.profiles;
CREATE TRIGGER on_admin_invite_code
  AFTER UPDATE OF invite_code_used ON public.profiles
  FOR EACH ROW
  WHEN (NEW.invite_code_used IS NOT NULL AND OLD.invite_code_used IS NULL)
  EXECUTE FUNCTION public.handle_admin_invite_code();

-- 3. Also handle admin code on INSERT for new users
DROP TRIGGER IF EXISTS on_admin_invite_code_insert ON public.profiles;
CREATE TRIGGER on_admin_invite_code_insert
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.invite_code_used IS NOT NULL)
  EXECUTE FUNCTION public.handle_admin_invite_code();

-- 4. Drop the overly permissive invite_codes policy
DROP POLICY IF EXISTS "Anyone can check invite code validity" ON public.invite_codes;

-- 5. Create restrictive policy - only allow checking via RPC function
-- Users cannot browse/select invite codes directly
CREATE POLICY "Only authenticated users can validate specific codes"
ON public.invite_codes
FOR SELECT
USING (false);  -- Block all direct SELECT access; use RPC functions instead

-- 6. Fix the prompts UPDATE policy to prevent status/featured manipulation
DROP POLICY IF EXISTS "Users can update their own prompts" ON public.prompts;

CREATE POLICY "Users can update their own prompt content" 
ON public.prompts 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  -- Ensure user_id hasn't changed
  AND user_id IS NOT DISTINCT FROM (SELECT p.user_id FROM public.prompts p WHERE p.id = prompts.id)
  -- Ensure status hasn't changed (only admins can change status)
  AND status IS NOT DISTINCT FROM (SELECT p.status FROM public.prompts p WHERE p.id = prompts.id)
  -- Ensure is_featured hasn't changed (only admins can feature)
  AND is_featured IS NOT DISTINCT FROM (SELECT p.is_featured FROM public.prompts p WHERE p.id = prompts.id)
);