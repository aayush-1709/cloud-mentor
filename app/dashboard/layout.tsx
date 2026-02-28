'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { DEMO_USER_EMAIL } from '@/lib/demo-user'
import {
  BookOpen,
  BarChart3,
  Settings,
  Menu,
  X,
  Award,
  Users,
  Sparkles,
  Home,
  Moon,
  Sun,
} from 'lucide-react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Courses',
    href: '/dashboard/courses',
    icon: BookOpen,
  },
  {
    label: 'Assessments',
    href: '/dashboard/assessments',
    icon: BarChart3,
  },
  {
    label: 'Progress',
    href: '/dashboard/progress',
    icon: Award,
  },
  {
    label: 'AI Mentor',
    href: '/dashboard/mentor',
    icon: Sparkles,
  },
  {
    label: 'Collaboration',
    href: '/dashboard/collaboration',
    icon: Users,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="h-screen overflow-hidden bg-background">
      {isSidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card shadow-lg transition-transform duration-200 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 flex flex-col`}
      >
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary">CloudMentor</h1>
          <p className="text-xs text-muted-foreground mt-1">AWS Mastery Platform</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              // For dashboard home, check exact match. For others, check if pathname starts with href (ignoring trailing slash issues)
              const isActive = item.href === '/dashboard' 
                ? pathname === item.href
                : pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mt-auto p-4 border-t border-border space-y-3">
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm font-medium">
              {DEMO_USER_EMAIL}
            </p>
          </div>
          {isMounted && (
            <Button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  Dark Mode
                </>
              )}
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-0 h-screen overflow-y-auto lg:ml-64">
        <div className="flex min-h-screen flex-col">
        {/* Top Bar */}
        <header className="border-b border-border bg-card sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              variant="ghost"
              size="icon"
              className="lg:hidden"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            <div className="flex-1 flex items-center justify-center lg:justify-start">
              <h2 className="text-lg font-semibold text-foreground">
                Welcome to CloudMentor AI
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {DEMO_USER_EMAIL}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
        </div>
      </div>
    </div>
  )
}
