import { createClient } from './server'
import type {
  User,
  Course,
  Lesson,
  Assessment,
  UserProgress,
  AssessmentResult,
  GamificationStats,
} from '@/lib/types/database'

// User functions
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data as User
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user:', error)
    return null
  }

  return data as User
}

// Course functions
export async function getCourses(filters?: {
  level?: string
  category?: string
  isPublished?: boolean
}): Promise<Course[]> {
  const supabase = await createClient()
  let query = supabase.from('courses').select('*')

  if (filters?.level) {
    query = query.eq('level', filters.level)
  }
  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.isPublished !== undefined) {
    query = query.eq('is_published', filters.isPublished)
  }

  const { data, error } = await query.order('created_at', {
    ascending: false,
  })

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }

  return (data || []) as Course[]
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (error) {
    console.error('Error fetching course:', error)
    return null
  }

  return data as Course
}

export async function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching lessons:', error)
    return []
  }

  return (data || []) as Lesson[]
}

// Progress functions
export async function getUserProgress(
  userId: string,
  courseId: string
): Promise<UserProgress | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (error) {
    console.error('Error fetching user progress:', error)
    return null
  }

  return data as UserProgress
}

export async function getAllUserProgress(userId: string): Promise<UserProgress[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching user progress:', error)
    return []
  }

  return (data || []) as UserProgress[]
}

export async function updateUserProgress(
  userId: string,
  courseId: string,
  updates: Partial<UserProgress>
): Promise<UserProgress | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_progress')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user progress:', error)
    return null
  }

  return data as UserProgress
}

// Assessment functions
export async function getAssessmentsByCourse(
  courseId: string
): Promise<Assessment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching assessments:', error)
    return []
  }

  return (data || []) as Assessment[]
}

export async function getUserAssessmentResults(
  userId: string
): Promise<AssessmentResult[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('assessment_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Error fetching assessment results:', error)
    return []
  }

  return (data || []) as AssessmentResult[]
}

// Gamification functions
export async function getGamificationStats(
  userId: string
): Promise<GamificationStats | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gamification_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching gamification stats:', error)
    return null
  }

  return data as GamificationStats
}

export async function updateGamificationStats(
  userId: string,
  updates: Partial<GamificationStats>
): Promise<GamificationStats | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gamification_stats')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating gamification stats:', error)
    return null
  }

  return data as GamificationStats
}
