import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { DEMO_USER_ID } from '@/lib/demo-user'

export async function GET() {
  try {
    const assessments = await query<{
      id: string
      assessment_id: string
      title: string
      course_id: string
      course_title: string
      passed_count: number
      total_attempts: number
      best_score: number
      last_attempt: string | null
      is_completed: boolean
    }>(
      `SELECT
         a.id,
         a.id AS assessment_id,
         a.title,
         a.course_id,
         c.title AS course_title,
         COALESCE(SUM(CASE WHEN ar.passed THEN 1 ELSE 0 END), 0)::int AS passed_count,
         COALESCE(COUNT(ar.id), 0)::int AS total_attempts,
         COALESCE(MAX(ar.score), 0)::int AS best_score,
         MAX(ar.completed_at)::text AS last_attempt,
         (COALESCE(SUM(CASE WHEN ar.passed THEN 1 ELSE 0 END), 0) > 0) AS is_completed
       FROM assessments a
       INNER JOIN courses c ON c.id = a.course_id
       LEFT JOIN assessment_results ar
         ON ar.assessment_id = a.id
        AND ar.user_id = $1
       GROUP BY a.id, c.title
       ORDER BY a.created_at DESC`,
      [DEMO_USER_ID],
    )

    return NextResponse.json({ assessments })
  } catch (error) {
    console.error('GET /api/assessments failed:', error)
    return NextResponse.json({ error: 'Failed to load assessments' }, { status: 500 })
  }
}
