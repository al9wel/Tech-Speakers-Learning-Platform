export interface AiChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface LessonContentPayload {
  lessonId: string
  lessonTitle: string
  subjectName?: string
  lessonIntro?: string | null
  sections: Array<{
    id: string
    title: string
    content: string
    sort_order?: number
    pdf_path?: string | null
  }>
}

export type AiAssistantMode = 'chat' | 'summary' | 'quiz'

export interface AiAssistantRequest extends LessonContentPayload {
  mode: AiAssistantMode
  messages?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface AiAssistantResponse {
  success: boolean
  mode: AiAssistantMode
  reply?: string
  summary?: string
  quiz?: QuizQuestion[]
  error?: string
}
