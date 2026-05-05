-- Allow profile/cover uploads up to 20 MB in existing public image buckets
UPDATE storage.buckets
SET file_size_limit = 20971520
WHERE id IN ('avatars', 'prompt-images');

-- Portfolio customer orders
CREATE TABLE IF NOT EXISTS public.portfolio_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_whatsapp TEXT,
  customer_note TEXT,
  selected_prompt_ids UUID[] NOT NULL DEFAULT '{}',
  selected_image_urls TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'novo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_portfolio_orders_owner_created
ON public.portfolio_orders(owner_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_portfolio_orders_portfolio_created
ON public.portfolio_orders(portfolio_id, created_at DESC);

DROP TRIGGER IF EXISTS update_portfolio_orders_updated_at ON public.portfolio_orders;
CREATE TRIGGER update_portfolio_orders_updated_at
BEFORE UPDATE ON public.portfolio_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Anyone can create orders for published portfolios" ON public.portfolio_orders;
CREATE POLICY "Anyone can create orders for published portfolios"
ON public.portfolio_orders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.portfolios p
    WHERE p.id = portfolio_orders.portfolio_id
      AND p.user_id = portfolio_orders.owner_user_id
      AND p.is_published = true
  )
);

DROP POLICY IF EXISTS "Portfolio owners can view own orders" ON public.portfolio_orders;
CREATE POLICY "Portfolio owners can view own orders"
ON public.portfolio_orders
FOR SELECT
USING (auth.uid() = owner_user_id OR public.is_admin_or_moderator(auth.uid()));

DROP POLICY IF EXISTS "Portfolio owners can update own orders" ON public.portfolio_orders;
CREATE POLICY "Portfolio owners can update own orders"
ON public.portfolio_orders
FOR UPDATE
USING (auth.uid() = owner_user_id OR public.is_admin_or_moderator(auth.uid()))
WITH CHECK (auth.uid() = owner_user_id OR public.is_admin_or_moderator(auth.uid()));

-- Portfolio validation: every user can use any approved prompt from the acervo.
CREATE OR REPLACE FUNCTION public.validate_portfolio_item()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_prompt_status TEXT;
BEGIN
  SELECT status INTO v_prompt_status FROM public.prompts WHERE id = NEW.prompt_id;

  IF v_prompt_status <> 'approved' THEN
    RAISE EXCEPTION 'Only approved prompts can be added to a portfolio';
  END IF;

  RETURN NEW;
END;
$function$;