
ALTER TABLE public.portfolio_orders
  ADD COLUMN IF NOT EXISTS completed_image_indexes integer[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

ALTER TABLE public.portfolio_orders REPLICA IDENTITY FULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'portfolio_orders'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_orders';
  END IF;
END $$;

DO $$ BEGIN
  CREATE POLICY "Owners can delete own orders"
    ON public.portfolio_orders
    FOR DELETE
    USING ((auth.uid() = owner_user_id) OR is_admin_or_moderator(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
