export interface AnswerItem {
  id: string
  question_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  author?: {
    id: string
    full_name: string | null
    role: string
  }
}

export interface QuestionItem {
  id: string
  lesson_id: string
  created_by: string
  title: string
  content: string
  created_at: string
  updated_at: string
  lesson?: {
    id: string
    title: string
    subject?: {
      id: string
      name: string
    }
  }
  author?: {
    id: string
    full_name: string | null
    role: string
  }
  answers?: AnswerItem[]
  answersCount?: number
}

export interface CreateQuestionInput {
  lesson_id: string
  title: string
  content: string
}

export interface UpdateQuestionInput {
  id: string
  title: string
  content: string
}

export interface CreateAnswerInput {
  question_id: string
  content: string
}

export interface QuestionActionResult {
  success: boolean
  message: string
  data?: any
}
