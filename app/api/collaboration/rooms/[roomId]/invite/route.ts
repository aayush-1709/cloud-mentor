import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

type Params = {
  params: Promise<{ roomId: string }>
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { roomId } = await params
    const body = (await request.json()) as { email?: string }
    const email = body.email?.trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    const roomRows = await query<{ members: Array<{ user_id: string; joined_at: string; email?: string }> }>(
      'SELECT members FROM collaboration_rooms WHERE id = $1 LIMIT 1',
      [roomId],
    )

    if (!roomRows[0]) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const currentMembers = roomRows[0].members ?? []
    const alreadyInvited = currentMembers.some((member) => member.email === email)
    if (!alreadyInvited) {
      currentMembers.push({
        user_id: `invite:${email}`,
        email,
        joined_at: new Date().toISOString(),
      })
    }

    await query('UPDATE collaboration_rooms SET members = $1::jsonb WHERE id = $2', [
      JSON.stringify(currentMembers),
      roomId,
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('POST invite failed:', error)
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 })
  }
}
