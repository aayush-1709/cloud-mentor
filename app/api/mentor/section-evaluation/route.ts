import { generateTextWithGemini } from '@/lib/gemini'

type SectionEvaluationBody = {
  sectionName?: string
  moduleTitles?: string[]
  score?: number
  totalQuestions?: number
  percentage?: number
  questionResults?: Array<{
    id: string
    question: string
    userAnswer: string
    correctAnswer: string
    explanation: string
    isCorrect: boolean
  }>
}

type SectionEvaluationResponse = {
  readinessPercentage: number
  weakModules: string[]
  strongModules: string[]
  studyAgainTopics: string[]
  modulePerformance: Array<{
    module: string
    correct: number
    total: number
    accuracy: number
    status: 'strong' | 'moderate' | 'weak'
  }>
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

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toTokenSet(value: string) {
  return new Set(
    normalizeText(value)
      .split(' ')
      .filter((token) => token.length > 2),
  )
}

function pickModuleForQuestion(
  questionText: string,
  moduleTitles: string[],
  fallbackIndex: number,
  totalQuestions: number,
) {
  if (moduleTitles.length === 0) return ''

  const questionTokens = toTokenSet(questionText)
  let bestScore = -1
  let bestModule = moduleTitles[0]

  for (const moduleTitle of moduleTitles) {
    const moduleTokens = toTokenSet(moduleTitle)
    let overlap = 0
    for (const token of moduleTokens) {
      if (questionTokens.has(token)) overlap += 1
    }
    if (overlap > bestScore) {
      bestScore = overlap
      bestModule = moduleTitle
    }
  }

  if (bestScore > 0) return bestModule
  const inferredIndex = Math.floor((fallbackIndex / Math.max(totalQuestions, 1)) * moduleTitles.length)
  return moduleTitles[Math.min(inferredIndex, moduleTitles.length - 1)]
}

function buildFallbackEvaluation(
  moduleTitles: string[],
  questionResults: Array<{
    question: string
    isCorrect: boolean
  }>,
  percentage: number,
): SectionEvaluationResponse {
  const stats = new Map<string, { correct: number; total: number }>()
  for (const moduleTitle of moduleTitles) {
    stats.set(moduleTitle, { correct: 0, total: 0 })
  }

  questionResults.forEach((item, index) => {
    const module = pickModuleForQuestion(item.question, moduleTitles, index, questionResults.length)
    const current = stats.get(module) ?? { correct: 0, total: 0 }
    current.total += 1
    if (item.isCorrect) current.correct += 1
    stats.set(module, current)
  })

  const modulePerformance = Array.from(stats.entries()).map(([module, val]) => {
    const accuracy = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0
    const status: 'strong' | 'moderate' | 'weak' = accuracy >= 80 ? 'strong' : accuracy >= 60 ? 'moderate' : 'weak'
    return {
      module,
      correct: val.correct,
      total: val.total,
      accuracy,
      status,
    }
  })

  const weakModules = modulePerformance
    .filter((item) => item.total > 0 && item.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy)
    .map((item) => item.module)
    .slice(0, 4)

  const strongModules = modulePerformance
    .filter((item) => item.total > 0 && item.accuracy >= 70)
    .sort((a, b) => b.accuracy - a.accuracy)
    .map((item) => item.module)
    .slice(0, 4)

  const studyAgainTopics = weakModules

  return {
    readinessPercentage: percentage,
    weakModules,
    strongModules,
    studyAgainTopics,
    modulePerformance,
    analysis:
      weakModules.length > 0
        ? `You did well overall in some areas, but need focused revision in: ${weakModules.join(', ')}.`
        : 'Great job. Your responses are consistent across the section modules.',
    recommendations:
      weakModules.length > 0
        ? [
            `Revise these subsection topics first: ${weakModules.join(', ')}.`,
            'Re-attempt the quiz after revising weak subsection topics.',
          ]
        : ['Move to the next section and keep practicing mixed-difficulty questions.'],
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SectionEvaluationBody
    const sectionName = body.sectionName || 'Unknown Section'
    const moduleTitles = body.moduleTitles || []
    const score = Number(body.score || 0)
    const totalQuestions = Number(body.totalQuestions || 0)
    const percentage = Number(body.percentage || 0)
    const questionResults = body.questionResults || []

    const result = await generateTextWithGemini({
      system:
        'You are an AWS learning evaluator. Output strictly valid JSON only. No markdown.',
      prompt: `Evaluate this learner's COMPLETE 25-question section quiz and map outcomes to subsection modules.

Section: ${sectionName}
Modules: ${moduleTitles.join(' | ')}
Score: ${score}/${totalQuestions} (${percentage}%)

Question Results (all):
${questionResults
  .map(
    (item, idx) =>
      `${idx + 1}) Q: ${item.question}
   Result: ${item.isCorrect ? 'Correct' : 'Incorrect'}
   User Answer: ${item.userAnswer}
   Correct Answer: ${item.correctAnswer}
   Explanation: ${item.explanation}`,
  )
  .join('\n\n')}

Rules:
- Return this JSON schema exactly:
{
  "readinessPercentage": number,
  "weakModules": string[],
  "strongModules": string[],
  "studyAgainTopics": string[],
  "modulePerformance": [
    { "module": string, "correct": number, "total": number, "accuracy": number, "status": "strong" | "moderate" | "weak" }
  ],
  "analysis": string,
  "recommendations": string[]
}
- weakModules/strongModules/studyAgainTopics must contain ONLY names from provided Modules list.
- Build modulePerformance from all 25 questions.
- Keep analysis under 90 words and recommendations max 4 lines.`,
    })

    let parsed: SectionEvaluationResponse | null = null
    try {
      parsed = JSON.parse(extractJsonCandidate(result.text)) as SectionEvaluationResponse
    } catch {
      parsed = null
    }

    if (!parsed) {
      return Response.json(buildFallbackEvaluation(moduleTitles, questionResults, percentage))
    }

    const normalizedModulePerformance = Array.isArray(parsed.modulePerformance)
      ? parsed.modulePerformance
          .filter((item) => item && typeof item.module === 'string')
          .map((item) => ({
            module: item.module,
            correct: Number(item.correct || 0),
            total: Number(item.total || 0),
            accuracy: Number(item.accuracy || 0),
            status:
              item.status === 'strong' || item.status === 'moderate' || item.status === 'weak'
                ? item.status
                : 'moderate',
          }))
      : []

    return Response.json({
      readinessPercentage:
        typeof parsed.readinessPercentage === 'number' ? parsed.readinessPercentage : percentage,
      weakModules: Array.isArray(parsed.weakModules) ? parsed.weakModules : [],
      strongModules: Array.isArray(parsed.strongModules) ? parsed.strongModules : [],
      studyAgainTopics: Array.isArray(parsed.studyAgainTopics)
        ? parsed.studyAgainTopics
        : Array.isArray(parsed.weakModules)
          ? parsed.weakModules
          : [],
      modulePerformance: normalizedModulePerformance,
      analysis: parsed.analysis || '',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    } satisfies SectionEvaluationResponse)
  } catch (error) {
    console.error('POST /api/mentor/section-evaluation failed:', error)
    return new Response('Failed to evaluate section performance', { status: 500 })
  }
}
