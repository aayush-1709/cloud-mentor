import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { DEMO_USER_ID } from '@/lib/demo-user'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')

    const courses = await query<{
      id: string
      title: string
      description: string
      level: string
      category: string
      total_lessons: number
      estimated_duration_hours: number
      created_at: string
    }>(
      `SELECT
         c.id,
         c.title,
         c.description,
         c.level,
         c.category,
         COUNT(l.id)::int AS total_lessons,
         COALESCE(CEIL(SUM(l.estimated_duration)::numeric / 60), 0)::int AS estimated_duration_hours,
         c.created_at
       FROM courses c
       LEFT JOIN lessons l ON l.course_id = c.id
       WHERE ($1::text IS NULL OR c.level = $1)
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [level],
    )

    const enrolled = await query<{ course_id: string }>(
      'SELECT course_id FROM user_progress WHERE user_id = $1',
      [DEMO_USER_ID],
    )

    return NextResponse.json({
      courses,
      enrolledCourseIds: enrolled.map((row) => row.course_id),
    })
  } catch (error) {
    console.error('GET /api/courses failed:', error)
    return NextResponse.json({ error: 'Failed to load courses' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { courseId?: string }
    if (!body.courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
    }

    const totals = await query<{ total_lessons: number }>(
      'SELECT COUNT(*)::int AS total_lessons FROM lessons WHERE course_id = $1',
      [body.courseId],
    )
    const totalLessons = totals[0]?.total_lessons ?? 0

    await query(
      `INSERT INTO user_progress (
         user_id,
         course_id,
         lessons_completed,
         total_lessons,
         progress_percentage,
         status
       ) VALUES ($1, $2, 0, $3, 0, 'in_progress')
       ON CONFLICT (user_id, course_id)
       DO NOTHING`,
      [DEMO_USER_ID, body.courseId, totalLessons],
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST /api/courses failed:', error)
    return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 })
  }
}
