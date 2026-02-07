-- Add tracking notes/location and tracking number to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255),
ADD COLUMN IF NOT EXISTS current_location VARCHAR(500),
ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create function to update last_updated_at when status changes
CREATE OR REPLACE FUNCTION public.update_order_last_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_updated_at := NOW();
  -- Auto-generate tracking number if not set and status is not pending
  IF NEW.tracking_number IS NULL AND NEW.status != 'pending'::public.order_status THEN
    NEW.tracking_number := 'DTDC' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || SUBSTRING(gen_random_uuid()::TEXT, 1, 4);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_order_last_updated ON public.orders;
CREATE TRIGGER trigger_update_order_last_updated
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_order_last_updated();

-- Create order_tracking_updates table to log all status changes
CREATE TABLE IF NOT EXISTS public.order_tracking_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status public.order_status NOT NULL,
  location VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to log status updates to tracking_updates table
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO public.order_tracking_updates (order_id, status, description)
    VALUES (
      NEW.id,
      NEW.status,
      CASE
        WHEN NEW.status = 'order_confirmed'::public.order_status THEN 'Your order has been confirmed and is being prepared'
        WHEN NEW.status = 'shipped'::public.order_status THEN 'Your order has been shipped from our warehouse'
        WHEN NEW.status = 'in_transit'::public.order_status THEN 'Package has reached the destination city'
        WHEN NEW.status = 'delivered'::public.order_status THEN 'Your order has been delivered'
        WHEN NEW.status = 'cancelled'::public.order_status THEN 'Your order has been cancelled'
        ELSE 'Order status updated'
      END
    );
    
    -- Update current location based on status
    IF NEW.status = 'shipped'::public.order_status THEN
      NEW.current_location := 'Mountain Mart Warehouse, Delhi';
    ELSIF NEW.status = 'in_transit'::public.order_status THEN
      NEW.current_location := 'Dehradun Sorting Center';
    ELSIF NEW.status = 'delivered'::public.order_status THEN
      NEW.current_location := 'Delivered to recipient';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_order_status_change ON public.orders;
CREATE TRIGGER trigger_log_order_status_change
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.log_order_status_change();

-- Enable RLS on order_tracking_updates
ALTER TABLE public.order_tracking_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_tracking_updates
DROP POLICY IF EXISTS "users_view_order_tracking" ON public.order_tracking_updates;
CREATE POLICY "users_view_order_tracking"
ON public.order_tracking_updates
FOR SELECT
TO authenticated
USING (
  order_id IN (
    SELECT id FROM public.orders WHERE user_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_tracking_updates_order_id ON public.order_tracking_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_updates_created_at ON public.order_tracking_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at ON public.orders(user_id, created_at DESC);
