-- Create gifts table for managing real gifts
-- This replaces the hardcoded gift arrays with a database table

CREATE TABLE IF NOT EXISTS public.gifts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NULL,
  price integer NOT NULL,
  image_url text NULL,
  category text NULL,
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT gifts_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gifts_category ON public.gifts USING btree (category) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_gifts_price ON public.gifts USING btree (price) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_gifts_is_active ON public.gifts USING btree (is_active) TABLESPACE pg_default;

-- Enable RLS for gifts table
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read active gifts
CREATE POLICY "Allow authenticated users to read active gifts"
ON public.gifts FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy to allow admins to manage all gifts
CREATE POLICY "Allow admins to manage all gifts"
ON public.gifts FOR ALL
TO authenticated
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Grant permissions
GRANT SELECT ON public.gifts TO authenticated;
GRANT ALL ON public.gifts TO service_role;

-- Insert the existing real gifts data
INSERT INTO public.gifts (name, description, price, image_url, category) VALUES
-- FLOWERS (30-649 coins)
('Red Rose Bouquet', 'Beautiful bouquet of 12 fresh red roses with elegant wrapping and a personalized card.', 30, 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400', 'flowers'),
('White Rose Bouquet', 'Elegant white roses symbolizing pure love and new beginnings, perfect for special occasions.', 35, 'https://images.unsplash.com/photo-1606041011872-596597976e79?w=400', 'flowers'),
('Mixed Rose Bouquet', 'Stunning arrangement of red, white, and pink roses in a beautiful presentation.', 45, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'flowers'),
('Tulip Arrangement', 'Fresh seasonal tulips in vibrant colors, arranged with care and love.', 40, 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=400', 'flowers'),
('Sunflower Bouquet', 'Bright and cheerful sunflowers that bring sunshine to any day.', 35, 'https://images.unsplash.com/photo-1597848212624-e0532522dd07?w=400', 'flowers'),
('Peony Bouquet', 'Luxurious peonies in soft pink shades, perfect for romantic gestures.', 55, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'flowers'),
('Lily Arrangement', 'Elegant white lilies symbolizing rebirth and refined beauty.', 50, 'https://images.unsplash.com/photo-1565690374407-9f1d2e33bb80?w=400', 'flowers'),
('Wildflower Bouquet', 'Natural mix of wildflowers for a rustic and charming touch.', 38, 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=400', 'flowers'),
('Premium Rose Collection', 'Exclusive collection of 24 premium roses in a luxury presentation box.', 120, 'https://images.unsplash.com/photo-1606041011872-596597976e79?w=400', 'flowers'),
('Exotic Orchid Arrangement', 'Sophisticated orchid arrangement for the most discerning recipients.', 180, 'https://images.unsplash.com/photo-1586973277020-c829a16d49e2?w=400', 'flowers'),
('Garden Fresh Bouquet', 'Seasonal flowers picked fresh from the garden, arranged beautifully.', 42, 'https://images.unsplash.com/photo-1597848212624-e0532522dd07?w=400', 'flowers'),
('Romantic Red Roses (50)', 'Grand gesture with 50 red roses in an elegant presentation.', 299, 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400', 'flowers'),
('Luxury Flower Box', 'Premium flowers arranged in a beautiful keepsake box.', 149, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'flowers'),
('Anniversary Special Bouquet', 'Special anniversary bouquet with premium flowers and elegant presentation.', 199, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'flowers'),
('Ultimate Luxury Bouquet', 'The most exclusive and luxurious flower arrangement for very special occasions.', 649, 'https://images.unsplash.com/photo-1586973277020-c829a16d49e2?w=400', 'flowers'),

-- PERFUMES (400-600 coins)
('Chanel No. 5 Eau de Parfum', 'Iconic fragrance with timeless elegance and sophisticated floral notes.', 420, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', 'perfumes'),
('Dior Miss Dior Blooming Bouquet', 'Fresh and tender fragrance with peony, rose, and white musk notes.', 380, 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400', 'perfumes'),
('Tom Ford Black Orchid', 'Luxurious and sensual fragrance with dark chocolate and black orchid.', 450, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', 'perfumes'),
('Yves Saint Laurent Black Opium', 'Addictive and mysterious fragrance with coffee, vanilla, and white flowers.', 400, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', 'perfumes'),
('Versace Bright Crystal', 'Fresh and vibrant fragrance with pomegranate, yuzu, and peony.', 350, 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400', 'perfumes'),
('Gucci Bloom Eau de Parfum', 'Authentic and natural fragrance with tuberose, jasmine, and Rangoon creeper.', 410, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', 'perfumes'),
('Lancôme La Vie Est Belle', 'Joyful fragrance with iris, patchouli, sweet gourmand, and vanilla.', 390, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', 'perfumes'),
('Marc Jacobs Daisy', 'Youthful and charming fragrance with wild berries, violet leaves, and jasmine.', 360, 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400', 'perfumes'),
('Prada Candy', 'Sweet and sophisticated fragrance with benzoin, white musk, and caramel.', 430, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', 'perfumes'),
('Viktor & Rolf Flowerbomb', 'Explosive and intense floral fragrance with jasmine, rose, and patchouli.', 460, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', 'perfumes'),
('Burberry Her Eau de Parfum', 'Contemporary London fragrance with berries, jasmine, and dry woods.', 380, 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400', 'perfumes'),
('Dolce & Gabbana Light Blue', 'Mediterranean-inspired fragrance with apple, bamboo, and white rose.', 370, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', 'perfumes'),
('Chloe Eau de Parfum', 'Feminine and elegant fragrance with peony, lychee, and freesia.', 400, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400', 'perfumes'),
('Armani Si Passione', 'Passionate fragrance with blackcurrant, rose, and vanilla.', 415, 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400', 'perfumes'),
('Hermès Twilly d''Hermès', 'Joyful and irreverent fragrance with ginger, tuberose, and sandalwood.', 480, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400', 'perfumes'),

-- GIFT BASKETS (499-649 coins)
('Gourmet Chocolate Collection', 'Luxury assortment of handcrafted chocolates from around the world.', 499, 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400', 'gift_baskets'),
('Wine & Cheese Gift Basket', 'Premium selection of wines paired with artisanal cheeses and crackers.', 579, 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400', 'gift_baskets'),
('Spa Relaxation Basket', 'Complete spa experience with bath bombs, essential oils, and luxury towels.', 529, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 'gift_baskets'),
('Coffee Lover''s Paradise', 'Premium coffee beans, brewing accessories, and gourmet treats.', 449, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 'gift_baskets'),
('Sweet Treats Deluxe Basket', 'Assorted gourmet sweets, candies, and dessert specialties.', 399, 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400', 'gift_baskets'),
('Healthy Snacks Basket', 'Nutritious and delicious snack assortment for health-conscious recipients.', 359, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 'gift_baskets'),
('Breakfast in Bed Basket', 'Everything needed for a perfect morning including pancake mix, syrup, and coffee.', 429, 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400', 'gift_baskets'),
('International Cuisine Basket', 'Gourmet ingredients and sauces from different cuisines around the world.', 549, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 'gift_baskets'),
('Luxury Tea Collection', 'Premium teas from around the world with elegant accessories.', 389, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 'gift_baskets'),
('Ultimate Luxury Gift Basket', 'The finest selection of gourmet items, wines, and luxury treats.', 649, 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=400', 'gift_baskets'),

-- ELECTRONICS (1399-8199 coins)
('Apple iPhone 15 Pro', 'Latest iPhone with advanced camera system and powerful A17 Pro chip.', 4999, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 'electronics'),
('Samsung Galaxy S24 Ultra', 'Premium Android smartphone with S Pen and exceptional camera capabilities.', 4799, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'electronics'),
('Apple MacBook Air M2', 'Lightweight laptop with incredible performance and all-day battery life.', 4899, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 'electronics'),
('iPad Pro 12.9-inch', 'Professional tablet with M2 chip and stunning Liquid Retina XDR display.', 4399, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', 'electronics'),
('Sony WH-1000XM5 Headphones', 'Industry-leading noise canceling headphones with exceptional sound quality.', 1399, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400', 'electronics'),
('Apple Watch Series 9', 'Advanced smartwatch with health monitoring and seamless iPhone integration.', 1899, 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400', 'electronics'),
('Nintendo Switch OLED', 'Popular gaming console with vibrant OLED screen for portable and docked play.', 1599, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'electronics'),
('Sony PlayStation 5', 'Next-generation gaming console with ultra-fast SSD and ray tracing.', 2299, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400', 'electronics'),
('Dyson Airwrap Complete', 'Revolutionary hair styling tool that uses air to curl, wave, and dry hair.', 2199, 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400', 'electronics'),
('Bose SoundLink Revolve+', 'Portable Bluetooth speaker with 360-degree sound and deep bass.', 999, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400', 'electronics'),
('Canon EOS R6 Mark II', 'Professional mirrorless camera with advanced autofocus and image stabilization.', 6799, 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400', 'electronics'),
('MacBook Pro 16-inch M3', 'Professional laptop with M3 Max chip for demanding creative workflows.', 8199, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', 'electronics'),
('LG OLED C3 55-inch TV', 'Premium OLED TV with perfect blacks and vibrant colors for entertainment.', 5999, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', 'electronics'),
('KitchenAid Stand Mixer', 'Professional stand mixer for baking enthusiasts and culinary artists.', 1799, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'electronics'),
('Roomba j7+ Robot Vacuum', 'Smart robot vacuum with self-emptying base and advanced navigation.', 3299, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'electronics'),

-- JEWELRY (599-6499 coins)
('Diamond Stud Earrings', 'Classic diamond stud earrings in 14k white gold with brilliant cut diamonds.', 1299, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 'jewelry'),
('Gold Chain Necklace', 'Elegant 18k gold chain necklace, perfect for everyday wear or special occasions.', 899, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 'jewelry'),
('Silver Charm Bracelet', 'Beautiful sterling silver bracelet with customizable charms and elegant design.', 599, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 'jewelry'),
('Ruby Heart Pendant', 'Romantic heart-shaped pendant with genuine ruby and diamond accents.', 1599, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 'jewelry'),
('Platinum Wedding Band', 'Timeless platinum wedding band with classic design and superior craftsmanship.', 2199, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', 'jewelry'),
('Emerald Drop Earrings', 'Stunning emerald earrings with diamond halos in white gold setting.', 2899, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 'jewelry'),
('Cartier Love Bracelet', 'Iconic love bracelet in 18k rose gold, symbol of eternal commitment.', 3499, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 'jewelry'),
('Tiffany & Co. Solitaire Ring', 'Classic engagement ring with brilliant round diamond in platinum setting.', 4999, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', 'jewelry'),
('Sapphire Tennis Bracelet', 'Elegant tennis bracelet featuring alternating sapphires and diamonds.', 3899, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 'jewelry'),
('Pearl Strand Necklace', 'Classic cultured pearl necklace with matching earrings in elegant presentation.', 1899, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 'jewelry'),
('Diamond Tennis Necklace', 'Luxurious diamond tennis necklace with perfectly matched brilliant cut stones.', 6499, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', 'jewelry'),
('Vintage Art Deco Ring', 'Stunning vintage-inspired ring with emerald cut center stone and side diamonds.', 2799, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', 'jewelry'),
('Pearl Earrings', 'Freshwater pearl stud earrings in sterling silver settings.', 799, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'jewelry'),
('Tennis Bracelet', 'Sterling silver tennis bracelet with cubic zirconia stones.', 1299, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 'jewelry'),
('Rose Gold Watch', 'Elegant rose gold plated watch with leather strap and mother of pearl dial.', 1899, 'https://images.unsplash.com/photo-1523170335258-f5c6c6bd6edc?w=400', 'jewelry'),

-- BEAUTY & COSMETICS (250-899 coins)
('Luxury Makeup Palette Set', 'Professional makeup palette with eyeshadows, blush, and lip colors.', 450, 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', 'beauty'),
('Complete Skincare Routine Set', 'Premium skincare set with cleanser, serum, moisturizer, and SPF.', 899, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', 'beauty'),
('Professional Nail Care Set', 'Complete nail care kit with polishes, tools, and nail art accessories.', 320, 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=400', 'beauty'),
('Professional Hair Styling Tools', 'Hair straightener, curling iron, and styling accessories set.', 680, 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400', 'beauty'),

-- FASHION & ACCESSORIES (350-1299 coins)
('Designer Leather Handbag', 'Elegant leather handbag from a premium fashion brand.', 1299, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'fashion'),
('Luxury Silk Scarf', 'Beautiful silk scarf with artistic pattern and premium quality.', 450, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400', 'fashion'),
('Designer Sunglasses', 'Stylish designer sunglasses with UV protection and elegant design.', 899, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400', 'fashion'),
('Cashmere Sweater', 'Luxurious cashmere sweater in classic design and premium quality.', 1199, 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400', 'fashion'),

-- HOME & LIFESTYLE (280-999 coins)
('Aromatherapy Essential Oil Diffuser', 'Ultrasonic diffuser with LED lights and essential oil starter kit.', 380, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', 'home'),
('Luxury Scented Candle Set', 'Set of premium scented candles in beautiful glass containers.', 280, 'https://images.unsplash.com/photo-1602874801006-12c8fb48c488?w=400', 'home'),
('Silk Pillowcase Set', 'Luxurious mulberry silk pillowcases for hair and skin care.', 450, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', 'home'),
('Crystal Home Decor Set', 'Beautiful crystal decorative pieces for elegant home styling.', 680, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'home'),
('Bamboo Bathroom Organizer', 'Elegant bamboo organizer for skincare and bathroom essentials.', 320, 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400', 'home');

-- Add comment for future reference
COMMENT ON TABLE public.gifts IS 'Table storing all available gifts for the dating platform';
COMMENT ON COLUMN public.gifts.price IS 'Gift price in coins';
COMMENT ON COLUMN public.gifts.is_active IS 'Whether the gift is available for purchase'; 