
-- Allow any authenticated user to read basic profile info (for displaying author on cards)
CREATE POLICY "Authenticated users can read profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);
