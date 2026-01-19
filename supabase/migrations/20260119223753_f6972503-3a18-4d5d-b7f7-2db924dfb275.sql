-- Fix: Require authentication to view profiles (prevents public scraping)
-- Drop the overly permissive policy that allows unauthenticated access
DROP POLICY IF EXISTS "Anyone can view active profiles" ON public.profiles;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view active profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND status = 'active'::user_status);