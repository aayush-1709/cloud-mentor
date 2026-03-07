import { generateTextWithGemini } from '@/lib/gemini'

type MockEvaluationBody = {
  mockTitle?: string
  score?: number
  totalQuestions?: number
  percentage?: number
  sectorStats?: Record<string, { correct: number; total: number }>
  incorrectQuestions?: Array<{
    question: string
    userAnswer: string
    correctAnswer: string
    explanation: string
  }>
}

type MockEvaluationResponse = {
  readinessPercentage: number
  weakSectors: string[]
  analysis: string
  recommendations: string[]
}

function extractJsonCandidate(text: string) {
  const trimmed = (text || '').trim()
  if (!trimmed) return ''
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fenced?.[1]) return fenced[1].trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1).trim()
  return trimmed
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MockEvaluationBody
    const mockTitle = body.mockTitle || 'AWS Mock Test'
    const score = Number(body.score || 0)
    const totalQuestions = Number(body.totalQuestions || 0)
    const percentage = Number(body.percentage || 0)
    const sectorStats = body.sectorStats || {}
    const incorrectQuestions = body.incorrectQuestions || []

    const sectorLines = Object.entries(sectorStats).map(
      ([sector, stats]) =>
        `${sector}: ${stats.correct}/${stats.total} (${stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%)`,
    )

    const result = await generateTextWithGemini({
      system:
        'You are an AWS certification performance evaluator. Return STRICT JSON only with keys: readinessPercentage (number), weakSectors (string[]), analysis (string), recommendations (string[]).',
      prompt: `Evaluate this mock test result.

Mock: ${mockTitle}
Score: ${score}/${totalQuestions} (${percentage}%)

Sector stats:
${sectorLines.join('\n')}

Incorrect questions:
${incorrectQuestions
  .slice(0, 20)
  .map(
    (item, idx) =>
      `${idx + 1}) Q: ${item.question}
   User: ${item.userAnswer}
   Correct: ${item.correctAnswer}
   Explanation: ${item.explanation}`,
  )
  .join('\n\n')}

Rules:
- weakSectors must be selected from listed sector names only.
- Choose up to 4 weak sectors.
- analysis under 80 words.
- recommendations max 4 concise items.`,
    })

    let parsed: MockEvaluationResponse | null = null
    try {
      parsed = JSON.parse(extractJsonCandidate(result.text)) as MockEvaluationResponse
    } catch {
      parsed = null
    }

    if (!parsed) {
      const weakSectors = Object.entries(sectorStats)
        .filter(([, stats]) => stats.total > 0 && stats.correct / stats.total < 0.7)
        .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
        .slice(0, 3)
        .map(([sector]) => sector)

      return Response.json({
        readinessPercentage: percentage,
        weakSectors,
        analysis: 'Your mock result suggests focused revision in weaker sectors before the next attempt.',
        recommendations: [
          'Revise weak sectors with targeted notes and examples.',
          'Solve 10-15 practice questions per weak sector.',
          'Retake the mock after revision and compare latest score.',
        ],
      } satisfies MockEvaluationResponse)
    }

    return Response.json({
      readinessPercentage:
        typeof parsed.readinessPercentage === 'number' ? parsed.readinessPercentage : percentage,
      weakSectors: Array.isArray(parsed.weakSectors) ? parsed.weakSectors : [],
      analysis: parsed.analysis || '',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    } satisfies MockEvaluationResponse)
  } catch (error) {
    console.error('POST /api/mentor/mock-evaluation failed:', error)
    return new Response('Failed to evaluate mock test', { status: 500 })
  }
}
