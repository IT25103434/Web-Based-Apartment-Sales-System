/* ============================================================
   Apartment Sales System - Database Creation Script
   Run this FIRST in SQL Server Management Studio (SSMS).

   Target: Microsoft SQL Server (SSMS). Do NOT run this against MySQL.
   ============================================================ */

USE master;
GO

-- Drop and recreate if it already exists, so you can re-run this
-- script safely while developing without manually deleting the DB first.
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'ApartmentSalesDB')
BEGIN
    ALTER DATABASE ApartmentSalesDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ApartmentSalesDB;
END
GO

CREATE DATABASE ApartmentSalesDB;
GO

ALTER DATABASE ApartmentSalesDB SET RECOVERY SIMPLE;
GO

USE ApartmentSalesDB;
GO

PRINT 'ApartmentSalesDB created successfully.';
GO
