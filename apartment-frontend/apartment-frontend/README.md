# Nestlyn - Apartment Sales System (Frontend)

React + Vite frontend for the Apartment Sales System (Year 2 Software
Engineering group project). Talks to the Spring Boot backend over REST.

## Tech stack

- React 18 + Vite
- React Router v6
- Axios
- Tailwind CSS

## Project structure

```text
src/
├── api/            # one file per backend module (axios calls)
├── components/     # shared UI pieces (Navbar, Modal, ListingCard, ...)
├── context/         # AuthContext (login state, JWT)
├── pages/
│   ├── public/       # Home (browse/search), ListingDetail
│   ├── auth/          # Login, Register, Forgot/Reset password
│   ├── buyer/         # Favorites, Saved Searches, Bookings, Leads, Transactions
│   ├── agent/         # My Listings, Listing form, Leads, Bookings, Inspection form
│   ├── admin/         # Dashboard, Users, Review moderation, Audit log
│   └── shared/        # Profile, Notifications, 404
└── utils/           # formatting helpers (price, dates)
```

## 1. Configure the API URL

Copy `.env.example` to `.env` (already done if you got this from the zip)
and point it at your running backend:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 2. Install and run

```bash
npm install
npm run dev
```

The app runs on **http://localhost:5173** by default and expects the backend
to be running on **http://localhost:8080**.

## Roles

Registration only allows **Buyer** or **Agent** (Admin accounts are created
directly in the database - see the backend/database READMEs). What a user
sees changes based on their role:

- **Buyer** - browse/search listings, save favorites & searches, book site
  visits, message agents, write reviews, and make (simulated) reservation
  deposits.
- **Agent** - create/edit/delete their own listings with photos, manage
  buyer inquiries through a simple pipeline (Inquiry → Inspection →
  Negotiation → Closed), confirm/cancel bookings, and create inspection
  reports with a downloadable PDF.
- **Admin** - dashboard stats, user management (suspend/activate/change
  role), review moderation, and an audit log of admin actions.

## Notes

- **Images and PDFs** are served by the backend at
  `http://localhost:8080/uploads/...` - the frontend resolves relative
  image URLs against the API's origin automatically (see
  `src/components/ListingCard.jsx`).
- **The reservation deposit flow is a simulation.** The UI is upfront about
  this (see the note in the deposit modal on a listing page) - no real
  payment gateway is called anywhere.
- Kept deliberately simple: plain `useState`/`useEffect` and React Context
  for auth, no Redux, no TypeScript, no component library beyond Tailwind
  utility classes - appropriate for a Year 2 group project.
