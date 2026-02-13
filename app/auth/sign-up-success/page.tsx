'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Account Created!
              </CardTitle>
              <CardDescription>What happens next?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Email Confirmation</p>
                  <p className="text-xs text-blue-700 mt-1">
                    We sent a confirmation email to your inbox. Click the link in the email to verify your account.
                  </p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Didn&apos;t receive an email?</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Check your spam folder or contact support. If email confirmation is disabled in your Supabase project, you can login directly.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Ready to login?</p>
                  <p className="text-xs text-green-700 mt-1">
                    After confirming your email, you can log in with your credentials.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
