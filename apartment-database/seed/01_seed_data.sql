/* ============================================================
   Apartment Sales System - Seed / Sample Data
   Run this AFTER 01_create_database.sql and 02_create_tables.sql,
   on a FRESH database (so the auto-generated IDs line up with the
   ids referenced below - e.g. the first user inserted is id 1).

   All sample accounts use the SAME password so it's easy to demo:

        Password:  Password123

   (the value below is a real bcrypt hash of that password, so you
   can log in through the actual /api/auth/login endpoint with it)
   ============================================================ */

USE ApartmentSalesDB;
GO

DECLARE @pwd NVARCHAR(255) = '$2b$10$magSbkUHwO2lKttJlhdnaeIQEtsyOGt4kDFhGfauc7mKMPQD8Bx5y';

-- ============================================================
-- USERS  (id 1 = admin, 2-3 = agents, 4-6 = buyers)
-- ============================================================
INSERT INTO users (full_name, email, password, phone, role, status, created_at) VALUES
('System Admin',        'admin@apartmentsales.com',  @pwd, '0771000001', 'ADMIN', 'ACTIVE', SYSUTCDATETIME()),
('Sarah Fernando',      'agent1@apartmentsales.com', @pwd, '0771000002', 'AGENT', 'ACTIVE', SYSUTCDATETIME()),
('Kasun Perera',        'agent2@apartmentsales.com', @pwd, '0771000003', 'AGENT', 'ACTIVE', SYSUTCDATETIME()),
('Nadeesha Silva',      'buyer1@apartmentsales.com', @pwd, '0771000004', 'BUYER', 'ACTIVE', SYSUTCDATETIME()),
('Ruwan Jayasuriya',    'buyer2@apartmentsales.com', @pwd, '0771000005', 'BUYER', 'ACTIVE', SYSUTCDATETIME()),
('Ishara Gunawardena',  'buyer3@apartmentsales.com', @pwd, '0771000006', 'BUYER', 'ACTIVE', SYSUTCDATETIME());
GO

-- ============================================================
-- LISTINGS  (id 1-5)  -  agent1 = user 2, agent2 = user 3
-- ============================================================
INSERT INTO listings (agent_id, title, description, price, bedrooms, bathrooms, size_sqft, address, city, latitude, longitude, amenities, status, created_at, updated_at) VALUES
(2, 'Modern 2BR Apartment in Colombo 5',
    'Bright, modern 2-bedroom apartment close to Independence Square with an open-plan kitchen and balcony.',
    45000000.00, 2, 2, 1100, '12 Ward Place', 'Colombo', 6.8905, 79.8637,
    'Parking,Gym,Pool,24/7 Security', 'AVAILABLE', SYSUTCDATETIME(), SYSUTCDATETIME()),

(2, 'Cozy Studio near Galle Face',
    'Compact studio apartment with sea breeze, perfect for a single professional or young couple.',
    18000000.00, 1, 1, 550, '45 Marine Drive', 'Colombo', 6.9218, 79.8437,
    'Parking,Sea View', 'AVAILABLE', SYSUTCDATETIME(), SYSUTCDATETIME()),

(3, 'Spacious 3BR Family Apartment - Nugegoda',
    'Family-friendly 3-bedroom apartment with a shared garden and children''s play area.',
    32000000.00, 3, 2, 1450, '78 High Level Road', 'Nugegoda', 6.8721, 79.8890,
    'Parking,Playground,Garden', 'AVAILABLE', SYSUTCDATETIME(), SYSUTCDATETIME()),

(3, 'Luxury Penthouse - Rajagiriya',
    'Top-floor penthouse with a private rooftop terrace, panoramic city views, and full concierge service.',
    68000000.00, 4, 3, 2200, '9 Nawala Road', 'Rajagiriya', 6.9107, 79.8925,
    'Parking,Gym,Pool,Rooftop Terrace,Concierge', 'PENDING', SYSUTCDATETIME(), SYSUTCDATETIME()),

(2, 'Budget 1BR Apartment - Dehiwala',
    'Affordable 1-bedroom apartment close to Dehiwala railway station, ideal for first-time buyers.',
    12500000.00, 1, 1, 480, '23 Galle Road', 'Dehiwala', 6.8519, 79.8654,
    'Parking', 'AVAILABLE', SYSUTCDATETIME(), SYSUTCDATETIME());
GO

-- ============================================================
-- LISTING IMAGES  (placeholder URLs - replace with real uploaded
-- images through the app; these rows just demonstrate the relationship)
-- ============================================================
INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES
(1, '/uploads/sample/listing1_main.jpg', 1),
(1, '/uploads/sample/listing1_2.jpg', 0),
(2, '/uploads/sample/listing2_main.jpg', 1),
(3, '/uploads/sample/listing3_main.jpg', 1),
(4, '/uploads/sample/listing4_main.jpg', 1),
(5, '/uploads/sample/listing5_main.jpg', 1);
GO

