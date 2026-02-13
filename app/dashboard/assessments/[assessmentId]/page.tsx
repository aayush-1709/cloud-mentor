'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'
import type { Assessment, QuizQuestion, QuizOption } from '@/lib/types/database'

interface QuestionWithOptions extends QuizQuestion {
  options: QuizOption[]
}

export default function AssessmentPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.assessmentId as string

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    const fetchAssessmentData = async () => {
      const supabase = createClient()

      // Fetch assessment
      const { data: assessmentData } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single()

      if (assessmentData) {
        setAssessment(assessmentData as Assessment)

        // Fetch questions
        const { data: questionsData } = await supabase
          .from('quiz_questions')
          .select('*')
          .eq('assessment_id', assessmentId)
          .order('order', { ascending: true })

        if (questionsData) {
          // Fetch options for each question
          const questionsWithOptions = await Promise.all(
            questionsData.map(async (q) => {
              const { data: optionsData } = await supabase
                .from('quiz_options')
                .select('*')
                .eq('question_id', q.id)
                .order('order', { ascending: true })

              return {
                ...q,
                options: (optionsData || []) as QuizOption[],
              }
            })
          )

          setQuestions(questionsWithOptions as QuestionWithOptions[])
        }
      }

      setIsLoading(false)
    }

    fetchAssessmentData()
  }, [assessmentId])

  const handleAnswerSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitAssessment = async () => {
    // Calculate score
    let correctCount = 0
    questions.forEach((question) => {
      const selectedOptionId = answers[question.id]
      if (selectedOptionId) {
        const selectedOption = question.options.find((o) => o.id === selectedOptionId)
        if (selectedOption?.is_correct) {
          correctCount++
        }
      }
    })

    const calculatedScore = Math.round((correctCount / questions.length) * 100)
    setScore(calculatedScore)
    setShowResults(true)

    // Save result to database
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user && assessment) {
      await supabase.from('assessment_results').insert({
        user_id: user.id,
        assessment_id: assessmentId,
        score: calculatedScore,
        total_points: 100,
        passed: calculatedScore >= (assessment.passing_score || 70),
        time_spent_minutes: 0,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Assessment not found</p>
      </div>
    )
  }

  if (showResults) {
    const passed = score >= (assessment.passing_score || 70)
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Assessment Complete!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg text-center ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-5xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                {score}%
              </p>
              <p className={`text-lg font-semibold mt-2 ${passed ? 'text-green-700' : 'text-red-700'}`}>
                {passed ? 'You passed!' : 'You did not pass'}
              </p>
              {assessment.passing_score && (
                <p className="text-sm text-muted-foreground mt-1">
                  Passing score: {assessment.passing_score}%
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You answered {Object.keys(answers).length} out of {questions.length} questions correctly.
              </p>
            </div>

            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" onClick={() => router.push('/dashboard/assessments')}>
                Back to Assessments
              </Button>
              {!passed && (
                <Button onClick={() => window.location.reload()}>
                  Retake Assessment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswered = !!answers[currentQuestion.id]
  const allAnswered = Object.keys(answers).length === questions.length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{assessment.title}</h1>
        <p className="text-muted-foreground">{assessment.description}</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span className="text-muted-foreground">
            Answered: {Object.keys(answers).length}/{questions.length}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
          <CardDescription>
            {currentQuestion.question_type === 'multiple_choice' && 'Select the correct answer'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.question_type === 'multiple_choice' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    answers[currentQuestion.id] === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-medium">{option.option_text}</p>
                </button>
              ))}
            </div>
          )}

          {currentQuestion.question_type === 'short_answer' && (
            <div>
              <input
                type="text"
                placeholder="Type your answer here"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between gap-2">
        <Button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={handleNextQuestion}
              variant="outline"
            >
              Next Question
            </Button>
          ) : (
            <Button
              onClick={handleSubmitAssessment}
              disabled={!allAnswered}
              className={!allAnswered ? 'opacity-50' : ''}
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </div>

      {!allAnswered && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">
            Please answer all questions before submitting
          </p>
        </div>
      )}
    </div>
  )
}
