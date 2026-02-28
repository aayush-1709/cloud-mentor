import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required')
}

const globalForDb = globalThis as unknown as {
  cloudMentorPool?: Pool
}

export const db =
  globalForDb.cloudMentorPool ??
  new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.cloudMentorPool = db
}

export async function query<T = unknown>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await db.query<T>(text, params)
  return result.rows
}
