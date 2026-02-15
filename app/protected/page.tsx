'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Page() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      setUser(user)
      setIsLoading(false)
    }

    getUser()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex items-center justify-between border-b bg-background px-6 py-4">
        <h1 className="text-2xl font-bold">CloudMentor AI Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Welcome back!</h2>
          <p className="text-muted-foreground">
            {user?.email}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-4 text-lg font-semibold">Getting Started</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Welcome to CloudMentor AI. Start your AWS learning journey today with our AI-powered courses and assessments.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">Browse Courses</h4>
              <p className="text-sm text-muted-foreground">Explore AWS courses tailored to your skill level</p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">Take Assessments</h4>
              <p className="text-sm text-muted-foreground">Test your knowledge and track your progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
