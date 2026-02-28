'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ChevronDown, ChevronRight, PlayCircle } from 'lucide-react'
import { VideoSidebar, type RoadmapLesson } from '@/components/video-sidebar'

type RoadmapSection = {
  id: string
  order: number
  title: string
  lessons: RoadmapLesson[]
}

const STORAGE_KEY = 'cloudmentor-saa-completed'

const awsSaaRoadmap: RoadmapSection[] = [
  {
    id: 'cloud-foundations',
    order: 1,
    title: 'Cloud Foundations',
    lessons: [
      { id: 'cf-1', title: 'What is Cloud Computing', youtubeId: 'M988_fsOSWo' },
      { id: 'cf-2', title: 'AWS Global Infrastructure', youtubeId: 'Z3SYDTMP3ME' },
      { id: 'cf-3', title: 'Shared Responsibility Model', youtubeId: 'M1l7nX8pB4Q' },
      { id: 'cf-4', title: 'AWS Well-Architected Framework', youtubeId: 'Pp4N9Q8xwJU' },
      { id: 'cf-5', title: 'AWS Pricing & Support Plans', youtubeId: 'x5Y0w5JfQfI' },
    ],
  },
  {
    id: 'iam',
    order: 2,
    title: 'IAM',
    lessons: [
      { id: 'iam-1', title: 'IAM Users, Groups, Policies', youtubeId: 'ulprqHHWlng' },
      { id: 'iam-2', title: 'IAM Roles & Trust Policies', youtubeId: 'YQsK4MtsELU' },
      { id: 'iam-3', title: 'Permission Boundaries', youtubeId: 'lF5M_3qR9hI' },
      { id: 'iam-4', title: 'IAM Best Practices', youtubeId: '2z7R7l5fC7w' },
      { id: 'iam-5', title: 'AWS Organizations & SCP', youtubeId: 'nN4uRx5EJf4' },
    ],
  },
  {
    id: 'compute',
    order: 3,
    title: 'Compute',
    lessons: [
      { id: 'compute-1', title: 'EC2 Fundamentals', youtubeId: 'iHX_jtU2xL4' },
      { id: 'compute-2', title: 'EC2 Instance Types', youtubeId: 'vQ5JfM5T2b4' },
      { id: 'compute-3', title: 'AMIs & Snapshots', youtubeId: '6x7fJ6t5iN0' },
      { id: 'compute-4', title: 'Auto Scaling Groups', youtubeId: 'Yy2w8XQ5nO8' },
      { id: 'compute-5', title: 'Elastic Load Balancer', youtubeId: '8mR5fQ9Kj5M' },
      { id: 'compute-6', title: 'Placement Groups', youtubeId: 'rY9a0Q6cH0Q' },
    ],
  },
  {
    id: 'storage',
    order: 4,
    title: 'Storage',
    lessons: [
      { id: 'storage-1', title: 'S3 Deep Dive', youtubeId: '77lMCiiMilo' },
      { id: 'storage-2', title: 'S3 Storage Classes', youtubeId: 'Yb3D0kFJ8tI' },
      { id: 'storage-3', title: 'EBS Volumes', youtubeId: 'G5N5D5FfQmQ' },
      { id: 'storage-4', title: 'EFS vs FSx', youtubeId: '9N8T9Q3xS2o' },
      { id: 'storage-5', title: 'Backup & Lifecycle Policies', youtubeId: '9Q3mKjI6V3s' },
    ],
  },
  {
    id: 'networking',
    order: 5,
    title: 'Networking',
    lessons: [
      { id: 'net-1', title: 'VPC Basics', youtubeId: 'bGDMe0Jg6GY' },
      { id: 'net-2', title: 'Subnets (Public vs Private)', youtubeId: 'xM7S8vO8m9Q' },
      { id: 'net-3', title: 'Route Tables', youtubeId: 'W5kP8xjZgEI' },
      { id: 'net-4', title: 'Internet Gateway & NAT Gateway', youtubeId: 'mQ1Q3bQ7eYk' },
      { id: 'net-5', title: 'Security Groups vs NACL', youtubeId: 'aN1k4D2j0Js' },
      { id: 'net-6', title: 'VPC Peering', youtubeId: 'xjFfV3O2m6Y' },
      { id: 'net-7', title: 'Transit Gateway', youtubeId: 'D2mI7W3vN0k' },
    ],
  },
  {
    id: 'databases',
    order: 6,
    title: 'Databases',
    lessons: [
      { id: 'db-1', title: 'RDS Overview', youtubeId: 'P6x7wJ4QxwQ' },
      { id: 'db-2', title: 'Multi-AZ vs Read Replica', youtubeId: 'iN6Q7m4V0eU' },
      { id: 'db-3', title: 'Aurora', youtubeId: '9tN9oY3x5mQ' },
      { id: 'db-4', title: 'DynamoDB', youtubeId: 'HaEPXoXVf2k' },
      { id: 'db-5', title: 'ElastiCache', youtubeId: 'wN9Q3fL3sLQ' },
      { id: 'db-6', title: 'Database Migration Service', youtubeId: 'u7sP2mQ6N1U' },
    ],
  },
  {
    id: 'serverless',
    order: 7,
    title: 'Serverless',
    lessons: [
      { id: 'sv-1', title: 'Lambda', youtubeId: 'eOBq__h4OJ4' },
      { id: 'sv-2', title: 'API Gateway', youtubeId: 's6MKZqV_4VQ' },
      { id: 'sv-3', title: 'SQS', youtubeId: '3OeV0V6k2I8' },
      { id: 'sv-4', title: 'SNS', youtubeId: 'JtlR4xNf1kA' },
      { id: 'sv-5', title: 'EventBridge', youtubeId: 'A6f7kK8Qv9I' },
      { id: 'sv-6', title: 'Step Functions', youtubeId: 'TFO9nqRr8kM' },
    ],
  },
  {
    id: 'monitoring-security',
    order: 8,
    title: 'Monitoring & Security',
    lessons: [
      { id: 'ms-1', title: 'CloudWatch', youtubeId: '6Q9fS3wYxqE' },
      { id: 'ms-2', title: 'CloudTrail', youtubeId: 'hQ9w8Xb4U2o' },
      { id: 'ms-3', title: 'AWS Config', youtubeId: 'mQ4v7Nn2fIY' },
      { id: 'ms-4', title: 'KMS', youtubeId: 'A7yN4eF2lUo' },
      { id: 'ms-5', title: 'WAF', youtubeId: 'vN8Q3mI5sTo' },
      { id: 'ms-6', title: 'Shield', youtubeId: 'gQ6mN9eI4wA' },
    ],
  },
  {
    id: 'architecture-patterns',
    order: 9,
    title: 'Architecture Patterns',
    lessons: [
      { id: 'ap-1', title: 'Multi-AZ Architecture', youtubeId: 'V9qj0f5f7sY' },
      { id: 'ap-2', title: 'Multi-Region Architecture', youtubeId: 'S6hF9jM9N3k' },
      { id: 'ap-3', title: 'Fault Tolerance', youtubeId: 'qQ4x8bN6sY8' },
      { id: 'ap-4', title: 'Disaster Recovery (RTO / RPO)', youtubeId: 'C7mT8nJ2vP0' },
      { id: 'ap-5', title: 'Cost Optimization Patterns', youtubeId: 'zD6N4wQ8mLQ' },
    ],
  },
]

