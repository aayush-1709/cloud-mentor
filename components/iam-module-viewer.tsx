'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Lock, BookOpen, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface SubModule {
  id: string
  title: string
  estimated_duration: number
  order_index: number
  objectives: string[]
  content: string
}

export function IAMModuleViewer({ courseId }: { courseId: string }) {
  const [mainModule, setMainModule] = useState<any>(null)
  const [subModules, setSubModules] = useState<SubModule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedModule, setExpandedModule] = useState<string | null>(null)

  useEffect(() => {
    const fetchIAMModule = async () => {
      const supabase = createClient()

      // Fetch the main IAM module
      const { data: mainData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .eq('title', 'AWS Identity and Access Management (IAM)')
        .single()

      if (mainData) {
        setMainModule(mainData)

        // Fetch all submodules for this main module
        const { data: subData } = await supabase
          .from('lessons')
          .select('*')
          .eq('parent_lesson_id', mainData.id)
          .order('order_index', { ascending: true })

        setSubModules((subData as SubModule[]) || [])
      }

      setIsLoading(false)
    }

    fetchIAMModule()
  }, [courseId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!mainModule) {
    return null
  }

  const totalDuration = (mainModule.estimated_duration || 0) + 
    subModules.reduce((sum, m) => sum + (m.estimated_duration || 0), 0)
  const totalHours = Math.ceil(totalDuration / 60)

  return (
    <div className="space-y-6">
      {/* Main IAM Module Card */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">{mainModule.title}</CardTitle>
              </div>
              <CardDescription className="text-base">
                {mainModule.content}
              </CardDescription>
            </div>
            <Badge variant="default" className="ml-4">
              {totalHours}h learning path
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Submodules</p>
              <p className="text-2xl font-bold text-primary">{subModules.length}</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <p className="text-2xl font-bold text-primary">{totalHours}h</p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Difficulty</p>
              <p className="text-2xl font-bold text-secondary">Beginner</p>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="bg-muted rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              What You'll Learn
            </h4>
            <ul className="space-y-2">
              {mainModule.objectives?.map((objective: string, idx: number) => (
                <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Submodules List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Submodules</h3>
        {subModules.map((subModule, index) => (
          <Card
            key={subModule.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setExpandedModule(expandedModule === subModule.id ? null : subModule.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{subModule.title}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {Math.ceil(subModule.estimated_duration / 60)} hour learning module
                    </CardDescription>
                  </div>
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    expandedModule === subModule.id ? 'rotate-90' : ''
                  }`}
                />
              </div>
            </CardHeader>

            {/* Expanded Content */}
            {expandedModule === subModule.id && (
              <CardContent className="space-y-4 border-t pt-4">
                <div className="text-sm text-foreground">
                  <p className="mb-4">{subModule.content}</p>

                  {subModule.objectives && subModule.objectives.length > 0 && (
                    <div className="bg-muted rounded-lg p-3 mb-4">
                      <p className="font-semibold text-sm mb-2">Learning Objectives:</p>
                      <ul className="space-y-1">
                        {subModule.objectives.map((obj: string, idx: number) => (
                          <li key={idx} className="text-xs text-foreground flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1"
                    >
                      <Link href={`#lesson-${subModule.id}`}>
                        Start Learning
                      </Link>
                    </Button>
                    <Badge variant="outline" className="py-2 px-3">
                      {Math.ceil(subModule.estimated_duration / 60)}h
                    </Badge>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Progress Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-semibold">0%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <Button className="w-full">
              Start IAM Module
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
