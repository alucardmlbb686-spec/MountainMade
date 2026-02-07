-- Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_name VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert categories (matching the category names used in products table)
INSERT INTO public.categories (name, slug, description, icon_name, display_order, is_active) VALUES
('Honey', 'honey', 'Pure honey and natural sweetening products from mountain regions', 'SparklesIcon', 1, true),
('Grains', 'grains', 'Nutritious grains, rice varieties, and pulses from organic farms', 'Squares2X2Icon', 2, true),
('Spices', 'spices', 'Premium spices and aromatic herbs for authentic flavors', 'FireIcon', 3, true),
('Herbs', 'herbs', 'Premium herbs and teas from high-altitude sources', 'DropletIcon', 4, true),
('Dry Fruits', 'dry-fruits', 'Premium quality dry fruits and nuts rich in nutrients', 'GiftIcon', 5, true),
('Oils', 'oils', 'Pure organic oils and ghee from cold-pressed sources', 'BeakerIcon', 6, true);

-- Create indexes for better query performance
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);
CREATE INDEX idx_categories_display_order ON public.categories(display_order);
