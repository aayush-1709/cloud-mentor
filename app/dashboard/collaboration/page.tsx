'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Users, Plus, Mail, Copy, Check, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { CollaborationRoom } from '@/lib/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function CollaborationPage() {
  const [rooms, setRooms] = useState<CollaborationRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<CollaborationRoom | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [createError, setCreateError] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/collaboration/rooms')
      if (!response.ok) {
        setRooms([])
      } else {
        const data = await response.json()
        setRooms((data.rooms || []) as CollaborationRoom[])
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      setRooms([])
    }
    setIsLoading(false)
  }

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      setCreateError('Please enter a study group name')
      return
    }

    setIsCreating(true)
    setCreateError('')

    try {
      const response = await fetch('/api/collaboration/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newRoomName,
          topic: 'AWS Study Group',
        }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        setCreateError(errorData.error || 'Failed to create study group')
        return
      }
      setNewRoomName('')
      setShowCreateDialog(false)
      setCreateError('')
      await fetchRooms()
    } catch (error) {
      console.error('Error in handleCreateRoom:', error)
      setCreateError('An unexpected error occurred. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim() || !selectedRoom) return
    const response = await fetch(`/api/collaboration/rooms/${selectedRoom.id}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail }),
    })
    if (response.ok) {
      setInviteEmail('')
      await fetchRooms()
    }
  }

  const copyInviteLink = (roomId: string) => {
    const link = `${window.location.origin}/dashboard/collaboration/join/${roomId}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collaboration</h1>
          <p className="text-muted-foreground mt-2">
            Connect with other learners and collaborate on projects
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Study Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Study Group</DialogTitle>
              <DialogDescription>
                Start a collaborative learning space for you and others
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Study group name (e.g., AWS Solutions Architect Path)"
                value={newRoomName}
                onChange={(e) => {
                  setNewRoomName(e.target.value)
                  setCreateError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateRoom()
                  }
                }}
              />
              {createError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-sm text-destructive">{createError}</p>
                </div>
              )}
              <Button onClick={handleCreateRoom} disabled={isCreating || !newRoomName.trim()} className="w-full">
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Study Group'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : rooms.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Study Groups
            </CardTitle>
            <CardDescription>
              Join or create collaborative learning spaces
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No study groups yet. Create one to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {room.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {room.topic}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Room Status</p>
                    <p className="text-2xl font-bold text-primary">
                      {room.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>

                  <Dialog open={showInviteDialog && selectedRoom?.id === room.id} onOpenChange={(open) => {
                    setShowInviteDialog(open)
                    if (open) setSelectedRoom(room)
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full gap-2">
                        <Mail className="w-4 h-4" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite to {room.title}</DialogTitle>
                        <DialogDescription>
                          Invite friends by email or share the link
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Enter email address"
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Button onClick={handleInviteByEmail} className="w-full">
                          Send Invite
                        </Button>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              Or share link
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => copyInviteLink(room.id)}
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Link Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Invite Link
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="secondary" className="w-full">
                    Join Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
