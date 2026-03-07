'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, TrendingUp, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AssessmentResult, GamificationStats } from '@/lib/types/database'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type CourseProgress = {
  course_id: string
  course_title: string
  course_level: string
  lessons_completed: number
  total_lessons: number
  progress_percentage: number
}

type SectorStats = Record<string, { correct: number; total: number }>
type MockAttempt = {
  score: number
  totalQuestions: number
  percentage: number
  attemptedAt: string
  sectorStats?: SectorStats
}
type MockAttemptsStore = Record<string, MockAttempt[]>
const MOCK_ATTEMPTS_STORAGE_KEY = 'cloudmentor-mock-attempts'
const SAA_COMPLETION_STORAGE_KEY = 'cloudmentor-saa-completed'
const PRACTITIONER_COMPLETION_STORAGE_KEY = 'cloudmentor-practitioner-completed'
const PROFESSIONAL_COMPLETION_STORAGE_KEY = 'cloudmentor-sap-completed'
const ASSOCIATE_LESSON_ID_PREFIX = 'assoc-'
const PRACTITIONER_LESSON_ID_PREFIX = 'prac-'
const PROFESSIONAL_LESSON_ID_PREFIX = 'pro-'
const TRACK_TOTAL_LESSONS = 9

interface ProgressStats {
  courses: CourseProgress[]
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
  const [readinessPercentage, setReadinessPercentage] = useState(0)
  const [weakSectors, setWeakSectors] = useState<string[]>([])
  const [latestMockScores, setLatestMockScores] = useState<
    Array<{ name: string; score: number | null; fullName: string }>
  >([])

  const getCourseShortLabel = (course: CourseProgress) => {
    const title = course.course_title.toLowerCase()
    if (title.includes('associate')) return 'Associate'
    if (title.includes('practitioner')) return 'Practitioner'
    if (title.includes('advanced')) return 'Advanced'
    return course.course_level
      ? course.course_level[0].toUpperCase() + course.course_level.slice(1)
      : 'Course'
  }

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch('/api/progress')
      if (!response.ok) {
        setIsLoading(false)
        return
      }
      const data = await response.json()
      const progressData = (data.courses || []) as CourseProgress[]
      const assessmentData = (data.assessments || []) as AssessmentResult[]
      const gamificationData = (data.gamification ?? null) as GamificationStats | null

      const getStoredIds = (key: string) => {
        try {
          const raw = localStorage.getItem(key)
          return raw ? (JSON.parse(raw) as string[]) : []
        } catch {
          return []
        }
      }

      const countValidLessons = (ids: string[], prefix: string) =>
        ids.filter((id) => typeof id === 'string' && id.startsWith(prefix)).length

      const associateCompleted = countValidLessons(
        getStoredIds(SAA_COMPLETION_STORAGE_KEY),
        ASSOCIATE_LESSON_ID_PREFIX,
      )
      const practitionerCompleted = countValidLessons(
        getStoredIds(PRACTITIONER_COMPLETION_STORAGE_KEY),
        PRACTITIONER_LESSON_ID_PREFIX,
      )
      const professionalCompleted = countValidLessons(
        getStoredIds(PROFESSIONAL_COMPLETION_STORAGE_KEY),
        PROFESSIONAL_LESSON_ID_PREFIX,
      )

      const normalizedProgressData = progressData.map((course) => {
        const title = course.course_title.toLowerCase()
        const isAssociate =
          title.includes('solutions architect') && title.includes('associate')
        const isPractitioner = title.includes('cloud practitioner')
        const isProfessional = title.includes('solutions architect') && title.includes('professional')

        if (!isAssociate && !isPractitioner && !isProfessional) return course

        const liveCompleted = isAssociate
          ? associateCompleted
          : isPractitioner
            ? practitionerCompleted
            : professionalCompleted
        const liveTotal = Math.max(course.total_lessons || 0, TRACK_TOTAL_LESSONS)
        const livePercentage = liveTotal > 0 ? Math.round((liveCompleted / liveTotal) * 100) : 0

        return {
          ...course,
          lessons_completed: liveCompleted,
          total_lessons: liveTotal,
          progress_percentage: livePercentage,
        }
      })

