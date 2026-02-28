import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { DEMO_USER_ID } from '@/lib/demo-user'

type Params = {
  params: Promise<{ courseId: string; lessonId: string }>
}

export async function GET(_: Request, { params }: Params) {
  try {
    const { courseId, lessonId } = await params

    const course = await query<{ id: string; title: string }>(
      'SELECT id, title FROM courses WHERE id = $1 LIMIT 1',
      [courseId],
    )
    if (!course[0]) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const lessons = await query<{
      id: string
      course_id: string
      title: string
      content: string
      order_index: number
      video_url: string | null
      resources: string[] | null
      estimated_duration: number
    }>(
      `SELECT id, course_id, title, content, order_index, video_url, resources, estimated_duration
       FROM lessons
       WHERE course_id = $1
       ORDER BY order_index ASC`,
      [courseId],
    )

    const currentLesson = lessons.find((lesson) => lesson.id === lessonId)
    if (!currentLesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const progress = await query<{ completed_lesson_ids: string[] | null }>(
      'SELECT completed_lesson_ids FROM user_progress WHERE user_id = $1 AND course_id = $2 LIMIT 1',
      [DEMO_USER_ID, courseId],
    )
    const completedLessonIds = progress[0]?.completed_lesson_ids ?? []

    return NextResponse.json({
      course: course[0],
      lessons,
      lesson: currentLesson,
      isMarkedComplete: completedLessonIds.includes(lessonId),
    })
  } catch (error) {
    console.error('GET lesson details failed:', error)
    return NextResponse.json({ error: 'Failed to load lesson details' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { courseId, lessonId } = await params
    const body = (await request.json()) as { markComplete?: boolean }
    const markComplete = Boolean(body.markComplete)

    const current = await query<{ completed_lesson_ids: string[] | null; total_lessons: number }>(
      `SELECT completed_lesson_ids, total_lessons
       FROM user_progress
       WHERE user_id = $1 AND course_id = $2
       LIMIT 1`,
      [DEMO_USER_ID, courseId],
    )

    if (!current[0]) {
      return NextResponse.json({ error: 'Enrollment required first' }, { status: 400 })
    }

    const completedSet = new Set(current[0].completed_lesson_ids ?? [])
    if (markComplete) {
      completedSet.add(lessonId)
    } else {
      completedSet.delete(lessonId)
    }

    const completedCount = completedSet.size
    const totalLessons = current[0].total_lessons || 1
    const progressPercentage = Math.round((completedCount / totalLessons) * 100)
    const status = progressPercentage >= 100 ? 'completed' : 'in_progress'

    await query(
      `UPDATE user_progress
       SET completed_lesson_ids = $1,
           lessons_completed = $2,
           progress_percentage = $3,
           status = $4,
           updated_at = NOW()
       WHERE user_id = $5 AND course_id = $6`,
      [Array.from(completedSet), completedCount, progressPercentage, status, DEMO_USER_ID, courseId],
    )

    return NextResponse.json({
      ok: true,
      isMarkedComplete: markComplete,
      lessonsCompleted: completedCount,
      progressPercentage,
    })
  } catch (error) {
    console.error('POST lesson completion failed:', error)
    return NextResponse.json({ error: 'Failed to update lesson progress' }, { status: 500 })
  }
}
