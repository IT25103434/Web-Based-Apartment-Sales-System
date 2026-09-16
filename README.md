# Web-Based Apartment Sales System - Agent Listing & Media Handling Module

A complete, standalone Java Spring Boot & Microsoft SQL Server module designed for property **Agent Listing Flow & Media Handling**. Built as an integration-ready, individual university project module.

---

## Architecture & Technology Stack

* **Backend**: Java 17, Spring Boot 3.2.3, Spring Data JPA, Hibernate, Maven
* **Database Compatibility**: Microsoft SQL Server (with automatic H2 fallback for instant out-of-the-box demo execution)
* **Image Processing Engine**: `Thumbnailator` (Automatic resizing, JPEG/PNG/WebP validation, quality compression, and center-cropped 400x300 thumbnail generation)
* **Frontend**: HTML5, Vanilla CSS3 (Modern Glassmorphism Design System), JavaScript (ES6+ with REST API client)
* **Storage**: Local disk file storage (`uploads/images/`, `uploads/thumbnails/`, `uploads/floorplans/`)

---

## Core Features & Workflow Scope

1. **Agent Dashboard**: Dynamic summary displaying counters for Total, Draft, Available, Reserved, and Sold listings.
2. **My Listings Management**: Card grid & table views, status filters, live search bar, cover image previews, edit/view/delete controls.
3. **Multi-Section Listing Form**:
   - **Basic Information**: Title, Description, Price, Location, Address, City, Bedrooms, Bathrooms, Beds, Size (sqft).
   - **Amenities**: Multi-select matrix (Parking, Pool, Gym, Security, Elevator, Garden, Balcony, AC, Internet, CCTV).
4. **Image Upload & Processing Pipeline**:
   - Multi-file drag & drop image uploader (JPG, JPEG, PNG, WebP format validation, 10MB size limit).
   - Server-side resizing to max 1920x1080 resolution.
   - High-quality thumbnail generation (400x300).
   - Reordering images & setting primary cover image.
5. **Floor Plan Handling**: PDF document upload validation, replacement, removal, and integrated PDF Viewer Modal.
6. **Virtual Tour / 3D Walkthrough**: External virtual tour URL insertion (e.g. Matterport 3D, 360° links, Video tours) with URL validation and embedded Modal viewer.
7. **Listing Status Workflow**: Transition between states (`DRAFT` → `AVAILABLE` → `RESERVED` → `SOLD`) with field validation prior to publishing.
8. **Mock Agent / Ownership Isolation**: Toggle active agent in top navbar (`Agent #101` vs `Agent #102`) to test listing isolation.

---

## Getting Started & Execution Guide

### Prerequisites
* Java JDK 17 or higher
* Apache Maven 3.8+ (or IntelliJ IDEA Maven plugin)
* (Optional) Microsoft SQL Server 2016+ & SQL Server Management Studio (SSMS)

---

### Method A: Instant Run (H2 In-Memory Database - Default)

By default, the application runs out-of-the-box using an embedded H2 database so you can present and test the feature immediately without database setup:

```bash
# Clone or open project directory
cd project

# Run with Maven
mvn spring-boot:run
```

