# HiredHub: Job Portal and Application Tracker

A full-stack job portal where **job seekers** discover roles, apply, and track every application on a Kanban board, and **recruiters** post jobs and manage candidates through a hiring pipeline.

- **Frontend:** React 18 (JavaScript), Vite, React Router, Tailwind CSS, Chart.js, Framer Motion, Axios, Lucide, React Hot Toast, @hello-pangea/dnd
- **Backend:** Node.js, Express, MongoDB Atlas with Mongoose, JWT, bcrypt.js, Multer, express-validator, helmet, express-rate-limit
- **Architecture:** REST API with MVC (models, controllers, routes, middleware)

## Features

**Job seekers**
- Overview dashboard: KPIs, status chart, weekly activity chart, recent applications, upcoming interviews, recommended jobs
- Job search with working backend filters (skills, location, company, salary range, experience, employment type, work mode), sorting and pagination. Filters live in the URL, so searches can be shared
- Job details with match breakdown, one-step apply (choose or upload a resume, add a cover letter), duplicate applications blocked
- Application tracker: drag-and-drop Kanban (Applied, Assessment, Interview, Offer, Rejected) and a list view, with search, notes, interview dates, history and delete
- Saved jobs (apply straight from the list, see which are already applied)
- Resume library (PDF, DOC, DOCX up to 5 MB; preview, download, replace, set primary, delete)
- Profile (picture, skills, experience, education, preferred locations, expected salary, links) and password change
- Analytics: conversion rates, status breakdown, applications over time, weekly activity, top categories

**Recruiters**
- Overview: active jobs, total applicants, interviews scheduled, successful hires, pipeline and trend charts
- Create, edit, close, reopen and delete jobs (only your own)
- Applicants per job with match scores, candidate profile, resume preview, shortlist, reject, change stage, set interview date
- Company profile (changes flow to your existing job listings)

