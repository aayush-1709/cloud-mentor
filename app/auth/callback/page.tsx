'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      // Exchange code for session
      const code = searchParams.get('code')
      
      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
      }

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Successfully authenticated, redirect to dashboard
        router.push('/dashboard')
      } else {
        // Auth failed, redirect to login
        router.push('/auth/login?error=auth_failed')
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    </div>
  )
}
