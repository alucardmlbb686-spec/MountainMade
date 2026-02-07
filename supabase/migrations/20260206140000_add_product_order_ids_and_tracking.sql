-- Add unique sequential product IDs and order tracking

-- 1. Add product_display_id column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS product_display_id TEXT UNIQUE;

-- 2. Create function to generate sequential product IDs
CREATE OR REPLACE FUNCTION public.generate_product_display_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    max_id INTEGER;
    new_id TEXT;
BEGIN
    -- Get the highest existing product_display_id number
    SELECT COALESCE(MAX(CAST(SUBSTRING(product_display_id FROM '[0-9]+') AS INTEGER)), 0)
    INTO max_id
    FROM public.products
    WHERE product_display_id IS NOT NULL;
    
    -- Generate next ID with leading zeros (01, 02, 03, etc.)
    new_id := LPAD((max_id + 1)::TEXT, 2, '0');
    
    RETURN new_id;
END;
$$;

-- 3. Create trigger to auto-assign product_display_id on insert
CREATE OR REPLACE FUNCTION public.assign_product_display_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.product_display_id IS NULL THEN
        NEW.product_display_id := public.generate_product_display_id();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_assign_product_display_id ON public.products;
CREATE TRIGGER trigger_assign_product_display_id
    BEFORE INSERT ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_product_display_id();

-- 4. Backfill existing products with display IDs
DO $$
DECLARE
    product_record RECORD;
    counter INTEGER := 1;
BEGIN
    FOR product_record IN 
        SELECT id FROM public.products WHERE product_display_id IS NULL ORDER BY created_at
    LOOP
        UPDATE public.products
        SET product_display_id = LPAD(counter::TEXT, 2, '0')
        WHERE id = product_record.id;
        counter := counter + 1;
    END LOOP;
END $$;

-- 5. Add order_display_id column to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS order_display_id TEXT UNIQUE;

-- 6. Create function to generate sequential order IDs
CREATE OR REPLACE FUNCTION public.generate_order_display_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    max_id INTEGER;
    new_id TEXT;
BEGIN
    -- Get the highest existing order_display_id number
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_display_id FROM '[0-9]+') AS INTEGER)), 0)
    INTO max_id
    FROM public.orders
    WHERE order_display_id IS NOT NULL;
    
    -- Generate next ID with leading zeros (01, 02, 03, etc.)
    new_id := LPAD((max_id + 1)::TEXT, 2, '0');
    
    RETURN new_id;
END;
$$;

-- 7. Create trigger to auto-assign order_display_id on insert
CREATE OR REPLACE FUNCTION public.assign_order_display_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.order_display_id IS NULL THEN
        NEW.order_display_id := public.generate_order_display_id();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_assign_order_display_id ON public.orders;
CREATE TRIGGER trigger_assign_order_display_id
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_order_display_id();

-- 8. Backfill existing orders with display IDs
DO $$
DECLARE
    order_record RECORD;
    counter INTEGER := 1;
BEGIN
    FOR order_record IN 
        SELECT id FROM public.orders WHERE order_display_id IS NULL ORDER BY created_at
    LOOP
        UPDATE public.orders
        SET order_display_id = LPAD(counter::TEXT, 2, '0')
        WHERE id = order_record.id;
        counter := counter + 1;
    END LOOP;
END $$;

-- 9. Update order_status enum to include new tracking statuses
DROP TYPE IF EXISTS public.order_status CASCADE;
CREATE TYPE public.order_status AS ENUM (
    'pending',
    'order_confirmed',
    'shipped',
    'in_transit',
    'delivered',
    'cancelled'
);

-- 10. Re-add status column with new enum (existing data will be lost, but only 2 test orders exist)
ALTER TABLE public.orders
DROP COLUMN IF EXISTS status;

ALTER TABLE public.orders
ADD COLUMN status public.order_status DEFAULT 'pending'::public.order_status;

-- 11. Add admin confirmation tracking columns
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.user_profiles(id),
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS in_transit_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- 12. Create function to update order status timestamps
CREATE OR REPLACE FUNCTION public.update_order_status_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- When status changes to order_confirmed
    IF NEW.status = 'order_confirmed'::public.order_status AND OLD.status != 'order_confirmed'::public.order_status THEN
        NEW.confirmed_at := NOW();
    END IF;
    
    -- When status changes to shipped
    IF NEW.status = 'shipped'::public.order_status AND OLD.status != 'shipped'::public.order_status THEN
        NEW.shipped_at := NOW();
    END IF;
    
    -- When status changes to in_transit
    IF NEW.status = 'in_transit'::public.order_status AND OLD.status != 'in_transit'::public.order_status THEN
        NEW.in_transit_at := NOW();
    END IF;
    
    -- When status changes to delivered
    IF NEW.status = 'delivered'::public.order_status AND OLD.status != 'delivered'::public.order_status THEN
        NEW.delivered_at := NOW();
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_order_status_timestamps ON public.orders;
CREATE TRIGGER trigger_update_order_status_timestamps
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_order_status_timestamps();

-- 13. Enable RLS on orders table if not already enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 14. Create RLS policies for orders
DROP POLICY IF EXISTS "users_view_own_orders" ON public.orders;
CREATE POLICY "users_view_own_orders"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_create_own_orders" ON public.orders;
CREATE POLICY "users_create_own_orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_manage_all_orders" ON public.orders;
CREATE POLICY "admins_manage_all_orders"
ON public.orders
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);