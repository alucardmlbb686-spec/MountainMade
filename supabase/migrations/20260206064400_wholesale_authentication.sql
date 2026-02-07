-- Wholesale Authentication Migration
-- Extends user_role enum to include wholesale customers and adds wholesale-specific functionality

-- 1. Extend user_role enum to include wholesale (safe idempotent approach)
DO $$
BEGIN
    -- Check if user_role type exists and if 'wholesale' value doesn't exist
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum e
            JOIN pg_type t ON e.enumtypid = t.oid
            WHERE t.typname = 'user_role'
            AND e.enumlabel = 'wholesale'
        ) THEN
            ALTER TYPE public.user_role ADD VALUE 'wholesale';
        END IF;
    END IF;
END $$;

-- 2. Create wholesale-specific helper function (with table existence check)
CREATE OR REPLACE FUNCTION public.is_wholesale()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user_profiles table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
    ) THEN
        RETURN false;
    END IF;
    
    -- Check if user has wholesale role
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'wholesale'::public.user_role
    );
END;
$$;

-- 3. Create wholesale_orders table for bulk orders
CREATE TABLE IF NOT EXISTS public.wholesale_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    status public.order_status DEFAULT 'pending'::public.order_status,
    shipping_address TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create wholesale_order_items table
CREATE TABLE IF NOT EXISTS public.wholesale_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wholesale_order_id UUID REFERENCES public.wholesale_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create indexes for wholesale tables
CREATE INDEX IF NOT EXISTS idx_wholesale_orders_user_id ON public.wholesale_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_orders_status ON public.wholesale_orders(status);
CREATE INDEX IF NOT EXISTS idx_wholesale_order_items_order_id ON public.wholesale_order_items(wholesale_order_id);

-- 6. Enable RLS on wholesale tables
ALTER TABLE public.wholesale_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_order_items ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for wholesale_orders
DROP POLICY IF EXISTS "wholesale_users_manage_own_orders" ON public.wholesale_orders;
CREATE POLICY "wholesale_users_manage_own_orders"
ON public.wholesale_orders
FOR ALL
TO authenticated
USING (user_id = auth.uid() AND public.is_wholesale())
WITH CHECK (user_id = auth.uid() AND public.is_wholesale());

DROP POLICY IF EXISTS "admins_view_all_wholesale_orders" ON public.wholesale_orders;
CREATE POLICY "admins_view_all_wholesale_orders"
ON public.wholesale_orders
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admins_update_wholesale_orders" ON public.wholesale_orders;
CREATE POLICY "admins_update_wholesale_orders"
ON public.wholesale_orders
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 8. RLS Policies for wholesale_order_items
DROP POLICY IF EXISTS "wholesale_users_view_own_order_items" ON public.wholesale_order_items;
CREATE POLICY "wholesale_users_view_own_order_items"
ON public.wholesale_order_items
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.wholesale_orders
        WHERE wholesale_orders.id = wholesale_order_items.wholesale_order_id
        AND wholesale_orders.user_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "admins_manage_wholesale_order_items" ON public.wholesale_order_items;
CREATE POLICY "admins_manage_wholesale_order_items"
ON public.wholesale_order_items
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 9. Add triggers for wholesale tables
DROP TRIGGER IF EXISTS update_wholesale_orders_updated_at ON public.wholesale_orders;
CREATE TRIGGER update_wholesale_orders_updated_at
    BEFORE UPDATE ON public.wholesale_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 10. Mock Data for wholesale customers
DO $$
DECLARE
    wholesale1_uuid UUID := gen_random_uuid();
    wholesale2_uuid UUID := gen_random_uuid();
    wholesale_order1_uuid UUID := gen_random_uuid();
    product_uuid UUID;
BEGIN
    -- Create wholesale auth users
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (wholesale1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'wholesale@mountainmade.com', crypt('Wholesale@123', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Wholesale Customer', 'role', 'wholesale'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, '', '', '', null),
        (wholesale2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'bulk.buyer@example.com', crypt('Wholesale@456', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Bulk Buyer Co', 'role', 'wholesale'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, '', '', '', null)
    ON CONFLICT (id) DO NOTHING;

    -- Get a product UUID for sample order
    SELECT id INTO product_uuid FROM public.products LIMIT 1;

    -- Create sample wholesale order
    IF product_uuid IS NOT NULL THEN
        INSERT INTO public.wholesale_orders (id, user_id, total_amount, discount_percentage, status, shipping_address, notes)
        VALUES (
            wholesale_order1_uuid,
            wholesale1_uuid,
            5000.00,
            15.00,
            'processing'::public.order_status,
            '123 Wholesale District, Business City, BC 12345',
            'Bulk order for retail distribution'
        )
        ON CONFLICT (id) DO NOTHING;

        -- Create sample wholesale order items
        INSERT INTO public.wholesale_order_items (wholesale_order_id, product_id, quantity, unit_price, discount_price)
        VALUES (
            wholesale_order1_uuid,
            product_uuid,
            100,
            50.00,
            42.50
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;