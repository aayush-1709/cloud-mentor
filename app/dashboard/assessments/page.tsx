'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

interface EnrolledAssessment {
  id: string
  assessment_id: string
  title: string
  course_id: string
  course_title: string
  passed_count: number
  total_attempts: number
  best_score: number
  last_attempt: string | null
  is_completed: boolean
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<EnrolledAssessment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAssessments = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get user's enrolled courses and their assessments
      const { data: coursesData } = await supabase
        .from('user_progress')
        .select('course_id')
        .eq('user_id', user.id)

      if (!coursesData || coursesData.length === 0) {
        setIsLoading(false)
        return
      }

      const courseIds = coursesData.map((c) => c.course_id)

      // Get assessments for enrolled courses
      const { data: assessmentsData } = await supabase
        .from('assessments')
        .select('*')
        .in('course_id', courseIds)

      if (!assessmentsData) {
        setIsLoading(false)
        return
      }

      // Get assessment results for display
      const assessmentList: EnrolledAssessment[] = []
      for (const assessment of assessmentsData) {
        const { data: resultsData } = await supabase
          .from('assessment_results')
          .select('*')
          .eq('user_id', user.id)
          .eq('assessment_id', assessment.id)

        const { data: courseData } = await supabase
          .from('courses')
          .select('title')
          .eq('id', assessment.course_id)
          .single()

        const passedCount = resultsData?.filter((r) => r.passed).length || 0
        const bestScore = resultsData?.length
          ? Math.max(...resultsData.map((r) => r.score))
          : 0

        assessmentList.push({
          id: assessment.id,
          assessment_id: assessment.id,
          title: assessment.title,
          course_id: assessment.course_id,
          course_title: courseData?.title || 'Unknown Course',
          passed_count: passedCount,
          total_attempts: resultsData?.length || 0,
          best_score: bestScore,
          last_attempt: resultsData?.[resultsData.length - 1]?.completed_at || null,
          is_completed: passedCount > 0,
        })
      }

      setAssessments(assessmentList)
      setIsLoading(false)
    }

    fetchAssessments()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assessments</h1>
        <p className="text-muted-foreground mt-2">
          Take quizzes and assessments to test your AWS knowledge
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : assessments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Available Assessments
            </CardTitle>
            <CardDescription>
              Assessments from your enrolled courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No assessments available yet. Enroll in a course to access assessments.
            </p>
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/dashboard/courses">Browse Courses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {assessment.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                      )}
                      <h3 className="text-lg font-semibold">{assessment.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {assessment.course_title}
                    </p>
                  </div>
                  <Button asChild>
                    <Link href={`/dashboard/assessments/${assessment.assessment_id}`}>
                      {assessment.is_completed ? 'Retake' : 'Take Assessment'}
                    </Link>
                  </Button>
                </div>

                {/* Progress Info */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-primary">
                      {assessment.best_score}%
                    </p>
                    <p className="text-xs text-muted-foreground">Best Score</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-secondary">
                      {assessment.total_attempts}
                    </p>
                    <p className="text-xs text-muted-foreground">Attempts</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-accent">
                      {assessment.passed_count}
                    </p>
                    <p className="text-xs text-muted-foreground">Passed</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {assessment.best_score > 0 ? `${assessment.best_score}% Complete` : 'Not Started'}
                    </span>
                  </div>
                  <Progress value={assessment.best_score} className="h-2" />
                </div>

                {assessment.last_attempt && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last attempt: {new Date(assessment.last_attempt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