      const totalLessons =
        normalizedProgressData?.reduce((sum, p) => sum + (p.lessons_completed || 0), 0) || 0
      const avgScore = assessmentData?.length
        ? Math.round(assessmentData.reduce((sum, a) => sum + a.score, 0) / assessmentData.length)
        : 0

      setStats({
        courses: normalizedProgressData,
        assessments: assessmentData,
        gamification: gamificationData,
        totalLessonsCompleted: totalLessons,
        averageScore: avgScore,
      })

      const raw = localStorage.getItem(MOCK_ATTEMPTS_STORAGE_KEY)
      const store = raw ? (JSON.parse(raw) as MockAttemptsStore) : {}
      const mockScoreRows = Array.from({ length: 5 }).map((_, idx) => {
        const testNumber = idx + 1
        const testId = `mock-${testNumber}`
        const attempts = store[testId] ?? []
        const latest = attempts.length > 0 ? attempts[attempts.length - 1] : null
        return {
          name: `M${testNumber}`,
          fullName: `Mock Test ${testNumber}`,
          score: latest?.percentage ?? null,
          sectorStats: latest?.sectorStats,
        }
      })
      setLatestMockScores(
        mockScoreRows.map((row) => ({
          name: row.name,
          fullName: row.fullName,
          score: row.score,
        })),
      )

      const attemptedScores = mockScoreRows
        .map((row) => row.score)
        .filter((score): score is number => typeof score === 'number')
      const averageMockScore = attemptedScores.length
        ? Math.round(attemptedScores.reduce((sum, score) => sum + score, 0) / attemptedScores.length)
        : 0
      const averageCourseProgress = normalizedProgressData.length
        ? Math.round(
            normalizedProgressData.reduce((sum, course) => sum + (course.progress_percentage || 0), 0) /
              normalizedProgressData.length,
          )
        : 0
      setReadinessPercentage(Math.round((averageCourseProgress * 0.6) + (averageMockScore * 0.4)))

      const sectorAggregate: SectorStats = {}
      for (const row of mockScoreRows) {
        const sectorStats = row.sectorStats
        if (!sectorStats) continue
        for (const [sector, values] of Object.entries(sectorStats)) {
          const existing = sectorAggregate[sector] ?? { correct: 0, total: 0 }
          sectorAggregate[sector] = {
            correct: existing.correct + values.correct,
            total: existing.total + values.total,
          }
        }
      }

      const weak = Object.entries(sectorAggregate)
        .map(([sector, values]) => ({
          sector,
          pct: values.total > 0 ? Math.round((values.correct / values.total) * 100) : 0,
        }))
        .sort((a, b) => a.pct - b.pct)
        .slice(0, 3)
        .map((item) => item.sector)
      setWeakSectors(weak)

      setIsLoading(false)
    }

    fetchStats()
  }, [])

  // Prepare chart data
  const courseProgressData = stats.courses.map((course) => ({
    name: getCourseShortLabel(course),
    fullName: course.course_title,
    progress: course.lessons_completed || 0,
  }))

  const assessmentScoresData = latestMockScores.map((mock) => ({
    name: mock.name,
    fullName: mock.fullName,
    score: mock.score ?? 0,
    isNA: mock.score === null,
    scoreLabel: mock.score === null ? 'NA' : `${mock.score}%`,
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
              Completed lessons across enrolled courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courseProgressData.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No course data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={courseProgressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="progress" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4 space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">AI readiness for exam: </span>
                <span className="font-semibold">{readinessPercentage}%</span>
              </p>
              <p>
                <span className="text-muted-foreground">Weak sectors: </span>
                <span className="font-semibold">
                  {weakSectors.length > 0 ? weakSectors.join(', ') : 'NA'}
                </span>
              </p>
            </div>
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
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={assessmentScoresData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar
                    dataKey="score"
                  >
                    {assessmentScoresData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.isNA ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {assessmentScoresData.map((item) => (
                <p key={`${item.name}-label`}>
                  {item.fullName}: <span className="font-medium text-foreground">{item.scoreLabel}</span>
                </p>
              ))}
            </div>
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
