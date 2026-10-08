# Prescripto

Prescripto is a dark, responsive doctor appointment app built with Next.js App Router, React, Tailwind CSS 4, Framer Motion, and MongoDB/Mongoose API routes.

## Run Locally

1. Install Node.js 20.9 or newer.
2. Install packages with `npm install`.
3. Copy `.env.example` to `.env.local` and set `MONGODB_URI` and a long random `JWT_SECRET`.
4. Start MongoDB locally or create a free MongoDB Atlas database and allow your development IP.
5. Seed the 12 sample doctors with `npm run seed`.
6. Start the app with `npm run dev` and open `http://localhost:3000`.

`npm run build`, `npm start`, and `npm run lint` are also available. The UI has a local demo mode when no database is configured: browsing and appointment actions use the browser's local storage. Authentication, admin actions, and database-backed availability require the environment variables above.

## Environment

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/prescripto
JWT_SECRET=replace-with-a-long-random-secret
```

For Atlas, use the connection string from the Atlas database's Connect dialog. Never commit `.env.local` or put server secrets in `NEXT_PUBLIC_*` variables.

## Roles

Registration creates patient accounts. The API never accepts a role from the public registration form. To bootstrap the first administrator, register an account, then change its role in MongoDB and sign in again:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Clinician accounts can be assigned the `doctor` role by an administrator. Link the clinician's user ObjectId to the matching `Doctor.userId` record so the clinician-only appointment and availability checks can identify their own records.

## Main Routes

- `/` home and featured doctors
- `/doctors` searchable, filterable directory; filter state is reflected in query parameters
- `/doctors/[id]` doctor profile and 7-day, 30-minute slot picker
- `/appointments` patient appointments
- `/profile` authenticated profile editing
- `/about`, `/contact`, `/login`, `/doctor`, `/admin`

The first-visit intro is shown once per browser session. The fixed canvas background uses fewer objects on mobile and stops drifting when reduced motion is requested.

## API

All endpoints are implemented as Next.js route handlers. Protected routes use `Authorization: Bearer <token>`; access is checked against the signed JWT role.

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/doctors` with `q`, `speciality`, `available`, `fee`, `experience`, and `rating` query filters
- `POST /api/doctors` (admin), `GET /api/doctors/[id]`, `PATCH /api/doctors/[id]` (admin or owning clinician), `DELETE /api/doctors/[id]` (admin)
- `GET /api/appointments?doctorId=<id>&date=YYYY-MM-DD` returns public booked slot times
- `GET /api/appointments` lists a patient's, clinician's, or admin's appointments
- `POST /api/appointments` books a slot; `PATCH /api/appointments/[id]` cancels or completes it
- `GET` and `PATCH /api/users/me` read/update the signed-in user profile
- `GET` and `PATCH /api/doctors/me` read clinician profile/availability
- `GET /api/admin/stats` returns dashboard counts (admin)

MongoDB enforces one active booking per doctor/date/time with a partial unique index. Cancelled appointments release their slot. Request bodies are validated with Zod and duplicate-slot conflicts return HTTP 409.

Doctor photos selected in the admin form are previewed and stored as validated image data URLs in MongoDB (5 MB upload limit). A production deployment should move image storage to an object store and save its URL instead. Configure HTTPS, secure operational access to MongoDB, and a managed secret before deploying real patient data.

## Notes

The app does not use a separate Express process: the REST API is hosted by Next.js route handlers. The admin dashboard uses live API totals when configured. The doctor's chart is a compact activity visualization, not a clinical or billing report. Contact form submission is a frontend demo and does not send email.

`npm audit` currently reports high-severity advisories in the existing Next ESLint dependency tree. npm's suggested remediation is a major downgrade of `eslint-config-next` to 14.2.35, which is incompatible with this Next 16 app; review upstream compatible releases before changing the toolchain.