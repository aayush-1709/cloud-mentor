'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Minimize2, Maximize2, X, MonitorUp } from 'lucide-react'

export type RoadmapLesson = {
  id: string
  title: string
  youtubeId: string
}

type VideoSidebarProps = {
  lesson: RoadmapLesson | null
  isOpen: boolean
  isMinimized: boolean
  onClose: () => void
  onToggleMinimize: () => void
}

export function VideoSidebar({
  lesson,
  isOpen,
  isMinimized,
  onClose,
  onToggleMinimize,
}: VideoSidebarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleFullscreen = async () => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    await containerRef.current.requestFullscreen()
  }

  const embedUrl = lesson
    ? `https://www.youtube.com/embed/${lesson.youtubeId}?autoplay=1&rel=0&modestbranding=1`
    : null

  return (
    <aside
      className={`fixed right-0 top-0 z-50 h-screen w-full max-w-xl border-l border-border bg-background/95 backdrop-blur transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div ref={containerRef} className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Now Playing</p>
            <p className="text-sm font-semibold">{lesson ? lesson.title : 'No lesson selected'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={onToggleMinimize} title="Minimize">
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={handleFullscreen} title="Fullscreen">
              <MonitorUp className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose} title="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isMinimized ? (
          <div className="p-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Player Minimized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click maximize to continue watching this lesson.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : lesson && embedUrl ? (
          <div className="p-4">
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
              <iframe
                title={lesson.title}
                src={embedUrl}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="p-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">No Video Selected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Select a lesson from the roadmap to start learning.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </aside>
  )
}
