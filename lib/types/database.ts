export interface User {
  id: string
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  instructor_id: string
  created_at: string
  updated_at: string
  total_lessons: number
  estimated_duration_hours: number
  is_published: boolean
}

export interface Lesson {
  id: string
  course_id: string
  title: string
  content: string
  order_index: number
  estimated_duration: number
  objectives?: string[]
  video_url?: string
  resources?: string[]
  parent_lesson_id?: string | null
  created_at: string
  updated_at: string
}

export interface Assessment {
  id: string
  course_id: string
  title: string
  description: string
  passing_score: number
  time_limit_minutes?: number
  created_at: string
  updated_at: string
}

export interface QuizQuestion {
  id: string
  assessment_id: string
  question_text: string
  question_type: 'multiple_choice' | 'short_answer' | 'code'
  order_index: number
  created_at: string
}

export interface QuizOption {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
  order_index: number
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  lessons_completed: number
  total_lessons: number
  progress_percentage: number
  status?: 'not_started' | 'in_progress' | 'completed'
  completed_lesson_ids?: string[]
  created_at: string
  updated_at: string
}

export interface AssessmentResult {
  id: string
  user_id: string
  assessment_id: string
  score: number
  total_points: number
  passed: boolean
  completed_at: string
  time_spent_minutes: number
}

export interface GamificationStats {
  id: string
  user_id: string
  total_points: number
  total_badges: number
  current_streak: number
  level: number
  created_at: string
  updated_at: string
}

export interface AISession {
  id: string
  user_id: string
  course_id?: string
  conversation: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  topic: string
  created_at: string
  updated_at: string
}

export interface CollaborationRoom {
  id: string
  title: string
  topic: string
  created_by: string
  max_participants: number
  members?: Array<{ user_id: string; joined_at: string; email?: string }>
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'course_update' | 'assessment_result' | 'achievement' | 'message'
  is_read: boolean
  created_at: string
  related_id?: string
}
