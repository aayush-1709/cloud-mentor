'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, BookOpen, Clock, Award } from 'lucide-react'
import type { Course, Lesson } from '@/lib/types/database'
import Link from 'next/link'
import { IAMModuleViewer } from '@/components/iam-module-viewer'

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    const fetchCourseData = async () => {
      const supabase = createClient()

      // Fetch course
      const { data: courseData } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

      if (courseData) {
        setCourse(courseData as Course)

        // Fetch lessons
        const { data: lessonsData } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order', { ascending: true })

        if (lessonsData) {
          setLessons(lessonsData as Lesson[])
        }

        // Check if user is enrolled
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .single()

          setIsEnrolled(!!progressData)
        }
      }

      setIsLoading(false)
    }

    fetchCourseData()
  }, [courseId])

  const handleEnroll = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('user_progress').insert({
      user_id: user.id,
      course_id: courseId,
      lessons_completed: 0,
      total_lessons: course?.total_lessons || 0,
      progress_percentage: 0,
    })

    if (!error) {
      setIsEnrolled(true)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Course not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{course.total_lessons} lessons</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-secondary" />
                <span>{course.estimated_duration_hours} hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-accent" />
                <span className="capitalize">{course.level} level</span>
              </div>
            </div>
          </div>
          {!isEnrolled && (
            <Button onClick={handleEnroll} size="lg">
              Enroll Now
            </Button>
          )}
        </div>
      </div>

      {/* Course Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{course.category}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{course.estimated_duration_hours} hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {isEnrolled ? 'Enrolled' : 'Not Enrolled'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* IAM Module Section - Special Display for Cloud Practitioner */}
      {course.title === 'AWS Certified Cloud Practitioner' && (
        <div>
          <IAMModuleViewer courseId={courseId} />
        </div>
      )}

      {/* Lessons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Course Lessons</CardTitle>
          <CardDescription>
            Complete lessons to master this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No lessons available yet
            </p>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          {lesson.order}
                        </span>
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {lesson.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 ml-8">
                        {lesson.content?.substring(0, 100)}...
                      </p>
                    </div>
                    {isEnrolled && (
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Link href={`/dashboard/courses/${courseId}/lessons/${lesson.id}`}>
                          Learn
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
