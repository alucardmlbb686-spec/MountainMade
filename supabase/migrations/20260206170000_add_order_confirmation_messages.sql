-- Create order_confirmations table to track confirmation messages
CREATE TABLE IF NOT EXISTS public.order_confirmations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  confirmed_by UUID REFERENCES public.user_profiles(id),
  confirmation_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add confirmed_message column to orders table if not exists
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS confirmation_message TEXT;

-- Enable RLS on order_confirmations
ALTER TABLE public.order_confirmations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_confirmations
DROP POLICY IF EXISTS "users_view_own_confirmations" ON public.order_confirmations;
CREATE POLICY "users_view_own_confirmations"
ON public.order_confirmations
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "admins_manage_confirmations" ON public.order_confirmations;
CREATE POLICY "admins_manage_confirmations"
ON public.order_confirmations
FOR ALL
TO authenticated
USING (
  confirmed_by IN (
    SELECT id FROM public.user_profiles WHERE role = 'admin' AND id = auth.uid()
  )
)
WITH CHECK (
  confirmed_by IN (
    SELECT id FROM public.user_profiles WHERE role = 'admin' AND id = auth.uid()
  )
);

-- Create trigger to update order confirmation_message when confirmation is created
CREATE OR REPLACE FUNCTION public.update_order_confirmation_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.orders
  SET confirmation_message = NEW.confirmation_message
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_order_confirmation_message ON public.order_confirmations;
CREATE TRIGGER trigger_update_order_confirmation_message
  AFTER INSERT ON public.order_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_confirmation_message();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_confirmations_order_id ON public.order_confirmations(order_id);
CREATE INDEX IF NOT EXISTS idx_order_confirmations_created_at ON public.order_confirmations(created_at DESC);
