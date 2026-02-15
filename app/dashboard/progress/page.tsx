'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, TrendingUp, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProgress, AssessmentResult, GamificationStats } from '@/lib/types/database'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ProgressStats {
  courses: UserProgress[]
  assessments: AssessmentResult[]
  gamification: GamificationStats | null
  totalLessonsCompleted: number
  averageScore: number
}

export default function ProgressPage() {
  const [stats, setStats] = useState<ProgressStats>({
    courses: [],
    assessments: [],
    gamification: null,
    totalLessonsCompleted: 0,
    averageScore: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch user's progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)

      // Fetch assessment results
      const { data: assessmentData } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', user.id)

      // Fetch gamification stats
      const { data: gamificationData } = await supabase
        .from('gamification_stats')
        .select('*')
        .eq('user_id', user.id)
        .single()

      const totalLessons = progressData?.reduce((sum, p) => sum + (p.lessons_completed || 0), 0) || 0
      const avgScore = assessmentData?.length
        ? Math.round(assessmentData.reduce((sum, a) => sum + a.score, 0) / assessmentData.length)
        : 0

      setStats({
        courses: (progressData || []) as UserProgress[],
        assessments: (assessmentData || []) as AssessmentResult[],
        gamification: gamificationData as GamificationStats | null,
        totalLessonsCompleted: totalLessons,
        averageScore: avgScore,
      })

      setIsLoading(false)
    }

    fetchStats()
  }, [])

  // Prepare chart data
  const courseProgressData = stats.courses.map((course) => ({
    name: `Course ${course.course_id.slice(0, 8)}`,
    progress: course.progress_percentage || 0,
  }))

  const assessmentScoresData = stats.assessments.slice(-10).map((assessment, idx) => ({
    name: `Assessment ${idx + 1}`,
    score: assessment.score,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Progress</h1>
        <p className="text-muted-foreground mt-2">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Courses Enrolled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.courses.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lessons Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalLessonsCompleted}</p>
            <p className="text-xs text-muted-foreground mt-1">Total lessons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assessments Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.assessments.filter((a) => a.passed).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.gamification?.total_points || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Points earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Course Progress
            </CardTitle>
            <CardDescription>
              Your progress across enrolled courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courseProgressData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No course data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progress" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Assessment Scores Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Assessment Scores
            </CardTitle>
            <CardDescription>
              Your score trend over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assessmentScoresData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No assessment data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={assessmentScoresData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Your Level & Achievements
          </CardTitle>
          <CardDescription>
            Badges and milestones you{"'"}ve earned
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.gamification ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    Level {stats.gamification.level}
                  </p>
                  <p className="text-xs text-muted-foreground">Current Level</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-secondary">
                    {stats.gamification.total_badges}
                  </p>
                  <p className="text-xs text-muted-foreground">Badges</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-accent">
                    {stats.gamification.current_streak}
                  </p>
                  <p className="text-xs text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Start learning to earn badges and level up!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
