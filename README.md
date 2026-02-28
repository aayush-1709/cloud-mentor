# CloudMentor AI (Public Prototype)

CloudMentor AI is a public hackathon prototype built with Next.js, PostgreSQL, and Gemini.

## Architecture

- Next.js frontend (`app/*`)
- API routes for backend data access (`app/api/*`)
- Direct PostgreSQL access via `pg` (`lib/db.ts`)
- Gemini-powered mentor chat (`app/api/mentor/*`)

No Supabase, no authentication, and no session middleware are used.

## Environment Variables

Create `.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cloudmentor
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
```

## Local Development

1. Install dependencies:
   - `npm install`
2. Create schema:
   - Run `scripts/01-create-schema.sql`
3. Seed data:
   - Run `scripts/03-seed-courses.sql`
   - Run `scripts/04-add-course-duration.sql`
   - Run `scripts/05-add-iam-module.sql`
4. Start app:
   - `npm run dev`

## Prototype Data Model Notes

- The app uses a single internal demo user id:
  - `00000000-0000-0000-0000-000000000001`
- User-facing access is fully public (no login/signup).
- All progress, assessment results, and collaboration writes use the demo user.

## AWS Deployment Target

- Host app on EC2/Amplify
- Use Amazon RDS PostgreSQL
- Set `DATABASE_URL` to the RDS connection string
- Keep `GOOGLE_GENERATIVE_AI_API_KEY` in secure environment configuration
