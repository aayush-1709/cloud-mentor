'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sparkles, Send, Loader2, Mic, Volume2, Square } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'

export default function MentorPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/mentor/chat',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content:
          'Hello! I\'m CloudMentor AI, your AWS learning companion. I\'m here to help you understand AWS services, prepare for certifications, and solve AWS-related challenges. What would you like to learn about today?',
      },
    ],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (messagesEndRef.current && !hasScrolled) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, hasScrolled])

  const handleScroll = () => {
    setHasScrolled(true)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      recorder.ondataavailable = (e) => chunks.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        await transcribeAudio(blob)
        stream.getTracks().forEach((track) => track.stop())
      }

      recorder.start()
      setMediaRecorder(recorder)
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)

      const response = await fetch('/api/mentor/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { text } = await response.json()
        handleInputChange({ target: { value: text } } as any)
      }
    } catch (error) {
      console.error('Transcription error:', error)
    }
  }

  const speakResponse = async (text: string) => {
    if (!('speechSynthesis' in window)) return

    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold">AI Mentor</h1>
        <p className="text-muted-foreground mt-2">
          Ask your AWS expert questions and get personalized guidance
        </p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Mentoring Session
          </CardTitle>
          <CardDescription>
            Ask questions about AWS topics, get explanations, and receive personalized guidance
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Messages */}
          <div
            className="flex-1 overflow-y-auto mb-4 space-y-4 pr-4"
            onScroll={handleScroll}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'assistant' && (
                  <button
                    onClick={() => speakResponse(message.content)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Listen to response"
                  >
                    {isSpeaking ? (
                      <Square className="w-4 h-4 text-accent" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-4 py-2 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(e)
            }}
            className="space-y-3 border-t pt-4"
          >
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Ask your AI mentor a question..."
                className="flex-1"
                disabled={isLoading || isRecording}
              />
              <Button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'destructive' : 'outline'}
                size="icon"
                title={isRecording ? 'Stop recording' : 'Start voice recording'}
              >
                {isRecording ? (
                  <Square className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !input || !input.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Quick suggestions */}
            {messages.length === 1 && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-xs font-medium mb-2">Quick topics:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newInput = 'Explain AWS EC2 and when to use it'
                      handleInputChange({
                        target: { value: newInput },
                      } as any)
                    }}
                    className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:opacity-80 transition-opacity"
                  >
                    EC2 Basics
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newInput = 'What\'s the best AWS certification path for beginners?'
                      handleInputChange({
                        target: { value: newInput },
                      } as any)
                    }}
                    className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:opacity-80 transition-opacity"
                  >
                    Certifications
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newInput = 'Help me understand AWS cloud architecture principles'
                      handleInputChange({
                        target: { value: newInput },
                      } as any)
                    }}
                    className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:opacity-80 transition-opacity"
                  >
                    Architecture
                  </button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
