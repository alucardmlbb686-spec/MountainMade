# Categories Migration Guide

## Overview
The categories feature has been implemented with the following changes:

### 1. Database Migration
A new `categories` table has been created in Supabase with the following structure:
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Category name (matches product category names)
- `slug` (VARCHAR) - URL-friendly slug
- `description` (TEXT) - Category description
- `icon_name` (VARCHAR) - Icon name for UI display
- `display_order` (INTEGER) - Order for display
- `is_active` (BOOLEAN) - Whether the category is active
- `created_at` & `updated_at` (TIMESTAMPTZ) - Timestamps

### 2. Categories Data
The migration includes 6 categories:
- Honey
- Grains
- Spices
- Herbs
- Dry Fruits
- Oils

These categories match the existing product categories in your products table.

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Easiest)
1. Go to your Supabase project: https://supabase.com
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy the contents of: `supabase/migrations/20260206145000_create_categories.sql`
5. Paste the SQL into the editor
6. Click **"Run"** or press `Ctrl+Enter`

### Option 2: Using Supabase CLI
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Run migrations
supabase migration up
```

### Option 3: Using Node.js Script
```bash
# Add your service role key to .env
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Run the migration script
node scripts/run-migration.js
```

## Code Changes

### FilterSidebar Component
- Now fetches categories dynamically from the database
- Shows loading state while fetching
- Uses category names for filtering (not IDs)

### ProductGrid Component
- Already had filtering logic in place
- Works seamlessly with the new category system
- Filters products by category name

## Verification

After applying the migration, you should:
1. See categories dynamically loaded in the filter sidebar on the categories page
2. Be able to filter products by category
3. Have proper sorting and filtering working together

## Next Steps (Optional)

- Add more category metadata (images, cover photos)
- Create a dedicated categories page
- Add admin interface for category management
- Implement category-specific layouts/designs