-- ============================================================
-- FAVORITES
-- ============================================================
INSERT INTO favorites (buyer_id, listing_id, created_at) VALUES
(4, 1, SYSUTCDATETIME()),
(5, 3, SYSUTCDATETIME());
GO

-- ============================================================
-- SAVED SEARCHES
-- ============================================================
INSERT INTO saved_searches (buyer_id, label, keyword, min_price, max_price, bedrooms, city, amenity, created_at) VALUES
(4, 'Colombo apartments under 50M', NULL, NULL, 50000000.00, NULL, 'Colombo', NULL, SYSUTCDATETIME()),
(5, '3-bedroom family homes', NULL, NULL, NULL, 3, NULL, NULL, SYSUTCDATETIME());
GO

-- ============================================================
-- LEADS  (CRM pipeline)
-- ============================================================
INSERT INTO leads (buyer_id, agent_id, listing_id, message, stage, communication_log, created_at, updated_at) VALUES
(4, 2, 1, 'Hi, is this apartment still available? I would like to arrange a viewing.',
    'INQUIRY', 'Nadeesha Silva: Hi, is this apartment still available? I would like to arrange a viewing.',
    SYSUTCDATETIME(), SYSUTCDATETIME()),

(5, 3, 4, 'Interested in the penthouse, would like to discuss the price.',
    'NEGOTIATION',
    'Ruwan Jayasuriya: Interested in the penthouse, would like to discuss the price.' + CHAR(13) + CHAR(10) +
    '[' + CONVERT(NVARCHAR, SYSUTCDATETIME(), 120) + '] Kasun Perera: Sure, happy to discuss - are you available for a call this week?',
    SYSUTCDATETIME(), SYSUTCDATETIME());
GO

-- ============================================================
-- BOOKINGS  (site-visit appointments)
-- ============================================================
INSERT INTO bookings (listing_id, buyer_id, agent_id, scheduled_at, status, notes, created_at) VALUES
(1, 4, 2, DATEADD(DAY, 3, SYSUTCDATETIME()), 'CONFIRMED', 'Please call before arriving, gate code required.', SYSUTCDATETIME()),
(4, 5, 3, DATEADD(DAY, 5, SYSUTCDATETIME()), 'PENDING', NULL, SYSUTCDATETIME());
GO

-- ============================================================
-- REVIEWS
-- ============================================================
INSERT INTO reviews (listing_id, agent_id, buyer_id, rating, comment, status, created_at) VALUES
(1, 2, 4, 5, 'Sarah was extremely helpful and the apartment was exactly as described. Highly recommend!', 'APPROVED', SYSUTCDATETIME()),
(3, 3, 6, 4, 'Nice family apartment, Kasun was responsive throughout the process.', 'PENDING', SYSUTCDATETIME());
GO

-- ============================================================
-- INSPECTIONS  (Property Inspection Report Management)
-- ============================================================
INSERT INTO inspections (listing_id, agent_id, overall_score, general_notes, created_at) VALUES
(1, 2, 8, 'Overall the unit is in very good condition. Minor cosmetic touch-ups recommended before handover.', SYSUTCDATETIME());
GO

INSERT INTO inspection_items (inspection_id, category, description, condition_score, remarks) VALUES
(1, 'Structural', 'Walls, ceiling and flooring', 9, 'No visible cracks or damage.'),
(1, 'Electrical', 'Wiring, switches and sockets', 8, 'All outlets tested and working.'),
(1, 'Plumbing', 'Kitchen and bathroom fixtures', 7, 'Minor drip under the kitchen sink - recommend a new washer.');
GO

INSERT INTO inspection_photos (inspection_id, photo_url, caption) VALUES
(1, '/uploads/sample/inspection1_kitchen.jpg', 'Kitchen sink area');
GO

-- ============================================================
-- TRANSACTIONS  (MOCK / simulated deposits only - no real
-- payment gateway is connected anywhere in this system)
-- ============================================================
INSERT INTO transactions (listing_id, buyer_id, amount, reference, status, created_at) VALUES
(1, 4, 500000.00, 'TXN-SEED00001', 'SUCCESS', SYSUTCDATETIME());
GO

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
(2, 'New buyer inquiry', 'Nadeesha Silva is interested in "Modern 2BR Apartment in Colombo 5"', 'LEAD', 0, SYSUTCDATETIME()),
(4, 'Booking confirmed', 'Your visit for "Modern 2BR Apartment in Colombo 5" has been confirmed.', 'BOOKING', 0, SYSUTCDATETIME());
GO

-- ============================================================
-- AUDIT LOGS  (sample admin action)
-- ============================================================
INSERT INTO audit_logs (admin_id, action, details, created_at) VALUES
(1, 'ACTIVATE_USER', 'Reactivated account: buyer3@apartmentsales.com', SYSUTCDATETIME());
GO

PRINT 'Seed data inserted successfully.';
PRINT 'All sample accounts use the password: Password123';
GO
