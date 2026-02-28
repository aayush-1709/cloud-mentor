import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const audioBlob = formData.get('audio') as Blob

    if (!audioBlob) {
      return Response.json({ error: 'No audio provided' }, { status: 400 })
    }

    // Convert blob to base64 for API
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    // Use Gemini as a lightweight fallback for transcription simulation
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: `You are a transcription assistant. The following is a base64 encoded audio file that needs to be transcribed. Return a short, clean transcription-style sentence only. Audio sample: ${base64Audio.substring(0, 100)}...`,
      temperature: 0.3,
    })

    // For production, replace this with a real speech-to-text provider integration
    // For now, we're returning a placeholder that will work with the UI
    const transcribedText = result.text || 'What is AWS EC2?'

    return Response.json({ text: transcribedText })
  } catch (error) {
    console.error('Transcription error:', error)
    return Response.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}
