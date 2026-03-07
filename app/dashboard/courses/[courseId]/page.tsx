'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, BookOpen, Clock, Award } from 'lucide-react'
import type { Course, Lesson } from '@/lib/types/database'
import Link from 'next/link'
import { SAARoadmapViewer } from '@/components/saa-roadmap-viewer'

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    const fetchCourseData = async () => {
      const response = await fetch(`/api/courses/${courseId}`)
      if (!response.ok) {
        setIsLoading(false)
        return
      }
      const data = await response.json()
      setCourse(data.course as Course)
      setLessons((data.lessons || []) as Lesson[])
      setIsEnrolled(Boolean(data.isEnrolled))
      setIsLoading(false)
    }

    fetchCourseData()
  }, [courseId])

  const handleEnroll = async () => {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    })

    if (response.ok) {
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

  const isSaaAssociateCourse = course.title
    .toLowerCase()
    .includes('solutions architect - associate')
  const isCloudPractitionerCourse = course.title
    .toLowerCase()
    .includes('cloud practitioner')
  const isSaaProfessionalCourse = course.title
    .toLowerCase()
    .includes('solutions architect - professional')

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

      {/* Certification roadmap view with sections, quizzes, progress, and AI analysis */}
      {isSaaAssociateCourse || isCloudPractitionerCourse || isSaaProfessionalCourse ? (
        <SAARoadmapViewer
          track={
            isSaaProfessionalCourse
              ? 'professional'
              : isCloudPractitionerCourse
                ? 'practitioner'
                : 'associate'
          }
        />
      ) : (
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
                            {lesson.order_index}
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
      )}
    </div>
  )
}
