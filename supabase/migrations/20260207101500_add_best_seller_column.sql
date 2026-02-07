-- Add best_seller column to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON public.products(is_best_seller) WHERE is_best_seller = true;

-- Mark top selling products as best sellers (top products by price and stock variety)
UPDATE public.products
SET is_best_seller = true
WHERE name IN (
    'Wild Forest Honey',
    'Organic Brown Rice',
    'Organic Turmeric Powder',
    'Himalayan Pink Salt',
    'Organic Almonds',
    'Kashmiri Walnuts',
    'Organic Green Tea',
    'Organic Raw Honey'
);