export function SAARoadmapViewer() {
  const sections = awsSaaRoadmap
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selectedLesson, setSelectedLesson] = useState<RoadmapLesson | null>(null)
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarMinimized, setSidebarMinimized] = useState(false)

  useEffect(() => {
    const initialExpanded = sections.reduce<Record<string, boolean>>((acc, section, index) => {
      acc[section.id] = index === 0
      return acc
    }, {})
    setExpanded(initialExpanded)

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setCompletedLessonIds(new Set(JSON.parse(stored) as string[]))
    }
  }, [sections])

  const allLessons = useMemo(() => sections.flatMap((section) => section.lessons), [sections])
  const totalLessons = allLessons.length
  const completedCount = allLessons.filter((lesson) => completedLessonIds.has(lesson.id)).length
  const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const sectionCompleteMap = useMemo(() => {
    return sections.reduce<Record<string, boolean>>((acc, section) => {
      acc[section.id] =
        section.lessons.length > 0 &&
        section.lessons.every((lesson) => completedLessonIds.has(lesson.id))
      return acc
    }, {})
  }, [sections, completedLessonIds])

  const shouldShiftContent = sidebarOpen && !sidebarMinimized

  return (
    <div
      className={`space-y-6 transition-[padding] duration-300 ${
        shouldShiftContent ? 'xl:pr-[36rem]' : 'xl:pr-0'
      }`}
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>AWS Certified Solutions Architect - Associate Roadmap</CardTitle>
          <CardDescription>{completedCount}/{totalLessons} lessons completed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{progressPercentage}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progressPercentage}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Lessons (Roadmap View)</CardTitle>
            <CardDescription>Section-wise progression with YouTube lessons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 h-full w-px bg-border" />
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="relative">
                    <div className="absolute -left-8 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-background">
                      {sectionCompleteMap[section.id] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-between px-2 py-2"
                      onClick={() => setExpanded((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
                    >
                      <span className="text-left font-semibold">
                        Section {section.order}: {section.title}
                      </span>
                      {expanded[section.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    {expanded[section.id] && (
                      <div className="space-y-2 pl-2 pt-2">
                        {section.lessons.map((lesson, index) => {
                          const isSelected = selectedLesson?.id === lesson.id
                          const isComplete = completedLessonIds.has(lesson.id)
                          return (
                            <div
                              key={lesson.id}
                              className={`flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                                isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
                              }`}
                            >
                              <button
                                className="flex flex-1 items-center gap-2 text-left"
                                onClick={() => {
                                  setSelectedLesson(lesson)
                                  setSidebarOpen(true)
                                  setSidebarMinimized(false)
                                }}
                              >
                                <PlayCircle className="h-4 w-4 text-primary" />
                                <span>
                                  {index + 1}. {lesson.title}
                                </span>
                                {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                              </button>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setCompletedLessonIds((prev) => {
                                      const next = new Set(prev)
                                      if (next.has(lesson.id)) {
                                        next.delete(lesson.id)
                                      } else {
                                        next.add(lesson.id)
                                      }
                                      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)))
                                      return next
                                    })
                                  }
                                >
                                  {isComplete ? 'Completed' : 'Mark Complete'}
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {!sidebarOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={() => setSidebarOpen(true)}
            className="shadow-lg"
            disabled={!selectedLesson}
          >
            {selectedLesson ? 'Open Player' : 'Select a lesson to play'}
          </Button>
        </div>
      )}

      <VideoSidebar
        lesson={selectedLesson}
        isOpen={sidebarOpen}
        isMinimized={sidebarMinimized}
        onClose={() => setSidebarOpen(false)}
        onToggleMinimize={() => setSidebarMinimized((prev) => !prev)}
      />
    </div>
  )
}
