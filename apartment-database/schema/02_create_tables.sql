/* ============================================================
   Apartment Sales System - Table Creation Script
   Run this AFTER 01_create_database.sql.

   Table/column names match the backend's JPA entities exactly, so
   whichever way you start the app (letting Hibernate auto-create the
   tables, OR running these scripts yourself first) the database ends
   up looking the same.

   Order matters: tables are created in dependency order so every
   FOREIGN KEY can find the table it points to.
   ============================================================ */

USE ApartmentSalesDB;
GO

-- ============================================================
-- 1. USERS  (buyers, agents, admins - Module 5: Auth & RBAC)
-- ============================================================
CREATE TABLE users (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    full_name       NVARCHAR(100)   NOT NULL,
    email           NVARCHAR(150)   NOT NULL,
    password        NVARCHAR(255)   NOT NULL,
    phone           NVARCHAR(20)    NULL,
    role            NVARCHAR(20)    NOT NULL,
    status          NVARCHAR(20)    NOT NULL DEFAULT 'ACTIVE',
    avatar_url      NVARCHAR(255)   NULL,
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT CK_users_role CHECK (role IN ('BUYER', 'AGENT', 'ADMIN')),
    CONSTRAINT CK_users_status CHECK (status IN ('ACTIVE', 'SUSPENDED'))
);
GO

-- ============================================================
-- 2. LISTINGS  (Module 3: Dynamic Content Management)
-- ============================================================
CREATE TABLE listings (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    agent_id        BIGINT          NOT NULL,
    title           NVARCHAR(150)   NOT NULL,
    description     NVARCHAR(2000)  NOT NULL,
    price           DECIMAL(12,2)   NOT NULL,
    bedrooms        INT             NOT NULL,
    bathrooms       INT             NOT NULL,
    size_sqft       INT             NULL,
    address         NVARCHAR(250)   NOT NULL,
    city            NVARCHAR(100)   NOT NULL,
    latitude        FLOAT           NULL,
    longitude       FLOAT           NULL,
    amenities       NVARCHAR(500)   NULL,
    status          NVARCHAR(20)    NOT NULL DEFAULT 'AVAILABLE',
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at      DATETIME2       NULL,

    CONSTRAINT FK_listings_agent FOREIGN KEY (agent_id) REFERENCES users(id),
    CONSTRAINT CK_listings_status CHECK (status IN ('AVAILABLE', 'PENDING', 'SOLD')),
    CONSTRAINT CK_listings_price CHECK (price >= 0),
    CONSTRAINT CK_listings_bedrooms CHECK (bedrooms >= 0),
    CONSTRAINT CK_listings_bathrooms CHECK (bathrooms >= 0)
);
GO

CREATE INDEX IX_listings_city ON listings(city);
CREATE INDEX IX_listings_status ON listings(status);
CREATE INDEX IX_listings_agent ON listings(agent_id);
GO

-- ============================================================
-- 3. LISTING IMAGES  (Module 3: Media Pipeline)
-- ============================================================
CREATE TABLE listing_images (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    listing_id      BIGINT          NOT NULL,
    image_url       NVARCHAR(300)   NOT NULL,
    is_primary      BIT             NOT NULL DEFAULT 0,

    CONSTRAINT FK_listing_images_listing FOREIGN KEY (listing_id)
        REFERENCES listings(id) ON DELETE CASCADE
);
GO

-- ============================================================
-- 4. FAVORITES  (Module 4: saved listings)
-- ============================================================
CREATE TABLE favorites (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    buyer_id        BIGINT          NOT NULL,
    listing_id      BIGINT          NOT NULL,
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_favorites_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT FK_favorites_listing FOREIGN KEY (listing_id)
        REFERENCES listings(id) ON DELETE CASCADE,
    CONSTRAINT UQ_favorites_buyer_listing UNIQUE (buyer_id, listing_id)
);
GO

-- ============================================================
-- 5. SAVED SEARCHES  (Module 4: Advanced Query Engine)
-- ============================================================
CREATE TABLE saved_searches (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    buyer_id        BIGINT          NOT NULL,
    label           NVARCHAR(100)   NULL,
    keyword         NVARCHAR(255)   NULL,
    min_price       DECIMAL(12,2)   NULL,
    max_price       DECIMAL(12,2)   NULL,
    bedrooms        INT             NULL,
    city            NVARCHAR(100)   NULL,
    amenity         NVARCHAR(255)   NULL,
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_saved_searches_buyer FOREIGN KEY (buyer_id) REFERENCES users(id)
);
GO

-- ============================================================
-- 6. LEADS  (Module 4: CRM pipeline)
-- ============================================================
CREATE TABLE leads (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    buyer_id            BIGINT          NOT NULL,
    agent_id            BIGINT          NOT NULL,
    listing_id          BIGINT          NOT NULL,
    message             NVARCHAR(1000)  NULL,
    stage               NVARCHAR(20)    NOT NULL DEFAULT 'INQUIRY',
    communication_log   NVARCHAR(4000)  NULL,
    created_at          DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at          DATETIME2       NULL,

    CONSTRAINT FK_leads_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT FK_leads_agent FOREIGN KEY (agent_id) REFERENCES users(id),
    CONSTRAINT FK_leads_listing FOREIGN KEY (listing_id) REFERENCES listings(id),
    CONSTRAINT CK_leads_stage CHECK (stage IN ('INQUIRY', 'INSPECTION', 'NEGOTIATION', 'CLOSED'))
);
GO

