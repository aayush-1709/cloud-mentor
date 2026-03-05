# CloudMentor AI (Public Prototype)

CloudMentor AI is a public hackathon prototype for AWS learning. It combines guided courses, assessments, progress tracking, collaboration rooms, and an AI mentor experience.

The app is intentionally demo-first:

- no signup/login flow
- no Supabase auth or RLS
- one fixed internal demo user used for writes

## Tech Stack

- Next.js App Router + React + TypeScript
- PostgreSQL with direct `pg` queries (`lib/db.ts`)
- Gemini integration through `@ai-sdk/google` (`lib/gemini.ts`)
- Tailwind CSS + shadcn/ui + Radix UI
- Recharts for progress visualizations

## Project Structure

- `app/` - pages and API routes
- `app/api/` - backend route handlers
- `components/` - feature/UI components
- `lib/` - database and AI utility modules
- `data/mockTests.ts` - static mock test bank used by assessments page
- `scripts/` - SQL setup/seed scripts
- `cloudmentor.sql` - full PostgreSQL dump (schema + data)

## Environment Variables

Create `.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cloudmentor

# Use one or more Gemini keys
GOOGLE_GENERATIVE_AI_API_KEY=your_key
# Optional alternatives (also supported):
# GEMINI_API_KEY=your_key
# GEMINI_API_KEY_1=your_key
# GEMINI_API_KEY_2=your_key
# GEMINI_API_KEY_3=your_key
```

`DATABASE_URL` is required at startup.

## Local Development

1. Install dependencies

```bash
npm install
```

2. Initialize the database (choose one)

- **Option A: Script-based setup**
  - Run `scripts/01-create-schema.sql`
  - Run `scripts/03-seed-courses.sql`
  - Run `scripts/04-add-course-duration.sql`
  - Run `scripts/05-add-iam-module.sql`
- **Option B: Full import**
  - Import `cloudmentor.sql` into your PostgreSQL database

3. Start dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Available Commands

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run start` - run production build
- `npm run lint` - run lint checks

## Product Flows

- **Courses** - browse/filter, enroll, open lessons, mark completion
- **Assessments** - local mock-test engine plus DB-backed assessment endpoints
- **Progress** - combines DB progress with some local browser-stored signals
- **AI Mentor** - text chat, mock/section evaluation, voice transcription flow
- **Collaboration** - create/manage rooms and invite members by email

## API Overview

- `GET /api/courses`
- `POST /api/courses`
- `DELETE /api/courses`
- `GET /api/courses/:courseId`
- `GET /api/courses/:courseId/lessons/:lessonId`
- `POST /api/courses/:courseId/lessons/:lessonId`
- `GET /api/assessments`
- `GET /api/assessments/:assessmentId`
- `POST /api/assessments/:assessmentId`
- `GET /api/progress`
- `GET /api/dashboard/summary`
- `GET /api/collaboration/rooms`
- `POST /api/collaboration/rooms`
- `PUT /api/collaboration/rooms/:roomId`
- `DELETE /api/collaboration/rooms/:roomId`
- `POST /api/collaboration/rooms/:roomId/invite`
- `POST /api/mentor/chat`
- `POST /api/mentor/mock-evaluation`
- `POST /api/mentor/section-evaluation`
- `POST /api/mentor/transcribe`

## Demo Data Model Notes

- Demo user id is fixed as `00000000-0000-0000-0000-000000000001`
- Public user access is open (no login/signup)
- Most writes (progress, assessments, collaboration) map to the demo user

## Known Caveats

- If you only run script-based setup, verify `lesson_progress` exists before using enroll/de-enroll flows (`DELETE /api/courses` touches this table). `cloudmentor.sql` includes it.
- Some dashboard/progress signals are browser-local (localStorage), not fully server-persisted.
- Mentor voice/screen features require browser permissions (`microphone` / `screen capture`).
- Embedded learning videos require internet access.

## Deployment Notes

- Host Next.js on EC2, Amplify, or another Node-capable runtime.
- Use Amazon RDS PostgreSQL (or compatible managed Postgres) for `DATABASE_URL`.
- Store Gemini API keys in secure environment configuration.
