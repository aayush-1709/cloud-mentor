import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { DEMO_USER_ID } from '@/lib/demo-user'

type Params = {
  params: Promise<{ assessmentId: string }>
}

export async function GET(_: Request, { params }: Params) {
  try {
    const { assessmentId } = await params

    const assessment = await query<{
      id: string
      course_id: string
      title: string
      description: string
      passing_score: number
      created_at: string
    }>('SELECT * FROM assessments WHERE id = $1 LIMIT 1', [assessmentId])

    if (!assessment[0]) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    const questions = await query<{
      id: string
      assessment_id: string
      question_text: string
      question_type: string
      order_index: number
      created_at: string
    }>(
      `SELECT id, assessment_id, question_text, question_type, order_index, created_at
       FROM quiz_questions
       WHERE assessment_id = $1
       ORDER BY order_index ASC`,
      [assessmentId],
    )

    const optionsByQuestion = await Promise.all(
      questions.map(async (question) => {
        const options = await query<{
          id: string
          question_id: string
          option_text: string
          is_correct: boolean
          order_index: number
        }>(
          `SELECT id, question_id, option_text, is_correct, order_index
           FROM quiz_options
           WHERE question_id = $1
           ORDER BY order_index ASC`,
          [question.id],
        )

        return {
          ...question,
          options,
        }
      }),
    )

    return NextResponse.json({
      assessment: assessment[0],
      questions: optionsByQuestion,
    })
  } catch (error) {
    console.error('GET /api/assessments/[assessmentId] failed:', error)
    return NextResponse.json({ error: 'Failed to load assessment' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { assessmentId } = await params
    const body = (await request.json()) as {
      score?: number
      totalPoints?: number
      passed?: boolean
      timeSpentMinutes?: number
    }

    await query(
      `INSERT INTO assessment_results (
         user_id,
         assessment_id,
         score,
         total_points,
         passed,
         time_spent_minutes,
         completed_at
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        DEMO_USER_ID,
        assessmentId,
        body.score ?? 0,
        body.totalPoints ?? 100,
        Boolean(body.passed),
        body.timeSpentMinutes ?? 0,
      ],
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST /api/assessments/[assessmentId] failed:', error)
    return NextResponse.json({ error: 'Failed to save assessment result' }, { status: 500 })
  }
}
