import { generateTextWithGemini } from '@/lib/gemini'

const AWS_MENTOR_SYSTEM_PROMPT = `You are CloudMentor AI, an expert AWS (Amazon Web Services) mentor and instructor. Your role is to:

1. Help learners understand AWS services and how to use them effectively
2. Explain AWS architecture patterns and best practices
3. Provide guidance on AWS certification exam preparation
4. Answer technical questions about AWS services, pricing, and configurations
5. Help troubleshoot AWS-related issues
6. Suggest learning paths based on the user's goals and current skill level

Always:
- Be encouraging and supportive
- Explain concepts in clear, simple terms for beginners, but don't oversimplify for advanced users
- Provide practical examples when possible
- Reference AWS best practices and documentation
- Help users think through problems systematically
- Admit when you don't know something and suggest resources

When helping with:
- Architecture: Ask about requirements first, then suggest appropriate AWS services
- Troubleshooting: Help the user isolate the problem systematically
- Learning: Tailor explanations to the user's skill level
- Certification prep: Focus on the key concepts likely to appear on exams`

type StructuredMentorReply = {
  summary?: string
  keyPoints?: string[]
  weakAreas?: string[]
  nextSteps?: string[]
}

function extractJsonCandidate(text: string) {
  const trimmed = (text || '').trim()
  if (!trimmed) return ''

  // Handle fenced output like ```json ... ```
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fencedMatch?.[1]) return fencedMatch[1].trim()

  // Handle extra text around JSON by slicing from first { to last }
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim()
  }

  return trimmed
}

function formatStructuredReply(reply: StructuredMentorReply) {
  const summary = (reply.summary || '').trim()
  const keyPoints = (reply.keyPoints || []).map((item) => item.trim()).filter(Boolean)
  const weakAreas = (reply.weakAreas || []).map((item) => item.trim()).filter(Boolean)
  const nextSteps = (reply.nextSteps || []).map((item) => item.trim()).filter(Boolean)

  const lines: string[] = []
  lines.push('Summary:')
  lines.push(summary || 'Here is a focused answer based on your question.')

  if (keyPoints.length > 0) {
    lines.push('')
    lines.push('Key Points:')
    for (const point of keyPoints) lines.push(`- ${point}`)
  }

  if (weakAreas.length > 0) {
    lines.push('')
    lines.push('Likely Weak Areas:')
    for (const item of weakAreas) lines.push(`- ${item}`)
  }

  if (nextSteps.length > 0) {
    lines.push('')
    lines.push('Next Steps:')
    for (const step of nextSteps) lines.push(`- ${step}`)
  }

  return lines.join('\n')
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const messages = (Array.isArray(body.messages) ? body.messages : []) as Array<{
      role: 'user' | 'assistant'
      content: string
    }>
    const directMessage = typeof body.message === 'string' ? body.message.trim() : ''
    const learnerContext = (body.learnerContext || '') as string
    const sanitizedMessages = messages
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: (message.content || '').trim(),
      }))
      .filter((message) => Boolean(message.content))

    const latestUserMessage = [...sanitizedMessages]
      .reverse()
      .find((message) => message.role === 'user')?.content
    const prompt = directMessage || latestUserMessage || ''

    if (!prompt.trim()) {
      return Response.json({
        text: 'Please ask a question so I can help you.',
      })
    }

    const contextPrompt = learnerContext
      ? `\n\nLearner performance context (from app state):\n${learnerContext}\nUse this when the user asks about performance/readiness/weak areas.`
      : ''

    const result = await generateTextWithGemini({
      system: `${AWS_MENTOR_SYSTEM_PROMPT}${contextPrompt}

Output policy:
- Return STRICT JSON only.
- Use this exact schema:
{
  "summary": "string",
  "keyPoints": ["string"],
  "weakAreas": ["string"],
  "nextSteps": ["string"]
}
- Keep summary under 70 words.
- Keep arrays concise (3-6 bullets each).
- If weakAreas are unknown, return an empty array.`,
      messages: sanitizedMessages,
      prompt,
    })

    let parsed: StructuredMentorReply | null = null
    try {
      const jsonCandidate = extractJsonCandidate(result.text)
      parsed = JSON.parse(jsonCandidate) as StructuredMentorReply
    } catch {
      parsed = null
    }

    if (!parsed) {
      return Response.json({
        text: result.text,
      })
    }

    return Response.json({
      text: formatStructuredReply(parsed),
    })
  } catch (error) {
    console.error('Error in mentor chat:', error)
    return new Response('Error processing request', { status: 500 })
  }
}
