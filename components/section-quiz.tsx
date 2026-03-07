'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export type SectionQuizQuestion = {
  id: string
  question: string
  options?: string[]
  correctIndex?: number
  correctTextAnswer?: string
  explanation: string
}

type SectionQuizProps = {
  sectionName: string
  moduleTitles: string[]
  questions: SectionQuizQuestion[]
  onComplete: (passed: boolean) => void
}

type CognitiveEvaluation = {
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

export function SectionQuiz({ sectionName, moduleTitles, questions, onComplete }: SectionQuizProps) {
  const [started, setStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [textDraft, setTextDraft] = useState('')
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [answeredQuestions, setAnsweredQuestions] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [reviewMode, setReviewMode] = useState(false)
  const [evaluation, setEvaluation] = useState<CognitiveEvaluation | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)

  const total = questions.length
  const currentQuestion = questions[currentIndex]
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined
  const hasAnsweredCurrent = currentQuestion ? Boolean(answeredQuestions[currentQuestion.id]) : false
  const isCurrentCorrect = (() => {
    if (!currentQuestion || !hasAnsweredCurrent) return false
    const answer = answers[currentQuestion.id]
    if (currentQuestion.options && typeof currentQuestion.correctIndex === 'number') {
      return answer === currentQuestion.correctIndex
    }
    if (typeof currentQuestion.correctTextAnswer === 'string') {
      return String(answer ?? '').trim().toLowerCase() === currentQuestion.correctTextAnswer.trim().toLowerCase()
    }
    return false
  })()

  const score = questions.reduce((sum, question, index) => {
    const answer = answers[question.id]
    if (question.options && typeof question.correctIndex === 'number') {
      return answer === question.correctIndex ? sum + 1 : sum
    }
    if (typeof question.correctTextAnswer === 'string') {
      return String(answer ?? '').trim().toLowerCase() === question.correctTextAnswer.trim().toLowerCase()
        ? sum + 1
        : sum
    }
    return sum
  }, 0)
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const passed = percentage >= 70

  const startQuiz = () => {
    setStarted(true)
    setCurrentIndex(0)
    setTextDraft('')
    setAnswers({})
    setAnsweredQuestions({})
    setSubmitted(false)
    setReviewMode(false)
    setEvaluation(null)
    setIsEvaluating(false)
  }

  const getUserAnswerText = (question: SectionQuizQuestion) => {
    const answer = answers[question.id]
    if (question.options && typeof answer === 'number') {
      return question.options[answer] ?? 'Not answered'
    }
    if (typeof answer === 'string') return answer
    return 'Not answered'
  }

  const getCorrectAnswerText = (question: SectionQuizQuestion) => {
    if (question.options && typeof question.correctIndex === 'number') {
      return question.options[question.correctIndex] ?? 'N/A'
    }
    return question.correctTextAnswer ?? 'N/A'
  }

  const submitQuiz = async () => {
    setSubmitted(true)
    onComplete(passed)

    setIsEvaluating(true)
    try {
      const questionResults = questions
        .map((question) => {
          const answer = answers[question.id]
          let isCorrect = false
          if (question.options && typeof question.correctIndex === 'number') {
            isCorrect = answer === question.correctIndex
          }
          if (typeof question.correctTextAnswer === 'string') {
            isCorrect = String(answer ?? '').trim().toLowerCase() === question.correctTextAnswer.trim().toLowerCase()
          }
          return {
          id: question.id,
          question: question.question,
          userAnswer: getUserAnswerText(question),
          correctAnswer: getCorrectAnswerText(question),
          explanation: question.explanation,
          isCorrect,
          }
        })

      const response = await fetch('/api/mentor/section-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionName,
          moduleTitles,
          score,
          totalQuestions: total,
          percentage,
          questionResults,
        }),
      })
      if (!response.ok) {
        setIsEvaluating(false)
        return
      }
      const data = (await response.json()) as CognitiveEvaluation
      setEvaluation(data)
    } catch (error) {
      console.error('Section cognitive evaluation failed:', error)
    } finally {
      setIsEvaluating(false)
    }
  }

  if (!started) {
    return (
      <div className="space-y-3">
        <div className="border-t border-border pt-3" />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Section Quiz</p>
            <p className="text-xs text-muted-foreground">{total || 25} Questions • 5–7 Minutes</p>
          </div>
          <Button onClick={startQuiz}>Start Section Quiz</Button>
        </div>
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="space-y-3 rounded-md border border-border p-3">
        <p className="text-sm font-medium">Section Quiz</p>
        <p className="text-sm text-muted-foreground">No quiz questions configured for {sectionName} yet.</p>
        <Button variant="outline" onClick={() => setStarted(false)}>
          Close
        </Button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="space-y-3 rounded-md border border-border p-3">
        <p className="text-sm font-semibold">{sectionName} Quiz Result</p>
        <p className="text-sm">Score: {score}/{total}</p>
        <p className="text-sm">Percentage: {percentage}%</p>
        <p className={`text-sm font-medium ${passed ? 'text-green-500' : 'text-amber-500'}`}>
          {passed ? 'Architect-Level Section Mastered ✅' : 'Review explanations and try again.'}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setReviewMode((prev) => !prev)}>
            {reviewMode ? 'Hide Review' : 'Review Questions'}
          </Button>
          <Button variant="outline" onClick={startQuiz}>
            Retake Quiz
          </Button>
        </div>
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm space-y-1">
          <p className="font-medium">AI Cognitive Evaluation</p>
          {isEvaluating ? (
            <p className="text-muted-foreground">Evaluating weak modules...</p>
          ) : evaluation ? (
            <>
              <p>
                Readiness for this section: <span className="font-semibold">{evaluation.readinessPercentage}%</span>
              </p>
              <p>
                Weak modules:{' '}
                <span className="font-semibold">
                  {evaluation.weakModules.length > 0 ? evaluation.weakModules.join(', ') : 'No major weak module detected'}
                </span>
              </p>
              <p>
                Successfully answered topics:{' '}
                <span className="font-semibold">
                  {evaluation.strongModules.length > 0 ? evaluation.strongModules.join(', ') : 'None identified yet'}
                </span>
              </p>
              <p>
                Study again (subsection topics):{' '}
                <span className="font-semibold">
                  {evaluation.studyAgainTopics.length > 0
                    ? evaluation.studyAgainTopics.join(', ')
                    : 'No specific subsection revision needed'}
                </span>
              </p>
              {evaluation.modulePerformance.length > 0 ? (
                <div className="rounded border border-border p-2 mt-1 space-y-1">
                  <p className="font-medium">Topic-wise performance</p>
                  {evaluation.modulePerformance.map((item) => (
                    <p key={item.module} className="text-xs">
                      {item.module}: {item.correct}/{item.total} ({item.accuracy}%)
                    </p>
                  ))}
                </div>
              ) : null}
              {evaluation.analysis ? (
                <p className="text-muted-foreground">{evaluation.analysis}</p>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground">Evaluation will appear here after submission.</p>
          )}
        </div>
        {reviewMode && (
          <div className="space-y-2 pt-1">
            {questions.map((question, index) => {
              const answer = answers[question.id]
              const isCorrect = question.options && typeof question.correctIndex === 'number'
                ? answer === question.correctIndex
                : typeof question.correctTextAnswer === 'string'
                  ? String(answer ?? '').trim().toLowerCase() === question.correctTextAnswer.trim().toLowerCase()
                  : false

              const userAnswerText =
                question.options && typeof answer === 'number'
                  ? question.options[answer] ?? 'Not answered'
                  : typeof answer === 'string'
                    ? answer
                    : 'Not answered'

              const correctText =
                question.options && typeof question.correctIndex === 'number'
                  ? question.options[question.correctIndex]
                  : question.correctTextAnswer ?? 'N/A'

              return (
                <div
                  key={question.id}
                  className={`rounded-md border p-3 text-sm ${
                    isCorrect ? 'border-green-500/40 bg-green-500/10' : 'border-red-500/40 bg-red-500/10'
                  }`}
                >
                  <p className="font-medium">{index + 1}. {question.question}</p>
                  <p className="mt-1">Your answer: {userAnswerText}</p>
                  <p>Correct answer: {correctText}</p>
                  <p className="text-muted-foreground mt-1">Explanation: {question.explanation}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <p className="text-sm font-medium">Section Quiz</p>
      <p className="text-xs text-muted-foreground">
        Question {currentIndex + 1}/{total}
      </p>
      <p className="text-sm">{currentQuestion.question}</p>

      {currentQuestion.options && typeof currentQuestion.correctIndex === 'number' ? (
        <div className="space-y-2">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = currentAnswer === optionIndex
            return (
              <label key={option} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`${sectionName}-${currentIndex}`}
                  checked={isSelected}
                  disabled={hasAnsweredCurrent}
                  onChange={() => {
                    if (hasAnsweredCurrent) return
                    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }))
                    setAnsweredQuestions((prev) => ({ ...prev, [currentQuestion.id]: true }))
                  }}
                />
                <span className={isSelected ? 'font-medium' : ''}>{option}</span>
              </label>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            value={textDraft}
            onChange={(event) => setTextDraft(event.target.value)}
            disabled={hasAnsweredCurrent}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            placeholder="Type your answer"
          />
          <Button
            variant="outline"
            disabled={hasAnsweredCurrent || textDraft.trim().length === 0}
            onClick={() => {
              const answer = textDraft.trim()
              setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }))
              setAnsweredQuestions((prev) => ({ ...prev, [currentQuestion.id]: true }))
            }}
          >
            Submit Answer
          </Button>
        </div>
      )}

      {hasAnsweredCurrent && (
        <div
          className={`rounded-md border p-3 text-sm ${
            isCurrentCorrect ? 'border-green-500/40 bg-green-500/10' : 'border-red-500/40 bg-red-500/10'
          }`}
        >
          <p className="font-medium">{isCurrentCorrect ? '✅ Correct Answer' : '❌ Incorrect Answer'}</p>
          <p className="mt-1">
            Explanation: {currentQuestion.explanation}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => {
            const nextIndex = Math.max(currentIndex - 1, 0)
            setCurrentIndex(nextIndex)
            const nextQuestion = questions[nextIndex]
            const nextAnswer = answers[nextQuestion.id]
            setTextDraft(typeof nextAnswer === 'string' ? nextAnswer : '')
          }}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        {currentIndex < total - 1 ? (
          <Button
            onClick={() => {
              const nextIndex = Math.min(currentIndex + 1, total - 1)
              setCurrentIndex(nextIndex)
              const nextQuestion = questions[nextIndex]
              const nextAnswer = answers[nextQuestion.id]
              setTextDraft(typeof nextAnswer === 'string' ? nextAnswer : '')
            }}
            disabled={!hasAnsweredCurrent}
          >
            Next
          </Button>
        ) : (
          <Button onClick={() => void submitQuiz()} disabled={!hasAnsweredCurrent}>
            Submit
          </Button>
        )}
      </div>
    </div>
  )
}
