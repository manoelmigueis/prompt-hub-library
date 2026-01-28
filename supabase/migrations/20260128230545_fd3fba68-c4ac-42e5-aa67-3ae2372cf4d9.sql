-- Fix: Restrict profile visibility to only owner and admins
-- Currently any authenticated user can view all active profiles, exposing social media handles

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view active profiles" ON public.profiles;

-- Create restrictive policy - users can only view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Note: "Admins can view all profiles" policy already exists and will continue to work