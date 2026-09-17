# Apartment Sales System - Database

SQL Server (SSMS) scripts for the Apartment Sales System. These match the
backend's JPA entities column-for-column, so it doesn't matter whether you:

- run these scripts yourself in SSMS first, **or**
- just start the backend and let Hibernate auto-create the tables
  (`spring.jpa.hibernate.ddl-auto=update`)

...the resulting database looks the same either way.

## Folder structure

```text
database/
├── schema/
│   ├── 01_create_database.sql   # creates the ApartmentSalesDB database
│   └── 02_create_tables.sql      # creates all 13 tables, PKs, FKs, checks
├── seed/
│   ├── 01_seed_data.sql          # sample users/listings/bookings/etc.
│   └── 02_verify_seed.sql        # optional: row counts + a quick join query
└── README.md
```

## How to run (SSMS)

1. Open SQL Server Management Studio and connect to your local SQL Server
   instance.
2. Open `schema/01_create_database.sql` and click **Execute**. This creates
   (or recreates) the `ApartmentSalesDB` database.
3. Open `schema/02_create_tables.sql` and click **Execute**. This creates
   every table listed below, in the correct dependency order, with primary
   keys, foreign keys, and sensible `CHECK` constraints (e.g. a rating must
   be between 1 and 5).
4. *(Optional, but recommended for demoing)* Open `seed/01_seed_data.sql`
   and click **Execute**. This inserts sample data - **run it only once, on
   a freshly created database**, since the script relies on the
   auto-generated IDs starting at 1.
5. *(Optional)* Run `seed/02_verify_seed.sql` to see row counts for every
   table and a quick listings-with-agent-and-rating query.

## Tables

| Table | Purpose |
|---|---|
| `users` | Buyers, agents and admins (RBAC via the `role` column) |
| `listings` | Apartment listings, owned by an agent |
| `listing_images` | Photos attached to a listing |
| `favorites` | A buyer's saved/bookmarked listings |
| `saved_searches` | A buyer's saved search filters |
| `leads` | CRM pipeline: buyer inquiries tracked by an agent |
| `bookings` | Site-visit appointments |
| `reviews` | Buyer ratings/reviews, moderated by an admin |
| `inspections` | Property inspection reports |
| `inspection_items` | Checklist line items for an inspection |
| `inspection_photos` | Photos attached to an inspection |
| `transactions` | **Mock/simulated** reservation deposits (no real payment gateway) |
| `notifications` | In-app notifications |
| `audit_logs` | A record of admin actions (suspend user, change role, etc.) |
| `password_reset_tokens` | Short-lived tokens for the "forgot password" flow |

## Sample login accounts (from the seed data)

Every seeded account uses the same password so it's easy to demo:

| Email | Role | Password |
|---|---|---|
| `admin@apartmentsales.com` | ADMIN | `Password123` |
| `agent1@apartmentsales.com` (Sarah Fernando) | AGENT | `Password123` |
| `agent2@apartmentsales.com` (Kasun Perera) | AGENT | `Password123` |
| `buyer1@apartmentsales.com` (Nadeesha Silva) | BUYER | `Password123` |
| `buyer2@apartmentsales.com` (Ruwan Jayasuriya) | BUYER | `Password123` |
| `buyer3@apartmentsales.com` (Ishara Gunawardena) | BUYER | `Password123` |

The password column stores a real bcrypt hash of `Password123`, so you can
log in through the actual `POST /api/auth/login` endpoint with these
credentials straight after running the seed script - no need to register
new accounts just to demo the app.

**Note:** the sample listing/inspection photo URLs (e.g.
`/uploads/sample/listing1_main.jpg`) are placeholders - they show the
relationship between a listing and its images, but the actual image files
aren't included. Upload real photos through the app
(`POST /api/listings/{id}/images`) to see working images.

## Re-running the scripts

`01_create_database.sql` drops and recreates the database if it already
exists, so you can safely re-run the whole set of scripts from scratch
whenever you want a clean slate (e.g. before a demo).
