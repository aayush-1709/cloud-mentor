'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Phone,
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Clock,
  Users,
  MessageCircle,
  Settings,
  Loader2,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'

interface MentorSession {
  id: string
  mentorName: string
  mentorAvatar: string
  expertise: string[]
  isAvailable: boolean
  sessionDuration: number
  rating: number
  reviewCount: number
}

export default function LiveMentorPage() {
  const [sessions, setSessions] = useState<MentorSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<MentorSession | null>(null)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Sample mentor data
  const sampleMentors: MentorSession[] = [
    {
      id: '1',
      mentorName: 'Dr. Sarah Chen',
      mentorAvatar: '👩‍💼',
      expertise: ['AWS Architecture', 'Security', 'Cost Optimization'],
      isAvailable: true,
      sessionDuration: 45,
      rating: 4.9,
      reviewCount: 287,
    },
    {
      id: '2',
      mentorName: 'James Mitchell',
      mentorAvatar: '👨‍💻',
      expertise: ['DevOps', 'Lambda', 'Serverless'],
      isAvailable: true,
      sessionDuration: 30,
      rating: 4.8,
      reviewCount: 156,
    },
    {
      id: '3',
      mentorName: 'Priya Patel',
      mentorAvatar: '👩‍🔬',
      expertise: ['Machine Learning', 'SageMaker', 'Data Analytics'],
      isAvailable: false,
      sessionDuration: 60,
      rating: 5.0,
      reviewCount: 423,
    },
    {
      id: '4',
      mentorName: 'Alex Rodriguez',
      mentorAvatar: '👨‍🎓',
      expertise: ['Cloud Practitioner', 'IAM', 'Networking'],
      isAvailable: true,
      sessionDuration: 40,
      rating: 4.7,
      reviewCount: 198,
    },
  ]

  useEffect(() => {
    // Simulate loading mentors
    setIsLoading(true)
    setTimeout(() => {
      setSessions(sampleMentors)
      setIsLoading(false)
    }, 800)
  }, [])

  // Timer for active session
  useEffect(() => {
    if (activeSession && isConnecting === false) {
      timerRef.current = setInterval(() => {
        setSessionTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeSession, isConnecting])

  const startSession = async (mentor: MentorSession) => {
    setIsConnecting(true)

    // Simulate connection
    setTimeout(() => {
      setActiveSession(mentor)
      setSessionTime(0)
      setIsConnecting(false)
    }, 2000)
  }

  const endSession = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setActiveSession(null)
    setSessionTime(0)
    setIsMicOn(true)
    setIsVideoOn(true)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (isConnecting && activeSession) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center space-y-6 pt-8">
            <div className="text-5xl">{activeSession.mentorAvatar}</div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{activeSession.mentorName}</h3>
              <p className="text-sm text-muted-foreground">Connecting...</p>
            </div>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground text-center">
              Setting up your live mentoring session
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activeSession) {
    return (
      <div className="space-y-6">
        {/* Video Call Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-black rounded-lg overflow-hidden">
              <CardContent className="p-0 relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <div className="text-center">
                      <div className="text-6xl mb-4">{activeSession.mentorAvatar}</div>
                      <p className="text-white font-medium">{activeSession.mentorName}</p>
                    </div>
                  </div>
                )}

                {/* Session Timer */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm font-mono flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatTime(sessionTime)}
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              <Button
                size="lg"
                variant={isMicOn ? 'default' : 'destructive'}
                onClick={() => setIsMicOn(!isMicOn)}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              <Button
                size="lg"
                variant={isVideoOn ? 'default' : 'destructive'}
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              <Button
                size="lg"
                variant="destructive"
                onClick={endSession}
              >
                <PhoneOff className="w-5 h-5" />
                End Session
              </Button>
            </div>
          </div>

          {/* Chat & Info Sidebar */}
          <div className="space-y-4">
            {/* Mentor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-3xl">{activeSession.mentorAvatar}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold">{activeSession.mentorName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.floor(activeSession.rating) }).map((_, i) => (
                        <span key={i} className="text-yellow-500">★</span>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {activeSession.rating} ({activeSession.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-1">
                    {activeSession.expertise.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm font-medium">Session Info</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Live mentoring session
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="text-xs text-muted-foreground italic">
                    Session started. Use chat to ask questions.
                  </div>
                </div>
                <Input placeholder="Type a message..." className="text-sm" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Live Mentor Sessions</h1>
        <p className="text-muted-foreground mt-2">
          Connect with AWS experts for real-time guidance and Q&A sessions
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available Mentors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {sessions.filter((s) => s.isAvailable).length}/{sessions.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {Math.round(sessions.reduce((sum, s) => sum + s.sessionDuration, 0) / sessions.length)}
                  m
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {(sessions.reduce((sum, s) => sum + s.rating, 0) / sessions.length).toFixed(1)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="text-4xl mb-2">{mentor.mentorAvatar}</div>
                      <CardTitle>{mentor.mentorName}</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.floor(mentor.rating) }).map((_, i) => (
                            <span key={i} className="text-yellow-500 text-sm">★</span>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {mentor.rating} ({mentor.reviewCount})
                        </span>
                      </div>
                    </div>
                    <Badge variant={mentor.isAvailable ? 'default' : 'secondary'}>
                      {mentor.isAvailable ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Expertise Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>~{mentor.sessionDuration} min sessions</span>
                  </div>

                  <Button
                    onClick={() => startSession(mentor)}
                    disabled={!mentor.isAvailable}
                    className="w-full"
                  >
                    {mentor.isAvailable ? (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        Start Session
                      </>
                    ) : (
                      'Currently Unavailable'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
