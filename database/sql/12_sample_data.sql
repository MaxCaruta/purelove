-- =====================================================
-- SAMPLE DATA
-- Initial data for testing and development
-- =====================================================

-- Insert sample gifts
INSERT INTO gifts (name, description, price, image_url, category) VALUES
('🌹 Red Rose', 'A beautiful red rose to show your affection', 20, '/gifts/red-rose.png', 'flowers'),
('💐 Bouquet', 'A stunning bouquet of mixed flowers', 50, '/gifts/bouquet.png', 'flowers'),
('🍫 Chocolates', 'Delicious box of premium chocolates', 30, '/gifts/chocolates.png', 'food'),
('🧸 Teddy Bear', 'Cute teddy bear for your special someone', 40, '/gifts/teddy-bear.png', 'toys'),
('💍 Ring', 'Elegant ring to show your commitment', 100, '/gifts/ring.png', 'jewelry'),
('🎁 Gift Box', 'Mystery gift box with surprise inside', 60, '/gifts/gift-box.png', 'toys'),
('💖 Heart', 'Virtual heart to show your love', 10, '/gifts/heart.png', 'virtual'),
('🌺 Flower', 'Beautiful flower to brighten their day', 15, '/gifts/flower.png', 'flowers'),
('💎 Diamond', 'Precious diamond for special occasions', 200, '/gifts/diamond.png', 'jewelry'),
('🎀 Ribbon', 'Elegant ribbon for decoration', 5, '/gifts/ribbon.png', 'accessories');

-- Insert subscription plans
INSERT INTO subscriptions (name, description, price, coin_price, duration_days, features) VALUES
('Weekly Chat Access', 'Unlimited messaging for 7 days', 4.99, 50, 7, 
 '["Unlimited messages for 7 days", "Chat with any verified profile", "Real-time messaging", "No per-message fees", "Access to all chat features"]'),
('Monthly Chat Access', 'Unlimited messaging for 30 days', 14.99, 150, 30,
 '["Unlimited messages for 30 days", "Chat with any verified profile", "Real-time messaging", "No per-message fees", "Access to all chat features", "Priority support"]'),
('Premium Access', 'Full access to all features for 7 days', 9.99, 100, 7,
 '["Unlimited messages", "Video calls", "Gift sending", "Contact exchange", "Priority matching", "Advanced search filters"]');

-- Update existing profiles to have some coins for testing
-- (This will only work if you have existing profiles)
UPDATE profiles 
SET coins = 100 
WHERE id IN (
  SELECT id FROM profiles LIMIT 5
);

-- Insert sample likes (if you have existing profiles)
-- Uncomment and modify these if you have existing user IDs
/*
INSERT INTO likes (liker_id, liked_id) VALUES
('user-id-1', 'user-id-2'),
('user-id-2', 'user-id-1'),
('user-id-3', 'user-id-4'),
('user-id-4', 'user-id-3');

-- Insert sample matches (if you have existing profiles)
INSERT INTO matches (user1_id, user2_id) VALUES
('user-id-1', 'user-id-2'),
('user-id-3', 'user-id-4');
*/

-- Comments for documentation
COMMENT ON TABLE gifts IS 'Sample gift data for testing';
COMMENT ON TABLE subscriptions IS 'Sample subscription plans for testing'; 