-- Insert comprehensive test restaurant data for analytics
INSERT INTO restaurants (
  id, name, brand, address, city, state, country, postal_code, 
  latitude, longitude, district, phone, email, website, 
  cuisine_type, business_type, price_range, opening_hours, capacity,
  avg_rating, total_reviews, monthly_revenue, avg_order_value, total_orders,
  is_active, verified_at
) VALUES 
-- High-performing restaurant
('rest-001', 'Sukiyaki Supreme', 'Premium Dining Group', '123 Sukhumvit Road', 'Bangkok', 'Bangkok', 'Thailand', '10110',
 13.7563, 100.5018, 'Watthana', '+66-2-123-4567', 'contact@sukiyakisupreme.com', 'https://sukiyakisupreme.com',
 'japanese', 'restaurant', 'luxury', '{"mon-sun": "11:00-23:00"}', 120,
 4.8, 1250, 850000.50, 380.75, 2236, 1, datetime('now', '-6 months')),

-- Mid-tier popular restaurant
('rest-002', 'Pad Thai Palace', 'Local Flavors Chain', '456 Silom Road', 'Bangkok', 'Bangkok', 'Thailand', '10500',
 13.7265, 100.5326, 'Bang Rak', '+66-2-234-5678', 'info@padthaipalace.co.th', 'https://padthaipalace.co.th',
 'thai', 'restaurant', 'high_end', '{"mon-sun": "10:00-22:00"}', 80,
 4.5, 892, 420000.25, 185.30, 2267, 1, datetime('now', '-8 months')),

-- Fast casual growing chain
('rest-003', 'Mango Sticky Rice Co.', 'Sweet Dreams Franchise', '789 Khao San Road', 'Bangkok', 'Bangkok', 'Thailand', '10200',
 13.7590, 100.4983, 'Phra Nakhon', '+66-2-345-6789', 'hello@mangostickyrice.co', 'https://mangostickyrice.co',
 'dessert', 'cafe', 'mid_range', '{"mon-sun": "09:00-21:00"}', 40,
 4.3, 567, 180000.75, 95.50, 1885, 1, datetime('now', '-4 months')),

-- Premium international cuisine
('rest-004', 'Le Petit Bangkok', 'Independent', '321 Sathorn Road', 'Bangkok', 'Bangkok', 'Thailand', '10120',
 13.7244, 100.5342, 'Sathorn', '+66-2-456-7890', 'reservations@lepetitbangkok.com', 'https://lepetitbangkok.com',
 'french', 'restaurant', 'luxury', '{"tue-sun": "18:00-24:00"}', 60,
 4.9, 324, 720000.00, 650.00, 1108, 1, datetime('now', '-12 months')),

-- Street food style but upscale
('rest-005', 'Chatuchak Night Bites', 'Night Market Group', '654 Chatuchak Market', 'Bangkok', 'Bangkok', 'Thailand', '10900',
 13.7998, 100.5501, 'Chatuchak', '+66-2-567-8901', 'orders@chatuchaknightbites.com', 'https://chatuchaknightbites.com',
 'street_food', 'fast_food', 'budget', '{"thu-sun": "17:00-02:00"}', 200,
 4.2, 1856, 320000.80, 75.20, 4255, 1, datetime('now', '-3 months')),

-- Pizza & Italian
('rest-006', 'Pizza Paradiso Bangkok', 'Italian Dreams', '987 Thonglor Road', 'Bangkok', 'Bangkok', 'Thailand', '10110',
 13.7308, 100.5826, 'Watthana', '+66-2-678-9012', 'ciao@pizzaparadiso.th', 'https://pizzaparadiso.th',
 'italian', 'restaurant', 'high_end', '{"mon-sun": "11:30-23:30"}', 90,
 4.4, 743, 385000.90, 220.45, 1746, 1, datetime('now', '-7 months')),

-- Seafood specialist
('rest-007', 'Ocean Harvest', 'Coastal Dining Co.', '147 Riverside Drive', 'Bangkok', 'Bangkok', 'Thailand', '10600',
 13.7200, 100.5134, 'Khlong San', '+66-2-789-0123', 'fresh@oceanharvest.co.th', 'https://oceanharvest.co.th',
 'seafood', 'restaurant', 'luxury', '{"mon-sun": "12:00-22:00"}', 110,
 4.6, 612, 620000.40, 425.80, 1456, 1, datetime('now', '-9 months')),

-- Breakfast & Brunch specialist
('rest-008', 'Morning Glory Cafe', 'Independent', '258 Ari Road', 'Bangkok', 'Bangkok', 'Thailand', '10400',
 13.7778, 100.5370, 'Phaya Thai', '+66-2-890-1234', 'hello@morningglory.cafe', 'https://morningglory.cafe',
 'international', 'cafe', 'mid_range', '{"mon-sun": "06:00-15:00"}', 50,
 4.7, 445, 125000.60, 145.75, 858, 1, datetime('now', '-5 months')),

-- Vegan & Health focused
('rest-009', 'Green Garden Bistro', 'Healthy Living Group', '369 Ekkamai Road', 'Bangkok', 'Bangkok', 'Thailand', '10110',
 13.7196, 100.5859, 'Watthana', '+66-2-901-2345', 'info@greengarden.th', 'https://greengarden.th',
 'vegetarian', 'restaurant', 'high_end', '{"mon-sun": "08:00-21:00"}', 70,
 4.5, 389, 210000.30, 195.25, 1076, 1, datetime('now', '-6 months')),

-- BBQ & Grill house
('rest-010', 'Flame & Smoke', 'Grill Masters Ltd.', '741 Ratchada Road', 'Bangkok', 'Bangkok', 'Thailand', '10400',
 13.7651, 100.5692, 'Huai Khwang', '+66-2-012-3456', 'grill@flamesmoke.co.th', 'https://flamesmoke.co.th',
 'american', 'restaurant', 'high_end', '{"mon-sun": "16:00-24:00"}', 130,
 4.3, 698, 425000.75, 285.60, 1488, 1, datetime('now', '-4 months'));