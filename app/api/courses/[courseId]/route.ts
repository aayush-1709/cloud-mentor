import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { DEMO_USER_ID } from '@/lib/demo-user'

type Params = {
  params: Promise<{ courseId: string }>
}

export async function GET(_: Request, { params }: Params) {
  try {
    const { courseId } = await params

    const courses = await query<{
      id: string
      title: string
      description: string
      level: string
      category: string
      total_lessons: number
      estimated_duration_hours: number
    }>(
      `SELECT
         c.id,
         c.title,
         c.description,
         c.level,
         c.category,
         COUNT(l.id)::int AS total_lessons,
         COALESCE(CEIL(SUM(l.estimated_duration)::numeric / 60), 0)::int AS estimated_duration_hours
       FROM courses c
       LEFT JOIN lessons l ON l.course_id = c.id
       WHERE c.id = $1
       GROUP BY c.id`,
      [courseId],
    )
    const course = courses[0]

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const lessons = await query<{
      id: string
      course_id: string
      title: string
      content: string
      order_index: number
      estimated_duration: number
      objectives: string[]
      video_url: string | null
      resources: string[] | null
      parent_lesson_id: string | null
    }>(
      `SELECT *
       FROM lessons
       WHERE course_id = $1
       ORDER BY order_index ASC`,
      [courseId],
    )

    const enrollment = await query<{ course_id: string }>(
      'SELECT course_id FROM user_progress WHERE user_id = $1 AND course_id = $2 LIMIT 1',
      [DEMO_USER_ID, courseId],
    )

    return NextResponse.json({
      course,
      lessons,
      isEnrolled: Boolean(enrollment[0]),
    })
  } catch (error) {
    console.error('GET /api/courses/[courseId] failed:', error)
    return NextResponse.json({ error: 'Failed to load course' }, { status: 500 })
  }
}
