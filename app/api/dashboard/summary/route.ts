import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { DEMO_USER_ID, DEMO_USER_NAME } from '@/lib/demo-user'

export async function GET() {
  try {
    const progress = await query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM user_progress WHERE user_id = $1',
      [DEMO_USER_ID],
    )
    const passed = await query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM assessment_results WHERE user_id = $1 AND passed = true',
      [DEMO_USER_ID],
    )
    const gamification = await query<{ total_points: number; current_streak: number }>(
      'SELECT total_points, current_streak FROM gamification_stats WHERE user_id = $1 LIMIT 1',
      [DEMO_USER_ID],
    )

    return NextResponse.json({
      userName: DEMO_USER_NAME,
      stats: {
        coursesEnrolled: Number(progress[0]?.count ?? 0),
        assessmentsPassed: Number(passed[0]?.count ?? 0),
        pointsEarned: gamification[0]?.total_points ?? 0,
        currentStreak: gamification[0]?.current_streak ?? 0,
      },
    })
  } catch (error) {
    console.error('GET /api/dashboard/summary failed:', error)
    return NextResponse.json({ error: 'Failed to load dashboard summary' }, { status: 500 })
  }
}
