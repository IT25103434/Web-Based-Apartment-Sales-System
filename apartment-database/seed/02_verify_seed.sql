/* ============================================================
   Quick sanity check - run this after the schema + seed scripts
   to confirm everything loaded correctly. Not required by the
   app itself, just handy for a demo/viva.
   ============================================================ */

USE ApartmentSalesDB;
GO

SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'listings', COUNT(*) FROM listings
UNION ALL SELECT 'listing_images', COUNT(*) FROM listing_images
UNION ALL SELECT 'favorites', COUNT(*) FROM favorites
UNION ALL SELECT 'saved_searches', COUNT(*) FROM saved_searches
UNION ALL SELECT 'leads', COUNT(*) FROM leads
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL SELECT 'inspections', COUNT(*) FROM inspections
UNION ALL SELECT 'inspection_items', COUNT(*) FROM inspection_items
UNION ALL SELECT 'inspection_photos', COUNT(*) FROM inspection_photos
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs;
GO

-- A quick look at listings with their agent's name and average rating
SELECT
    l.id,
    l.title,
    u.full_name AS agent_name,
    l.price,
    l.city,
    l.status,
    (SELECT AVG(CAST(r.rating AS FLOAT)) FROM reviews r WHERE r.listing_id = l.id AND r.status = 'APPROVED') AS avg_rating
FROM listings l
JOIN users u ON u.id = l.agent_id
ORDER BY l.id;
GO
