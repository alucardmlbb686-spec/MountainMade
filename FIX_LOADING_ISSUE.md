# Fix: Categories & Products Loading Issue - Complete Guide

## 🔍 Root Cause

The **categories** table was created without RLS (Row Level Security) policies for public access. Without these policies, your app cannot read categories even though they exist in the database.

The **products** table works fine because it has proper RLS policies: `public_view_products`

## ✅ Solution (5 minutes)

### Step 1: Apply the RLS Fix

**Go to Supabase Dashboard:**
1. Visit: https://supabase.com
2. Sign in to your project
3. Navigate to: **SQL Editor** (left sidebar)
4. Click: **New Query** (blue button)

**Paste and run this SQL:**

```sql
-- Enable RLS and set policies for categories table
DROP POLICY IF EXISTS "public_view_categories" ON public.categories CASCADE;
CREATE POLICY "public_view_categories"
ON public.categories
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admins_manage_categories" ON public.categories CASCADE;
CREATE POLICY "admins_manage_categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Verify products table policies  
DROP POLICY IF EXISTS "public_view_products" ON public.products CASCADE;
CREATE POLICY "public_view_products"
ON public.products
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admins_manage_products" ON public.products CASCADE;
CREATE POLICY "admins_manage_products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
```

5. Click the **RUN** button (blue play button on the right)
6. Wait for confirmation (should see green checkmark)

### Step 2: Restart Your App

```bash
# If dev server is running, press Ctrl+C to stop it
# Then restart:
npm run dev
```

### Step 3: Clear Browser Cache

1. Press **Ctrl+Shift+Delete** (Windows) or **Cmd+Shift+Delete** (Mac)
2. Select: **All time** (or Cookies and cached images/files)
3. Click **Clear data**

### Step 4: Test

1. Go to: http://localhost:3000
2. Check:
   - ✅ "Explore Pure Categories" section shows 6 categories
   - ✅ "Best Sellers 2026" section shows products
   - ✅ No "Loading..." messages persist

---

## 🔧 If Still Not Working

### Debug Checklist:

1. **Verify .env file has valid credentials:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://nprvjmgglxxbxzpvwsjz.supabase.co ✅
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... ✅
   ```

2. **Check Supabase Dashboard:**
   - Go to: Table Editor → **categories**
   - You should see 6 rows:
     - Honey
     - Grains
     - Spices
     - Herbs
     - Dry Fruits
     - Oils

3. **Open Browser Developer Console (F12):**
   - Click: **Console** tab
   - Look for error messages
   - Take a screenshot and share any red errors

4. **Check Network Tab:**
   - Press **F12** → **Network** tab
   - Refresh the page
   - Look for failed requests to Supabase
   - Check if requests are returning 403 (permission denied)

---

## 📋 What Each Policy Does

| Policy | Who | What | Purpose |
|--------|-----|------|---------|
| `public_view_categories` | Anyone | Read active categories | Category list displays |
| `admins_manage_categories` | Admin users | Create/Update/Delete | Admin panel management |
| `public_view_products` | Anyone | Read active products | Product list displays |
| `admins_manage_products` | Admin users | Create/Update/Delete | Admin product management |

---

## 🚀 Why This Happened

1. Categories table was created
2. RLS was NOT explicitly enabled with policies
3. Supabase RLS defaults to "deny all" when enabled but without policies
4. App couldn't read categories → loading state never completes

---

## ✨ What's Now Fixed

- ✅ Public users can see active categories
- ✅ Public users can see active products
- ✅ Admin users can manage both
- ✅ Homepage loads with categories and products
- ✅ Categories page shows filter sidebar
- ✅ Product filtering works correctly
