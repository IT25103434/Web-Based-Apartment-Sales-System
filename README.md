# Apartment Sales System - Backend

Spring Boot REST API for the Web-Based Apartment Sales System (Year 2 Software
Engineering group project). Handles authentication, listings, search, CRM
leads, bookings, reviews, property inspections + PDF reports, mock
transactions, notifications/email, and admin management.

## Tech stack

- Java 17
- Spring Boot 3.3 (Web, Data JPA, Security, Validation, Mail)
- Microsoft SQL Server (via `mssql-jdbc`)
- JWT authentication (`jjwt`)
- iText 5 (classic API) for PDF inspection reports
- Maven

## Project structure

Organized by feature, as required by the brief:

```text
src/main/java/com/apartment/backend/
├── auth/            # register, login, forgot/reset password
├── user/             # profile, change password
├── listing/          # listing CRUD + images + search
├── search/           # favorites, saved searches, CRM leads
├── booking/          # site-visit appointments
├── review/           # ratings + moderation
├── inspection/       # checklist, photos, PDF report
├── transaction/      # mock deposit transactions
├── notification/     # in-app notifications + real email (SMTP)
├── admin/            # dashboard stats, user mgmt, audit log
├── security/          # JWT + Spring Security wiring
├── config/            # SecurityConfig, WebConfig (static file serving)
└── common/            # ApiResponse, exceptions, FileStorageService
```

## 1. Set up the database

1. Open **SQL Server Management Studio (SSMS)**.
2. Create a database, e.g. `ApartmentSalesDB` (or run the scripts from the
   separate `database/` package once you have it).
3. Update `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=ApartmentSalesDB;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=YourPassword123
```

With `spring.jpa.hibernate.ddl-auto=update` (the default here), Hibernate will
automatically create all the tables for you the first time you run the app -
you do **not** need to write the CREATE TABLE scripts by hand to get started.

## 2. Set up email (real SMTP sending)

This project sends **real emails** (welcome email, password reset link,
booking confirmations, review moderation notices, deposit receipts) using
`JavaMailSender`. To use Gmail:

1. Turn on 2-Step Verification on the Gmail account you want to send from.
2. Go to Google Account -> Security -> App Passwords, and create one.
3. In `application.properties`:

```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-char-app-password
app.mail.from=your-email@gmail.com
```

If you don't want emails to actually send while testing (e.g. no internet on
the machine you're demoing on), set `app.mail.enabled=false` - the app will
just log what it *would have* sent instead of erroring out.

## 3. Run the backend

```bash
mvn spring-boot:run
```

The API will start on **http://localhost:8080**.

## 4. Authentication

Send `Authorization: Bearer <token>` on every request after logging in.

- `POST /api/auth/register` - `{ fullName, email, password, phone, role }` (role: `BUYER` or `AGENT`)
- `POST /api/auth/login` - `{ email, password }` -> returns `{ token, user }`
- `POST /api/auth/forgot-password` - `{ email }`
- `POST /api/auth/reset-password` - `{ token, newPassword }`

Admin accounts are **not** self-registered. Create one directly in the
database (insert into `users` with `role = 'ADMIN'`, and a bcrypt-hashed
password), or have an existing admin promote a user via
`PUT /api/admin/users/{id}/role`.

## 5. Key endpoints (by module)

| Module | Examples |
|---|---|
| Listings | `GET /api/listings?keyword=&minPrice=&maxPrice=&bedrooms=&city=&amenity=`, `POST /api/listings`, `POST /api/listings/{id}/images` |
| Search/CRM | `GET/POST /api/favorites`, `GET/POST /api/saved-searches`, `GET/POST /api/leads`, `PUT /api/leads/{id}/stage` |
| Bookings | `POST /api/bookings`, `GET /api/bookings/availability?agentId=&date=`, `PUT /api/bookings/{id}/status` |
| Reviews | `POST /api/reviews`, `GET /api/listings/{id}/reviews`, `PUT /api/reviews/{id}/moderate` (admin) |
| Inspections | `POST /api/inspections`, `POST /api/inspections/{id}/photos`, `GET /api/inspections/{id}/pdf` |
| Transactions | `POST /api/transactions` (mock deposit), `GET /api/transactions/mine` |
| Notifications | `GET /api/notifications`, `PUT /api/notifications/{id}/read` |
| Admin | `GET /api/admin/dashboard`, `GET /api/admin/users`, `PUT /api/admin/users/{id}/suspend`, `GET /api/admin/audit-logs` |

Every response is wrapped the same way:

```json
{ "success": true, "message": "OK", "data": { ... } }
```

## Notes for the write-up / demo

- **Transactions are simulated only.** `POST /api/transactions` creates a
  database record with a generated reference number and marks it `SUCCESS`
  immediately - no real payment gateway is called. This matches the brief:
  a real, working record in the database without an actual payment
  integration.
- **PDF reports** are generated with iText 5's classic (simple) API - a
  `Document`/`Paragraph`/`PdfPTable` builder, not a templating engine. Good
  enough for a checklist-style inspection report and easy to explain in a
  viva.
- **File uploads** (listing photos, inspection photos, generated PDFs) are
  saved to a local `uploads/` folder and served back at `/uploads/...` -
  simple local disk storage rather than cloud storage, which is fine for a
  university project.
- **Booking conflicts**: the backend rejects a new site-visit booking if the
  same agent already has an active booking within 59 minutes of the
  requested time, so agents can't be double-booked.
