'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, BookOpen, Sparkles, Award } from 'lucide-react'
import { useState } from 'react'

export default function Page() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Get user's full name from metadata or email
        const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        setUserName(fullName)
        router.push('/dashboard')
      } else {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <main className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">CloudMentor AI</h1>
            <p className="text-xs text-muted-foreground">AWS Mastery Platform</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold text-foreground">
            Master AWS with AI-Powered Learning
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            CloudMentor AI combines intelligent course recommendations, real-time assessments, and personalized mentorship to accelerate your cloud learning journey.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Start Learning Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-bold">Why Choose CloudMentor AI?</h3>
            <p className="text-muted-foreground">Everything you need to master AWS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 border border-border">
              <BookOpen className="w-8 h-8 text-primary mb-4" />
              <h4 className="font-semibold mb-2">Structured Courses</h4>
              <p className="text-sm text-muted-foreground">
                Learn from beginner to advanced AWS topics with carefully curated courses
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <Award className="w-8 h-8 text-secondary mb-4" />
              <h4 className="font-semibold mb-2">Real Assessments</h4>
              <p className="text-sm text-muted-foreground">
                Test your knowledge with practical quizzes and track your progress
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 border border-border">
              <Sparkles className="w-8 h-8 text-accent mb-4" />
              <h4 className="font-semibold mb-2">AI Mentorship</h4>
              <p className="text-sm text-muted-foreground">
                Get instant help and personalized guidance from your AI mentor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h3 className="text-3xl font-bold">Ready to Transform Your AWS Skills?</h3>
          <p className="text-lg opacity-90">
            Join thousands of professionals learning and mastering AWS technologies
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/sign-up">Start Your Free Learning Journey</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-6 px-6 text-center text-sm text-muted-foreground">
        <p>© 2024 CloudMentor AI. All rights reserved.</p>
      </footer>
    </main>
  )
}