Access the application in your web browser:
👉 **[http://localhost:8080](http://localhost:8080)**

---

### Method B: Run with Microsoft SQL Server

#### 1. SQL Server Database Setup
1. Open **Microsoft SQL Server Management Studio (SSMS)** or `sqlcmd`.
2. Create the target database:
   ```sql
   CREATE DATABASE ApartmentSalesDB;
   GO
   ```

#### 2. Execute SQL Schema Creation Script
Run the following SQL script to create all tables with SQL Server compatible data types, constraints, and identity columns:

```sql
USE ApartmentSalesDB;
GO

-- 1. Agents Table
CREATE TABLE agents (
    agent_id BIGINT IDENTITY(101,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(30),
    agency VARCHAR(100),
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- 2. Apartments Table
CREATE TABLE apartments (
    apartment_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    agent_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(18,2) NOT NULL,
    location VARCHAR(255),
    address VARCHAR(255),
    city VARCHAR(100),
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    beds INT DEFAULT 0,
    size_sqft INT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Apartment_Agent FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);
GO

-- 3. Amenities Table
CREATE TABLE amenities (
    amenity_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);
GO

-- 4. Apartment Amenities Junction Table
CREATE TABLE apartment_amenities (
    apartment_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    PRIMARY KEY (apartment_id, amenity_id),
    CONSTRAINT FK_AA_Apartment FOREIGN KEY (apartment_id) REFERENCES apartments(apartment_id) ON DELETE CASCADE,
    CONSTRAINT FK_AA_Amenity FOREIGN KEY (amenity_id) REFERENCES amenities(amenity_id) ON DELETE CASCADE
);
GO

-- 5. Apartment Images Table
CREATE TABLE apartment_images (
    image_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    thumbnail_path VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    primary_image BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Image_Apartment FOREIGN KEY (apartment_id) REFERENCES apartments(apartment_id) ON DELETE CASCADE
);
GO

-- 6. Floor Plans Table
CREATE TABLE floor_plans (
    floor_plan_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    apartment_id BIGINT NOT NULL UNIQUE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_FloorPlan_Apartment FOREIGN KEY (apartment_id) REFERENCES apartments(apartment_id) ON DELETE CASCADE
);
GO

-- 7. Virtual Tours Table
CREATE TABLE virtual_tours (
    tour_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    apartment_id BIGINT NOT NULL UNIQUE,
    tour_url VARCHAR(1000) NOT NULL,
    tour_type VARCHAR(50) NOT NULL DEFAULT 'TOUR_360',
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_VirtualTour_Apartment FOREIGN KEY (apartment_id) REFERENCES apartments(apartment_id) ON DELETE CASCADE
);
GO
```

#### 3. Configure Credentials & Activate Profile
Open `src/main/resources/application-mssql.properties` and edit your database username/password if different:
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=ApartmentSalesDB;encrypt=true;trustServerCertificate=true;
spring.datasource.username=sa
spring.datasource.password=YourPassword123!
```

Launch application with the `mssql` Spring profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=mssql
```

---

## REST API Reference

All requests accept the HTTP Header `X-Agent-Id` (Default: `101`).

### Apartments
* `GET /api/apartments/dashboard/stats`: Returns analytics counters for total, draft, available, reserved, and sold listings.
* `GET /api/apartments?status={STATUS}&query={SEARCH}`: Retrieves listings belonging to the active agent.
* `GET /api/apartments/{id}`: Retrieves comprehensive listing details.
* `POST /api/apartments`: Creates a new apartment listing (Draft or Available).
* `PUT /api/apartments/{id}`: Updates apartment details.
* `PATCH /api/apartments/{id}/status`: Updates listing status (`DRAFT`, `AVAILABLE`, `RESERVED`, `SOLD`).
* `DELETE /api/apartments/{id}`: Deletes listing and associated storage files.

### Media & Attachments
* `POST /api/apartments/{id}/images`: Uploads image, triggers thumbnail generation & media processing pipeline.
* `DELETE /api/images/{imageId}`: Deletes image file and database record.
* `PUT /api/images/{imageId}/primary`: Sets designated image as the cover photo.
* `PUT /api/apartments/{id}/images/order`: Reorders image display sequence.
* `POST /api/apartments/{id}/floor-plan`: Uploads floor-plan PDF document.
* `DELETE /api/floor-plans/{id}`: Removes floor-plan PDF.
* `POST /api/apartments/{id}/virtual-tour`: Adds or updates virtual tour link & type.
* `DELETE /api/virtual-tours/{id}`: Removes virtual tour link.

---

## Image Processing & Media Pipeline Details

1. **Validation**: Incoming files are validated against allowed MIME types (`.jpg`, `.jpeg`, `.png`, `.webp`) and a maximum limit of 10MB per file.
2. **Resizing**: Original images are down-scaled to a maximum of 1920×1080 resolution with 85% JPEG compression quality to save disk space while preserving visual fidelity.
3. **Thumbnail Generation**: A 400×300 center-cropped thumbnail is automatically created using `Thumbnailator` and saved under `uploads/thumbnails/`.
4. **Static File Serving**: The Spring Boot backend exposes local upload directories securely under `/uploads/**`.

---

## University Presentation Guide / Viva Summary

When presenting this standalone module to evaluators:
1. **Showcase Integration Readiness**: Explain that all API endpoints consume/return clean JSON and use `X-Agent-Id` header isolation, allowing easy future connection to authentication/user management modules.
2. **Demonstrate End-to-End Flow**:
   - Create a draft listing → Notice status is `DRAFT`.
   - Upload 2-3 photos via drag & drop → Highlight server-side thumbnail generation.
   - Select a cover image → Notice the `COVER` badge updates instantly.
   - Upload a floor plan PDF → Click "View PDF" modal.
   - Add a virtual tour URL → Click "Launch Virtual Tour" iframe modal.
   - Publish listing → Validation ensures missing required fields block publishing.
   - Switch active agent in header from `John Alex` to `Sarah Connor` → Notice listings update according to owner isolation rules.
