-- V2__seed_data.sql - Master Catalog Seed for Indian Agriculture and Market Linkage

-- 1. Seed Master Crops Catalog
INSERT INTO crops (id, name, category, unit) VALUES
(1, 'Onion', 'Vegetables', 'Quintal'),
(2, 'Tomato', 'Vegetables', 'Quintal'),
(3, 'Potato', 'Vegetables', 'Quintal'),
(4, 'Paddy', 'Cereals', 'Quintal'),
(5, 'Cotton', 'Fiber Crops', 'Quintal'),
(6, 'Chilli', 'Spices', 'Quintal');

-- 2. Seed Master Crop Varieties
INSERT INTO crop_varieties (id, crop_id, name, description) VALUES
(1, 1, 'Nasik Red', 'High pungency, excellent storage shelf life.'),
(2, 1, 'Garhwa', 'Summer onion crop with dark red color.'),
(3, 2, 'Hybrid Green', 'Firm texture suitable for long distance transport.'),
(4, 2, 'Vaishali', 'High yield table variety.'),
(5, 3, 'Kufri Jyoti', 'Standard round white tuber, multipurpose.'),
(6, 4, 'Basmati 1121', 'Extra long grain aromatic rice.'),
(7, 5, 'Medium Staple', 'Fiber length 24.5mm - 27.0mm.'),
(8, 6, 'Guntur Teja', 'Extra hot red chilli with high SHU capsaicin.');

-- 3. Seed Regional Mandis (APMCs)
INSERT INTO markets (id, name, state, district, address, latitude, longitude, active) VALUES
(1, 'Nashik APMC', 'Maharashtra', 'Nashik', 'Dindori Road, Nashik, MH 422004', 20.0059, 73.7898, TRUE),
(2, 'Pune APMC (Gultekdi)', 'Maharashtra', 'Pune', 'Market Yard, Gultekdi, Pune, MH 411037', 18.4900, 73.8650, TRUE),
(3, 'Mumbai Vashi APMC', 'Maharashtra', 'Thane', 'Sector 19, Vashi, Navi Mumbai, MH 400703', 19.0760, 73.0070, TRUE),
(4, 'Azadpur Mandi', 'Delhi', 'North Delhi', 'Azadpur, New Delhi, DL 110033', 28.7160, 77.1770, TRUE),
(5, 'Kurnool APMC', 'Andhra Pradesh', 'Kurnool', 'Mandi Road, Kurnool, AP 518003', 15.8281, 78.0373, TRUE);

-- Note: All demo users, farmer crops, buyer requirements, and offers have been purged.
-- Real user accounts and live transactions will be created dynamically through the portal.