-- ============================================================
-- 7. BOOKINGS  (Module 6: Scheduling)
-- ============================================================
CREATE TABLE bookings (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    listing_id      BIGINT          NOT NULL,
    buyer_id        BIGINT          NOT NULL,
    agent_id        BIGINT          NOT NULL,
    scheduled_at    DATETIME2       NOT NULL,
    status          NVARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    notes           NVARCHAR(500)   NULL,
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_bookings_listing FOREIGN KEY (listing_id) REFERENCES listings(id),
    CONSTRAINT FK_bookings_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT FK_bookings_agent FOREIGN KEY (agent_id) REFERENCES users(id),
    CONSTRAINT CK_bookings_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'))
);
GO

CREATE INDEX IX_bookings_agent_time ON bookings(agent_id, scheduled_at);
GO

-- ============================================================
-- 8. REVIEWS  (Module 6: Feedback & Review Management)
-- ============================================================
CREATE TABLE reviews (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    listing_id      BIGINT          NOT NULL,
    agent_id        BIGINT          NOT NULL,
    buyer_id        BIGINT          NOT NULL,
    rating          INT             NOT NULL,
    comment         NVARCHAR(1000)  NULL,
    status          NVARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_reviews_listing FOREIGN KEY (listing_id) REFERENCES listings(id),
    CONSTRAINT FK_reviews_agent FOREIGN KEY (agent_id) REFERENCES users(id),
    CONSTRAINT FK_reviews_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT CK_reviews_rating CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT CK_reviews_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);
GO

-- ============================================================
-- 9. INSPECTIONS  (Module 1: Property Inspection & PDF Engine)
-- ============================================================
CREATE TABLE inspections (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    listing_id      BIGINT          NOT NULL,
    agent_id        BIGINT          NOT NULL,
    overall_score   INT             NULL,
    general_notes   NVARCHAR(2000)  NULL,
    pdf_url         NVARCHAR(300)   NULL,
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_inspections_listing FOREIGN KEY (listing_id) REFERENCES listings(id),
    CONSTRAINT FK_inspections_agent FOREIGN KEY (agent_id) REFERENCES users(id)
);
GO

CREATE TABLE inspection_items (
    id                  BIGINT IDENTITY(1,1) PRIMARY KEY,
    inspection_id       BIGINT          NOT NULL,
    category            NVARCHAR(100)   NOT NULL,
    description         NVARCHAR(300)   NOT NULL,
    condition_score     INT             NOT NULL,
    remarks             NVARCHAR(500)   NULL,

    CONSTRAINT FK_inspection_items_inspection FOREIGN KEY (inspection_id)
        REFERENCES inspections(id) ON DELETE CASCADE,
    CONSTRAINT CK_inspection_items_score CHECK (condition_score BETWEEN 1 AND 10)
);
GO

CREATE TABLE inspection_photos (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    inspection_id   BIGINT          NOT NULL,
    photo_url       NVARCHAR(300)   NOT NULL,
    caption         NVARCHAR(200)   NULL,

    CONSTRAINT FK_inspection_photos_inspection FOREIGN KEY (inspection_id)
        REFERENCES inspections(id) ON DELETE CASCADE
);
GO

-- ============================================================
-- 10. TRANSACTIONS  (mock/simulated reservation deposits only -
--     no real payment gateway is connected)
-- ============================================================
CREATE TABLE transactions (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    listing_id      BIGINT          NOT NULL,
    buyer_id        BIGINT          NOT NULL,
    amount          DECIMAL(12,2)   NOT NULL,
    reference       NVARCHAR(40)    NOT NULL,
    status          NVARCHAR(20)    NOT NULL DEFAULT 'SUCCESS',
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_transactions_listing FOREIGN KEY (listing_id) REFERENCES listings(id),
    CONSTRAINT FK_transactions_buyer FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT UQ_transactions_reference UNIQUE (reference),
    CONSTRAINT CK_transactions_status CHECK (status IN ('SUCCESS', 'FAILED')),
    CONSTRAINT CK_transactions_amount CHECK (amount > 0)
);
GO

-- ============================================================
-- 11. NOTIFICATIONS  (Module 2 & 6: in-app notifications)
-- ============================================================
CREATE TABLE notifications (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id         BIGINT          NOT NULL,
    title           NVARCHAR(150)   NOT NULL,
    message         NVARCHAR(500)   NOT NULL,
    type            NVARCHAR(30)    NOT NULL,
    is_read         BIT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_notifications_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
);
GO

-- ============================================================
-- 12. AUDIT LOGS  (Module 2: Admin Dashboard - audit information)
-- ============================================================
CREATE TABLE audit_logs (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    admin_id        BIGINT          NOT NULL,
    action          NVARCHAR(100)   NOT NULL,
    details         NVARCHAR(500)   NULL,
    created_at      DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id)
);
GO

-- ============================================================
-- 13. PASSWORD RESET TOKENS  (Supporting feature: password reset)
-- ============================================================
CREATE TABLE password_reset_tokens (
    id              BIGINT IDENTITY(1,1) PRIMARY KEY,
    token           NVARCHAR(100)   NOT NULL,
    user_id         BIGINT          NOT NULL,
    expiry_date     DATETIME2       NOT NULL,
    used            BIT             NOT NULL DEFAULT 0,

    CONSTRAINT FK_password_reset_tokens_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_password_reset_tokens_token UNIQUE (token)
);
GO

PRINT 'All tables created successfully.';
GO
