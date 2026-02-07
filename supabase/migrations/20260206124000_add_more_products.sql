-- Add more products with prices in Indian rupees
INSERT INTO public.products (name, description, price, category, image_url, stock, is_active) VALUES
-- Honey Products
('Wild Forest Honey', 'Pure raw honey harvested from wild Himalayan forests. Rich in antioxidants and natural enzymes.', 599, 'Honey', NULL, 50, true),
('Acacia Honey', 'Light and delicate honey from acacia flowers. Perfect for tea and desserts.', 499, 'Honey', NULL, 45, true),
('Multiflora Honey', 'Blend of various mountain flowers. Rich flavor and golden color.', 449, 'Honey', NULL, 60, true),
('Organic Raw Honey', 'Unprocessed, unfiltered honey straight from the hive. Contains natural pollen.', 549, 'Honey', NULL, 40, true),
('Mountain Wildflower Honey', 'Collected from diverse wildflowers at high altitudes. Unique floral notes.', 649, 'Honey', NULL, 35, true),

-- Grains & Pulses
('Organic Brown Rice', 'Nutritious whole grain brown rice grown in mountain terraces. High in fiber.', 180, 'Grains', NULL, 100, true),
('Red Rice', 'Rare Himalayan red rice with nutty flavor. Rich in iron and antioxidants.', 220, 'Grains', NULL, 80, true),
('Black Rice', 'Ancient grain with deep purple color. Superfood packed with anthocyanins.', 280, 'Grains', NULL, 60, true),
('Organic Quinoa', 'Complete protein grain grown at high altitude. Gluten-free and nutritious.', 450, 'Grains', NULL, 50, true),
('Himalayan Barley', 'Traditional mountain barley. Perfect for soups and porridge.', 150, 'Grains', NULL, 90, true),
('Organic Millet Mix', 'Blend of foxtail, finger, and pearl millet. Ancient superfood.', 160, 'Grains', NULL, 70, true),
('Mountain Wheat', 'Stone-ground whole wheat from organic farms. Rich nutty flavor.', 120, 'Grains', NULL, 120, true),
('Red Lentils (Masoor Dal)', 'Premium quality red lentils. Quick cooking and protein-rich.', 140, 'Grains', NULL, 100, true),
('Yellow Moong Dal', 'Split yellow mung beans. Easy to digest and nutritious.', 160, 'Grains', NULL, 95, true),
('Black Gram (Urad Dal)', 'Whole black gram. Essential for traditional Indian dishes.', 180, 'Grains', NULL, 85, true),

-- Spices
('Organic Turmeric Powder', 'Golden turmeric with high curcumin content. Anti-inflammatory superfood.', 180, 'Spices', NULL, 80, true),
('Himalayan Pink Salt', 'Pure mineral-rich pink salt from ancient deposits. Unrefined and natural.', 120, 'Spices', NULL, 150, true),
('Organic Red Chili Powder', 'Fiery red chili powder from sun-dried peppers. Adds heat and color.', 150, 'Spices', NULL, 90, true),
('Cumin Seeds (Jeera)', 'Aromatic cumin seeds. Essential spice for Indian cooking.', 200, 'Spices', NULL, 75, true),
('Coriander Powder', 'Freshly ground coriander seeds. Mild and fragrant.', 130, 'Spices', NULL, 85, true),
('Garam Masala', 'Traditional spice blend with cardamom, cinnamon, cloves. Authentic flavor.', 220, 'Spices', NULL, 60, true),
('Black Pepper Whole', 'Premium black peppercorns. Bold and pungent.', 350, 'Spices', NULL, 70, true),
('Cardamom Pods (Elaichi)', 'Green cardamom pods. Aromatic and sweet spice.', 800, 'Spices', NULL, 40, true),
('Cinnamon Sticks', 'True Ceylon cinnamon sticks. Sweet and delicate flavor.', 280, 'Spices', NULL, 55, true),
('Cloves (Laung)', 'Whole cloves with intense aroma. Used in both sweet and savory dishes.', 450, 'Spices', NULL, 50, true),

