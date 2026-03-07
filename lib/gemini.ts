import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type GenerateTextArgs = {
  prompt?: string
  system?: string
  messages?: ChatMessage[]
  // Kept for backward compatibility with existing call sites.
  model?: string
  maxTokens?: number
  temperature?: number
  topP?: number
}

const BEDROCK_REGION = 'ap-south-1'
const LLAMA_MODEL_ID = 'meta.llama3-70b-instruct-v1:0'

const client = new BedrockRuntimeClient({
  region: BEDROCK_REGION,
})

function toTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function buildLlamaPrompt(args: GenerateTextArgs) {
  const system = toTrimmedString(args.system)
  const prompt = toTrimmedString(args.prompt)
  const rawMessages = Array.isArray(args.messages) ? args.messages : []
  const messages = rawMessages
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : message.role === 'system' ? 'system' : 'user',
      content: toTrimmedString(message.content),
    }))
    .filter((message) => Boolean(message.content))

  const parts: string[] = ['<|begin_of_text|>']

  if (system) {
    parts.push(`<|start_header_id|>system<|end_header_id|>\n${system}\n<|eot_id|>`)
  }

  if (messages.length > 0) {
    for (const message of messages) {
      if (message.role === 'system') continue
      parts.push(
        `<|start_header_id|>${message.role}<|end_header_id|>\n${message.content}\n<|eot_id|>`,
      )
    }
  } else if (prompt) {
    parts.push(`<|start_header_id|>user<|end_header_id|>\n${prompt}\n<|eot_id|>`)
  }

  parts.push('<|start_header_id|>assistant<|end_header_id|>')
  return parts.join('')
}

export async function generateTextWithGemini(args: GenerateTextArgs) {
  const { maxTokens = 1024, temperature = 0.7, topP = 0.9 } = args

  if (args.model && args.model !== LLAMA_MODEL_ID) {
    console.warn(
      `[AI] Ignoring overridden model "${args.model}". Enforcing "${LLAMA_MODEL_ID}".`,
    )
  }

  const prompt = buildLlamaPrompt(args)
  const hasUserContent = /<\|start_header_id\|>user<\|end_header_id\|>\s*\S+/.test(prompt)
  if (!hasUserContent) {
    return {
      text: 'Please ask a question so I can help you.',
    }
  }

  console.log('[AI] Bedrock request', {
    region: BEDROCK_REGION,
    modelId: LLAMA_MODEL_ID,
    promptPreview: prompt.slice(0, 220),
    promptLength: prompt.length,
    maxTokens,
    temperature,
    topP,
  })

  const body = JSON.stringify({
    prompt,
    max_gen_len: maxTokens,
    temperature,
    top_p: topP,
  })

  const command = new InvokeModelCommand({
    modelId: LLAMA_MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body,
  })

  const response = await client.send(command)
  const decoded = JSON.parse(new TextDecoder().decode(response.body))
  const generation = typeof decoded?.generation === 'string' ? decoded.generation.trim() : ''

  console.log('[AI] Bedrock response', {
    modelId: LLAMA_MODEL_ID,
    hasGeneration: Boolean(generation),
    generationPreview: generation.slice(0, 220),
  })

  return {
    text: generation || 'Please ask a question so I can help you.',
  }
}