**Explainable recommendations.** Match score is 100 points: skills 70 (shared equally across the job's required skills), experience 15, location 15. Every score shows the matching and missing skills and the points per part. No machine learning is involved.

## Quick start

Requirements: Node.js 18+, and a MongoDB Atlas cluster (free tier is fine) or any MongoDB.

```bash
# 1. Install everything
npm run install:all

# 2. Configure the backend
cp backend/.env.example backend/.env
#    then edit backend/.env: set MONGO_URI and JWT_SECRET (see comments in the file)

# 3. Seed demo data (this wipes the database it points to)
npm run seed

# 4. Run, in two terminals
npm run dev:backend      # API on http://localhost:5000
npm run dev:frontend     # App on http://localhost:5173
```

In development the Vite dev server proxies `/api` and `/uploads` to port 5000, so the frontend needs no configuration.

In MongoDB Atlas remember to allow your IP under **Network Access** and create a database user under **Database Access**.

## Demo accounts

All seeded accounts use the password `Password123`.

| Role | Email |
|---|---|
| Job seeker (has applications, saved jobs, a resume) | `seeker@hiredhub.dev` |
| Recruiter, Razorpay | `recruiter@hiredhub.dev` |
| Recruiter, Postman | `recruiter2@hiredhub.dev` |
| Extra candidates (applied to jobs) | `candidate1@hiredhub.dev` to `candidate6@hiredhub.dev` |

The login page shows a "fill in demo login" shortcut in development. For production builds set `VITE_SHOW_DEMO=true` to keep it.

Seeded resumes are tiny placeholder PDFs so previews work out of the box.

## Environment variables

**backend/.env**

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | 16+ random characters. The server refuses to start without it |
| `JWT_EXPIRES_IN` | no | Token lifetime, default `7d` |
| `CLIENT_URL` | yes | Allowed browser origins, comma separated (`http://localhost:5173`, your Vercel URL) |
| `PORT` | no | Default `5000` |
| `UPLOAD_DIR` | no | Absolute path for uploaded files. Point it at a persistent disk in production |

**frontend/.env** (optional in development)

| Variable | Description |
|---|---|
| `VITE_API_URL` | API origin in production, for example `https://hiredhub-api.onrender.com` (no trailing slash, no `/api`) |
| `VITE_SHOW_DEMO` | `true` to show demo login shortcuts in a production build |

## Project structure

```
hiredhub/
├── backend/
│   ├── config/db.js               MongoDB connection
│   ├── controllers/               auth, job, application, resume, saved, profile, recommendation, analytics
│   ├── middleware/                auth (protect, authorize), upload (Multer), validate, error
│   ├── models/                    User, Job, Application, SavedJob, Resume
│   ├── routes/                    one router per resource
│   ├── utils/                     matching algorithm, file helpers, token, errors
│   ├── uploads/                   resumes (private) and avatars (public)
│   ├── seed.js                    demo data
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/            common, layout, jobs, dashboard, applications
│       ├── pages/                 public, auth, seeker, recruiter
│       ├── context/ hooks/ services/ utils/ routes/
│       └── App.jsx, main.jsx
├── render.yaml                    Render blueprint for the API
└── README.md
```

## API reference

Base path `/api`. Authenticated routes need `Authorization: Bearer <token>`. Errors look like `{ "success": false, "message": "..." }` and validation errors also include an `errors` array. Roles are enforced on the server.

**Auth**

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | public | `name, email, password (8+), role (seeker or recruiter), companyName (recruiters)` |
| POST | `/auth/login` | public | `email, password, role (optional check)`. Returns `token` and `user` |
| GET | `/auth/me` | any user | Current user |

**Jobs**

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/jobs` | public | Query: `q, skills, location, company, minSalary, maxSalary, experience, type, workMode, sort (newest, salaryHigh, salaryLow), page, limit`. List filters are comma separated. Adds `isSaved` and `hasApplied` for signed-in seekers |
| GET | `/jobs/filters/options` | public | Distinct skills, locations, companies |
| GET | `/jobs/stats/summary` | public | Counts for the landing page |
| GET | `/jobs/:id` | public | Includes recruiter info |
| GET | `/jobs/mine` | recruiter | Own jobs with `applicantCount` |
| POST | `/jobs` | recruiter | Create |
| PUT | `/jobs/:id` | recruiter (owner) | Update, including `status: active or closed` |
| DELETE | `/jobs/:id` | recruiter (owner) | Also removes its applications and saved entries |

**Applications**

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/applications` | seeker | multipart: `jobId, coverLetter, resume (file) or resumeId`. 409 if already applied |
| GET | `/applications` | seeker | Own applications and per-status counts |
| GET | `/applications/:id` | applicant or job's recruiter | Full detail with history |
| PATCH | `/applications/:id/status` | applicant or job's recruiter | `status, note, interviewDate` |
| PATCH | `/applications/:id` | applicant or recruiter | `notes` (applicant only), `interviewDate` |
| PATCH | `/applications/:id/shortlist` | recruiter (owner) | `shortlisted: boolean` |
| DELETE | `/applications/:id` | seeker (owner) | |
| GET | `/applications/job/:jobId` | recruiter (owner) | Applicants with profile and match score |

**Saved jobs** (seeker): `GET /saved`, `POST /saved/:jobId`, `DELETE /saved/:jobId`

**Resumes**

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/resumes` | seeker | With `applicationCount` |
| POST | `/resumes` | seeker | multipart `resume`. Max 10 per user |
| PUT | `/resumes/:id` | seeker (owner) | Replace the file |
| PATCH | `/resumes/:id/primary` | seeker (owner) | |
| DELETE | `/resumes/:id` | seeker (owner) | 409 while attached to an application |
| GET | `/resumes/:id/download` | owner, or a recruiter the resume was submitted to | `?inline=1` to view in the browser |

**Profile**: `GET /profile`, `PUT /profile`, `PUT /profile/password` (`currentPassword, newPassword`), `POST /profile/avatar` (multipart `avatar`)

**Recommendations** (seeker): `GET /recommendations?limit=6`, `GET /recommendations/:jobId`

**Analytics**: `GET /analytics/seeker`, `GET /analytics/recruiter`

## Database schema

| Collection | Key fields | Relationships and indexes |
|---|---|---|
| **User** | `name, email (unique), password (hashed, hidden), role, phone, avatar, headline, skills[], experienceYears, education[], preferredLocations[], expectedSalary, linkedin, github, portfolio, company{name, logo, website, size, about}` | Index on `role` |
| **Job** | `title, company{name, logo, website, size}, location, workMode, employmentType, experienceLevel, minExperience, salary{min, max, currency}, category, description, responsibilities[], qualifications[], skills[], benefits[], status` | `recruiter` references User. Indexes on filter fields, a text index and `createdAt` |
| **Application** | `status, shortlisted, coverLetter, notes, interviewDate, history[{status, note, by, changedBy, changedAt}]` | References `job`, `applicant`, `recruiter` (copied from the job so ownership checks are a single field), `resume`. **Unique index on `(job, applicant)`** prevents duplicates |
| **SavedJob** | | References `user` and `job`. Unique `(user, job)` |
| **Resume** | `originalName, filename, mimeType, size, isPrimary` | References `user` |

All collections have timestamps and schema-level validation.

## Security notes

- Passwords hashed with bcrypt (12 rounds); never returned by the API
- JWT auth with role checks in middleware on every protected route; recruiters can only touch their own jobs and applications, seekers only their own data
- Uploads: allow-listed types by both MIME type and extension, 5 MB (resume) and 2 MB (avatar) limits, random server-generated filenames. Resumes are not served statically; they are streamed only to the owner or the recruiter who received them
- express-validator on inputs, escaped regexes for search, helmet headers, rate limiting (stricter on login and register)
- The JWT is stored in `localStorage`, which keeps sessions across reloads but is readable by any script on the page. React escapes output by default, and the app renders no raw HTML. For a stricter setup, move the token to an httpOnly cookie

## Deployment

**1. Database (MongoDB Atlas).** Create a free cluster and a database user. Under Network Access allow `0.0.0.0/0` (or Render's outbound IPs). Copy the connection string. To load the demo data once against Atlas, run `npm run seed` locally with that `MONGO_URI`.

**2. Backend (Render).**
1. Push this repo to GitHub.
2. In Render choose **New, Blueprint** and select the repo (it reads `render.yaml`), or create a **Web Service** manually with root directory `backend`, build `npm install`, start `npm start`.
3. Set `MONGO_URI` and `CLIENT_URL` (your Vercel URL, set after step 3 and then redeploy). `JWT_SECRET` is generated for you.
4. Check `https://<your-api>.onrender.com/api/health`.

Railway works the same way: root directory `backend`, same variables.

**3. Frontend (Vercel).**
1. Import the repo and set **Root Directory** to `frontend` (framework: Vite).
2. Add `VITE_API_URL=https://<your-api>.onrender.com`.
3. Deploy. `frontend/vercel.json` already rewrites all paths to `index.html` so deep links and refreshes work.
4. Put the resulting Vercel URL into the backend's `CLIENT_URL`.

**Uploads in production.** Render's filesystem is wiped on every deploy, so uploaded resumes and avatars disappear unless you attach a persistent disk (paid plan) and set `UPLOAD_DIR` to its mount path. For a larger deployment, move files to object storage such as S3 and keep the same authorisation checks.

## Manual test checklist

1. Register as a job seeker and as a recruiter; log out and back in; refresh and stay signed in
2. Seeker: open `/dashboard`, apply to a job with a new PDF, try applying again (blocked), see it in My Applications
3. Drag a card to Interview, set a date, refresh and confirm it persisted; open details, add notes, view history
4. Save and unsave jobs; apply from Saved Jobs
5. Resume page: upload, preview, replace, set primary, try deleting a resume that is in use
6. Profile: add skills and locations, and watch match scores change on the overview
7. Recruiter: post a job, edit it, close and reopen it; open applicants, shortlist, change stage, reject, preview a resume
8. As the seeker, confirm the recruiter's stage change appears on your board
9. Confirm a seeker visiting `/recruiter` is redirected, and that API calls with the wrong role return 403

## Known limitations

- No email verification, password reset or notifications (they need an email provider)
- Single resume file per upload; no virus scanning
- Job posting is one step; there is no draft state (close a job to hide it)
- The seeded testimonials on the landing page are sample copy; replace them before launch
