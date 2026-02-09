# RLS Fix for Categories & Products Tables

## Issue
Categories and products are stuck loading because the categories table lacks proper RLS policies for public access.

## Solution
Apply this migration to Supabase to enable public read access for both tables.

### Steps to Apply (Supabase Dashboard):

1. Go to: https://supabase.com → Select your project
2. Navigate to: **SQL Editor** → **New Query**
3. Copy and paste the SQL below
4. Click **Run**

---

## SQL Migration

\`\`\`sql
-- Fix RLS Issues for Categories Table
-- Re-apply this if categories table already has correct setup

-- 1. Drop existing policies (if they exist) to avoid conflicts
DROP POLICY IF EXISTS "public_view_categories" ON public.categories CASCADE;
DROP POLICY IF EXISTS "admins_manage_categories" ON public.categories CASCADE;

-- 2. Ensure RLS is enabled
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Create public read policy for active categories
CREATE POLICY "public_view_categories"
ON public.categories
FOR SELECT
TO public
USING (is_active = true);

-- 4. Create admin management policy  
CREATE POLICY "admins_manage_categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Verify products table has correct policies
-- Products should already have these, but we'll ensure they exist
DROP POLICY IF EXISTS "public_view_products" ON public.products CASCADE;
DROP POLICY IF EXISTS "admins_manage_products" ON public.products CASCADE;

-- 6. Ensure RLS is enabled on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 7. Create public read policy for active products
CREATE POLICY "public_view_products"
ON public.products
FOR SELECT
TO public
USING (is_active = true);

-- 8. Create admin management policy for products
CREATE POLICY "admins_manage_products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
\`\`\`

---

## Verification

After applying the migration:

1. **Refresh your browser** at http://localhost:3000
2. Check the homepage - you should see:
   - ✅ "Explore Pure Categories" section loading with 6 categories
   - ✅ "Best Sellers 2026" section loading with products
3. Click **"View All Categories"** - categories page should load with filter sidebar showing categories
4. Try filtering by category - products should filter correctly

---

## If Still Not Working

1. **Clear browser cache** (Ctrl+Shift+Del or Cmd+Shift+Del)
2. **Hard refresh** (Ctrl+F5 or Cmd+Shift+R)
3. Check browser **Developer Console** (F12) for errors
4. Verify Supabase credentials in `.env` file are correct

---

## What This Fixes

✅ Categories table now has public read access (filtered to is_active = true)
✅ Products table ensures public read access is in place
✅ Admin users can manage both tables
✅ Both "Loading categories..." and "Loading best sellers..." messages should disappear
