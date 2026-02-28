import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { DEMO_USER_ID } from '@/lib/demo-user'

export async function GET() {
  try {
    const courses = await query<{
      id: string
      user_id: string
      course_id: string
      lessons_completed: number
      total_lessons: number
      progress_percentage: number
      created_at: string
      updated_at: string
    }>('SELECT * FROM user_progress WHERE user_id = $1 ORDER BY updated_at DESC', [DEMO_USER_ID])

    const assessments = await query<{
      id: string
      user_id: string
      assessment_id: string
      score: number
      total_points: number
      passed: boolean
      completed_at: string
      time_spent_minutes: number
    }>('SELECT * FROM assessment_results WHERE user_id = $1 ORDER BY completed_at ASC', [DEMO_USER_ID])

    const gamification = await query<{
      id: string
      user_id: string
      total_points: number
      total_badges: number
      current_streak: number
      level: number
      created_at: string
      updated_at: string
    }>('SELECT * FROM gamification_stats WHERE user_id = $1 LIMIT 1', [DEMO_USER_ID])

    return NextResponse.json({
      courses,
      assessments,
      gamification: gamification[0] ?? null,
    })
  } catch (error) {
    console.error('GET /api/progress failed:', error)
    return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 })
  }
}
