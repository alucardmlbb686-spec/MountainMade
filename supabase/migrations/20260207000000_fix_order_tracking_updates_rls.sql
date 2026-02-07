-- Fix RLS policies for order_tracking_updates table to allow inserts via triggers

-- Drop existing policies
DROP POLICY IF EXISTS "users_view_order_tracking" ON public.order_tracking_updates;

-- Add policy for users to view their order tracking updates
CREATE POLICY "users_view_own_order_tracking"
ON public.order_tracking_updates
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);

-- Add policy to allow service role (and triggers) to insert
CREATE POLICY "allow_insert_order_tracking"
ON public.order_tracking_updates
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add policy to allow service role to update
CREATE POLICY "allow_update_order_tracking"
ON public.order_tracking_updates
FOR UPDATE
TO authenticated
USING (true);
