-- Add RLS and Policies to categories table
-- This enables public read access to active categories (required for category lists to load)
-- 
-- ISSUE: Categories table was created with RLS enabled but WITHOUT policies
-- This prevented any user (authenticated or not) from reading categories
-- 
-- FIX: Add explicit policies to allow public read and admin management

-- 1. Enable RLS on categories (in case it wasn't already enabled)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any (to avoid conflicts when re-running)
DROP POLICY IF EXISTS "public_view_categories" ON public.categories;
DROP POLICY IF EXISTS "admins_manage_categories" ON public.categories;

-- 3. Create public read policy for active categories
--    This allows anyone (authenticated or not) to read categories where is_active = true
CREATE POLICY "public_view_categories"
ON public.categories
FOR SELECT
TO public
USING (is_active = true);

-- 4. Create admin management policy
--    This allows admin users to create, update, and delete categories
CREATE POLICY "admins_manage_categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Verify products table has the same policy structure
--    Products should work, but we ensure consistency
DROP POLICY IF EXISTS "public_view_products" ON public.products;
DROP POLICY IF EXISTS "admins_manage_products" ON public.products;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_view_products"
ON public.products
FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "admins_manage_products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
