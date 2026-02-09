-- DEEP DIAGNOSTIC: Check your database setup
-- Run this in Supabase SQL Editor to diagnose the loading issue

-- 1. Check how many products exist and their status
SELECT 
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE is_active = true) as active_products,
  COUNT(DISTINCT category) as unique_categories
FROM public.products;

-- 2. Check if categories table exists and has data
SELECT 
  COUNT(*) as total_categories,
  COUNT(*) FILTER (WHERE is_active = true) as active_categories
FROM public.categories;

-- 3. List all categories
SELECT id, name, slug, is_active, display_order 
FROM public.categories 
ORDER BY display_order;

-- 4. Check RLS policies on both tables
SELECT 
  schemaname, tablename, policyname, permissive, cmd
FROM pg_policies 
WHERE tablename IN ('products', 'categories')
ORDER BY tablename, policyname;

-- 5. Check if tables have RLS enabled
SELECT 
  tablename, 
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables 
WHERE tablename IN ('products', 'categories')
AND schemaname = 'public';

-- 6. Sample 5 products to see structure
SELECT 
  id, name, price, category, is_active, image_url, stock
FROM public.products 
WHERE is_active = true
LIMIT 5;

-- 7. Check for any NULL categories that might cause issues
SELECT 
  COUNT(*) as products_with_null_category
FROM public.products 
WHERE category IS NULL OR category = '';