-- Herbs & Tea
('Organic Green Tea', 'High-altitude green tea leaves. Rich in antioxidants.', 320, 'Herbs', NULL, 65, true),
('Himalayan Black Tea', 'Full-bodied black tea with malty notes. Perfect morning brew.', 280, 'Herbs', NULL, 70, true),
('Chamomile Tea', 'Calming chamomile flowers. Perfect for relaxation and sleep.', 350, 'Herbs', NULL, 45, true),
('Tulsi (Holy Basil) Tea', 'Sacred herb with adaptogenic properties. Boosts immunity.', 250, 'Herbs', NULL, 60, true),
('Lemongrass Tea', 'Fresh lemongrass with citrus notes. Refreshing and digestive.', 220, 'Herbs', NULL, 55, true),
('Ginger Tea', 'Dried ginger root tea. Warming and aids digestion.', 240, 'Herbs', NULL, 50, true),
('Mint Leaves (Dried)', 'Organic dried mint leaves. Refreshing and cooling.', 180, 'Herbs', NULL, 65, true),
('Moringa Powder', 'Nutrient-dense moringa leaf powder. Superfood supplement.', 380, 'Herbs', NULL, 40, true),
('Ashwagandha Powder', 'Adaptogenic herb powder. Reduces stress and boosts energy.', 420, 'Herbs', NULL, 35, true),

-- Dry Fruits & Nuts
('Organic Almonds', 'Premium quality almonds. Rich in protein and healthy fats.', 650, 'Dry Fruits', NULL, 60, true),
('Kashmiri Walnuts', 'Fresh walnuts from Kashmir. Brain-boosting omega-3s.', 720, 'Dry Fruits', NULL, 50, true),
('Dried Apricots', 'Sun-dried apricots without sulfur. Natural sweetness.', 480, 'Dry Fruits', NULL, 55, true),
('Raisins (Kishmish)', 'Golden raisins. Natural energy booster.', 280, 'Dry Fruits', NULL, 80, true),
('Cashew Nuts', 'Whole cashews. Creamy and buttery flavor.', 580, 'Dry Fruits', NULL, 65, true),
('Dried Figs (Anjeer)', 'Naturally sweet dried figs. High in fiber and minerals.', 520, 'Dry Fruits', NULL, 45, true),
('Pistachios', 'Green pistachios. Crunchy and nutritious snack.', 850, 'Dry Fruits', NULL, 40, true),

-- Oils & Ghee
('Cold Pressed Mustard Oil', 'Traditional mustard oil. Pungent and flavorful.', 280, 'Oils', NULL, 70, true),
('Organic Coconut Oil', 'Virgin coconut oil. Multi-purpose cooking and beauty oil.', 380, 'Oils', NULL, 60, true),
('Pure Desi Ghee', 'Traditional clarified butter from grass-fed cows. Rich and aromatic.', 650, 'Oils', NULL, 45, true),
('Sesame Oil', 'Cold pressed sesame oil. Nutty flavor for cooking and massage.', 320, 'Oils', NULL, 55, true),

-- Pickles & Preserves
('Mango Pickle (Aam ka Achar)', 'Spicy and tangy mango pickle. Traditional recipe.', 180, 'Pickles', NULL, 75, true),
('Mixed Vegetable Pickle', 'Assorted vegetables in spicy oil. Authentic taste.', 160, 'Pickles', NULL, 80, true),
('Lemon Pickle', 'Preserved lemons with spices. Tangy and flavorful.', 150, 'Pickles', NULL, 70, true),
('Garlic Pickle', 'Whole garlic cloves in spicy marinade. Pungent and delicious.', 170, 'Pickles', NULL, 65, true),

-- Snacks
('Roasted Chickpeas', 'Crunchy roasted chickpeas. Healthy protein snack.', 120, 'Snacks', NULL, 90, true),
('Trail Mix', 'Mix of nuts, seeds, and dried fruits. Energy-boosting snack.', 380, 'Snacks', NULL, 60, true),
('Puffed Rice (Murmura)', 'Light and crispy puffed rice. Low-calorie snack.', 80, 'Snacks', NULL, 100, true),
('Roasted Makhana (Fox Nuts)', 'Crunchy lotus seeds. High protein, low calorie snack.', 280, 'Snacks', NULL, 55, true)

ON CONFLICT (id) DO NOTHING;