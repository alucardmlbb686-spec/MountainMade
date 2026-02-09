-- FIX: Update products with NULL or empty categories
-- These products are invisible because they can't be filtered/grouped

-- First, let's see which products have NULL categories
SELECT id, name, category, price 
FROM public.products 
WHERE category IS NULL OR category = ''
ORDER BY created_at;

-- Now update them with proper categories based on their names
UPDATE public.products
SET category = 'Honey'
WHERE (category IS NULL OR category = '') 
  AND (name ILIKE '%honey%' OR name ILIKE '%honey%');

UPDATE public.products
SET category = 'Grains'
WHERE (category IS NULL OR category = '') 
  AND (name ILIKE '%rice%' OR name ILIKE '%grain%' OR name ILIKE '%dal%' OR name ILIKE '%lentil%' OR name ILIKE '%wheat%' OR name ILIKE '%barley%' OR name ILIKE '%millet%' OR name ILIKE '%quinoa%');

UPDATE public.products
SET category = 'Spices'
WHERE (category IS NULL OR category = '') 
  AND (name ILIKE '%turmeric%' OR name ILIKE '%salt%' OR name ILIKE '%chili%' OR name ILIKE '%cumin%' OR name ILIKE '%coriander%' OR name ILIKE '%garam%' OR name ILIKE '%pepper%' OR name ILIKE '%cardamom%' OR name ILIKE '%cinnamon%' OR name ILIKE '%clove%');

UPDATE public.products
SET category = 'Herbs'
WHERE (category IS NULL OR category = '') 
  AND (name ILIKE '%tea%' OR name ILIKE '%herb%' OR name ILIKE '%tulsi%' OR name ILIKE '%chamomile%' OR name ILIKE '%lemongrass%' OR name ILIKE '%ginger%' OR name ILIKE '%mint%' OR name ILIKE '%moringa%' OR name ILIKE '%ashwagandha%' OR name ILIKE '%basil%');

UPDATE public.products
SET category = 'Dry Fruits'
WHERE (category IS NULL OR category = '') 
  AND (name ILIKE '%almond%' OR name ILIKE '%walnut%' OR name ILIKE '%apricot%' OR name ILIKE '%raisin%' OR name ILIKE '%cashew%' OR name ILIKE '%fig%' OR name ILIKE '%pistachio%' OR name ILIKE '%nut%' OR name ILIKE '%berry%');

UPDATE public.products
SET category = 'Oils'
WHERE (category IS NULL OR category = '') 
  AND (name ILIKE '%oil%' OR name ILIKE '%ghee%' OR name ILIKE '%mustard%' OR name ILIKE '%coconut%' OR name ILIKE '%sesame%');

-- Set any remaining NULL categories to 'Other' or delete them
-- Option 1: Assign to 'Pickles' if they look like pickles
UPDATE public.products
SET category = 'Pickles'
WHERE (category IS NULL OR category = '') 
  AND (name ILIKE '%pickle%' OR name ILIKE '%achar%');

-- Option 2: Assign to 'Snacks' if they look like snacks
UPDATE public.products
SET category = 'Snacks'
WHERE (category IS NULL OR category = '') 
  AND (name ILIKE '%snack%' OR name ILIKE '%chickpea%' OR name ILIKE '%trail%' OR name ILIKE '%makhana%' OR name ILIKE '%murmura%' OR name ILIKE '%puffed%');

-- Verify: Check if any NULL categories remain
SELECT 
  COUNT(*) as remaining_null_categories
FROM public.products 
WHERE category IS NULL OR category = '';

-- Show the count of products per category now
SELECT 
  category,
  COUNT(*) as product_count
FROM public.products
WHERE is_active = true
GROUP BY category
ORDER BY product_count DESC;
