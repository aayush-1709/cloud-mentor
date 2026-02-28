import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { DEMO_USER_ID } from '@/lib/demo-user'

export async function GET() {
  try {
    const rooms = await query<{
      id: string
      title: string
      topic: string
      created_by: string
      max_participants: number
      is_active: boolean
      members: Array<{ user_id: string; joined_at: string }>
      created_at: string
      updated_at: string
    }>('SELECT * FROM collaboration_rooms ORDER BY created_at DESC')

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('GET /api/collaboration/rooms failed:', error)
    return NextResponse.json({ error: 'Failed to load rooms' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { title?: string; topic?: string }
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const rows = await query<{
      id: string
      title: string
      topic: string
      created_by: string
      is_active: boolean
      members: Array<{ user_id: string; joined_at: string }>
    }>(
      `INSERT INTO collaboration_rooms (title, topic, created_by, is_active, members)
       VALUES ($1, $2, $3, true, $4::jsonb)
       RETURNING id, title, topic, created_by, is_active, members`,
      [
        body.title.trim(),
        body.topic ?? 'AWS Study Group',
        DEMO_USER_ID,
        JSON.stringify([{ user_id: DEMO_USER_ID, joined_at: new Date().toISOString() }]),
      ],
    )

    await query(
      `INSERT INTO collaboration_sessions (room_id, user_id, is_active)
       VALUES ($1, $2, true)`,
      [rows[0].id, DEMO_USER_ID],
    )

    return NextResponse.json({ room: rows[0] })
  } catch (error) {
    console.error('POST /api/collaboration/rooms failed:', error)
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}
