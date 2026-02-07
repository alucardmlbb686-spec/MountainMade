-- Admin Features Migration
-- Adds user_activity table, order status column, and storage bucket for product images

-- 1. Create user_activity table for tracking user actions
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add status column to orders table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.orders
        ADD COLUMN status public.order_status DEFAULT 'pending'::public.order_status;
    END IF;
END $$;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_action_type ON public.user_activity(action_type);

-- 4. Enable RLS
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for user_activity
DROP POLICY IF EXISTS "users_view_own_activity" ON public.user_activity;
CREATE POLICY "users_view_own_activity"
ON public.user_activity
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_view_all_activity" ON public.user_activity;
CREATE POLICY "admins_view_all_activity"
ON public.user_activity
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "system_insert_activity" ON public.user_activity;
CREATE POLICY "system_insert_activity"
ON public.user_activity
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 6. Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage policies for product-images bucket
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "admins_upload_product_images" ON storage.objects;
CREATE POLICY "admins_upload_product_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'product-images' 
    AND public.is_admin()
);

DROP POLICY IF EXISTS "admins_update_product_images" ON storage.objects;
CREATE POLICY "admins_update_product_images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND public.is_admin()
)
WITH CHECK (
    bucket_id = 'product-images' 
    AND public.is_admin()
);

DROP POLICY IF EXISTS "admins_delete_product_images" ON storage.objects;
CREATE POLICY "admins_delete_product_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'product-images' 
    AND public.is_admin()
);

-- 8. Mock data for user_activity
DO $$
DECLARE
    existing_user_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get existing users
    SELECT id INTO admin_user_id FROM public.user_profiles WHERE email = 'admin@mountainmade.com' LIMIT 1;
    SELECT id INTO existing_user_id FROM public.user_profiles WHERE email != 'admin@mountainmade.com' LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_activity (user_id, action_type, description, metadata)
        VALUES 
            (admin_user_id, 'login', 'Admin logged into dashboard', jsonb_build_object('ip', '192.168.1.1', 'device', 'Chrome Browser')),
            (admin_user_id, 'product_create', 'Created new product: Himalayan Honey', jsonb_build_object('product_id', gen_random_uuid(), 'category', 'Honey')),
            (admin_user_id, 'order_update', 'Updated order status to shipped', jsonb_build_object('order_id', gen_random_uuid(), 'old_status', 'processing', 'new_status', 'shipped'))
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO public.user_activity (user_id, action_type, description, metadata)
        VALUES 
            (existing_user_id, 'login', 'User logged in', jsonb_build_object('ip', '192.168.1.2', 'device', 'Mobile Safari')),
            (existing_user_id, 'order_create', 'Placed new order', jsonb_build_object('order_id', gen_random_uuid(), 'total', 125.50)),
            (existing_user_id, 'profile_update', 'Updated profile information', jsonb_build_object('fields', ARRAY['phone', 'address']))
        ON CONFLICT (id) DO NOTHING;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;