-- Remove virtual gifts and category
-- This script removes all virtual gifts and the virtual category

-- Delete all gifts with 'virtual' category
DELETE FROM gifts WHERE category = 'virtual';

-- Note: The virtual category will be automatically removed from the category list
-- when there are no more gifts in that category, since categories are derived
-- from existing gifts in the getGiftCategories() function

-- Verify the removal
SELECT 'Remaining gifts by category:' as info;
SELECT category, COUNT(*) as gift_count 
FROM gifts 
GROUP BY category 
ORDER BY category;

SELECT 'All remaining gifts:' as info;
SELECT name, category, price 
FROM gifts 
ORDER BY category, name; 