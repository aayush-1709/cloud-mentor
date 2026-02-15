'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { BookOpen, Loader2 } from 'lucide-react'
import type { Course } from '@/lib/types/database'

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [enrollingCourses, setEnrollingCourses] = useState<Set<string>>(new Set())
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<'all' | 'practitioner' | 'associate' | 'advanced'>('all')

  useEffect(() => {
    const fetchCourses = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      let query = supabase.from('courses').select('*')

      if (filter !== 'all') {
        query = query.eq('level', filter)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (!error && data) {
        // Fetch lesson duration for each course
        const coursesWithDuration = await Promise.all(
          (data as Course[]).map(async (course) => {
            const { data: lessonsData } = await supabase
              .from('lessons')
              .select('estimated_duration')
              .eq('course_id', course.id)

            const totalMinutes = lessonsData?.reduce((sum, lesson) => sum + (lesson.estimated_duration || 0), 0) || 0
            const totalHours = Math.ceil(totalMinutes / 60)
            const lessonCount = lessonsData?.length || 0

            return {
              ...course,
              lessonCount,
              estimatedHours: totalHours,
            }
          })
        )

        setCourses(coursesWithDuration)
      }

      // Fetch user's enrolled courses
      if (user) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('course_id')
          .eq('user_id', user.id)

        if (progressData) {
          setEnrolledCourses(new Set(progressData.map((p: any) => p.course_id)))
        }
      }

      setIsLoading(false)
    }

    fetchCourses()
  }, [filter])

  const handleEnroll = async (courseId: string) => {
    setEnrollingCourses(prev => new Set(prev).add(courseId))
    
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error('User not authenticated')
        return
      }

      // Create user progress record for this course
      const { error } = await supabase.from('user_progress').insert({
        user_id: user.id,
        course_id: courseId,
        status: 'in_progress',
        completion_percentage: 0,
      })

      if (!error) {
        setEnrolledCourses(prev => new Set(prev).add(courseId))
      } else {
        console.error('Enrollment error:', error)
      }
    } catch (error) {
      console.error('Error enrolling in course:', error)
    } finally {
      setEnrollingCourses(prev => {
        const updated = new Set(prev)
        updated.delete(courseId)
        return updated
      })
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'practitioner':
        return 'bg-green-100 text-green-800'
      case 'associate':
        return 'bg-blue-100 text-blue-800'
      case 'advanced':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AWS Certification Paths</h1>
        <p className="text-muted-foreground mt-2">
          Master AWS with certification-aligned courses and programs
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'practitioner', 'associate', 'advanced'] as const).map((level) => (
          <Button
            key={level}
            onClick={() => setFilter(level)}
            variant={filter === level ? 'default' : 'outline'}
            className="capitalize"
          >
            {level === 'all' ? 'All Paths' : level}
          </Button>
        ))}
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">No courses found for this filter</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                  <div className="text-xs text-muted-foreground text-right space-y-1">
                    <div>{(course as any).estimatedHours ? `${(course as any).estimatedHours} hours` : 'TBD'}</div>
                    <div>{(course as any).lessonCount ? `${(course as any).lessonCount} modules` : 'No modules'}</div>
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {enrolledCourses.has(course.id) ? (
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/courses/${course.id}`}>
                      Continue Learning
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingCourses.has(course.id)}
                      className="w-full"
                    >
                      {enrollingCourses.has(course.id) ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/dashboard/courses/${course.id}`}>
                        Preview Course
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
