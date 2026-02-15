'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import type { Lesson, Course } from '@/lib/types/database'
import Link from 'next/link'

export default function LessonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkedComplete, setIsMarkedComplete] = useState(false)
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)

  useEffect(() => {
    const fetchLessonData = async () => {
      const supabase = createClient()

      // Fetch course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseData) {
        setCourse(courseData as Course)

        // Fetch all lessons
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order', { ascending: true })

        if (lessonsData) {
          setLessons(lessonsData as Lesson[])

          // Fetch current lesson
          const currentLesson = lessonsData.find((l) => l.id === lessonId)
          if (currentLesson) {
            setLesson(currentLesson as Lesson)
            setCurrentLessonIndex(lessonsData.findIndex((l) => l.id === lessonId))
          }
        }
      }

      setIsLoading(false)
    }

    fetchLessonData()
  }, [courseId, lessonId])

  const handleMarkComplete = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Get current progress
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single()

    if (progressData) {
      const completedCount = isMarkedComplete
        ? (progressData.lessons_completed || 1) - 1
        : (progressData.lessons_completed || 0) + 1

      const progressPercentage = Math.round(
        (completedCount / (progressData.total_lessons || 1)) * 100
      )

      const { error } = await supabase
        .from('user_progress')
        .update({
          lessons_completed: completedCount,
          progress_percentage: progressPercentage,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('course_id', courseId)

      if (!error) {
        setIsMarkedComplete(!isMarkedComplete)
      }
    }
  }

  const goToNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      const nextLesson = lessons[currentLessonIndex + 1]
      router.push(
        `/dashboard/courses/${courseId}/lessons/${nextLesson.id}`
      )
    }
  }

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = lessons[currentLessonIndex - 1]
      router.push(
        `/dashboard/courses/${courseId}/lessons/${prevLesson.id}`
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!lesson || !course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lesson not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {course.title}
        </Link>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <p className="text-muted-foreground">
          Lesson {currentLessonIndex + 1} of {lessons.length}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{
            width: `${((currentLessonIndex + 1) / lessons.length) * 100}%`,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lesson Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lesson.video_url && (
                <div className="rounded-lg bg-muted aspect-video flex items-center justify-center">
                  <p className="text-muted-foreground">Video player would go here</p>
                </div>
              )}

              <div className="prose prose-sm max-w-none space-y-4">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {lesson.content}
                </p>
              </div>

              {lesson.resources && lesson.resources.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold">Resources</h4>
                  <ul className="space-y-2">
                    {lesson.resources.map((resource, idx) => (
                      <li key={idx} className="text-sm text-primary hover:underline cursor-pointer">
                        📎 {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-t pt-4">
                <Button
                  onClick={handleMarkComplete}
                  variant={isMarkedComplete ? 'outline' : 'default'}
                  className="gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isMarkedComplete ? 'Lesson Complete' : 'Mark as Complete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Lessons List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lessons</CardTitle>
              <CardDescription>
                {currentLessonIndex + 1} of {lessons.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lessons.map((l, idx) => (
                  <Link
                    key={l.id}
                    href={`/dashboard/courses/${courseId}/lessons/${l.id}`}
                    className={`block p-2 rounded-lg transition-colors ${
                      l.id === lessonId
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <p className="text-sm font-medium">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-current opacity-30 text-current mr-2 text-xs">
                        {idx + 1}
                      </span>
                      {l.title}
                    </p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={goToPreviousLesson}
          disabled={currentLessonIndex === 0}
          variant="outline"
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          onClick={goToNextLesson}
          disabled={currentLessonIndex === lessons.length - 1}
          className="gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
