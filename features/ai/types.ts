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

export interface CopilotMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: number
}

export interface CopilotRequest {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  currentPath?: string
}

export interface CopilotResponse {
  success: boolean
  reply?: string
  error?: string
}

export interface StudentLearningInsightsData {
  focusRecommendation: {
    subject: string
    reason: string
  }
  studyStrategy: string
  dailyChallenge: string
}

export interface StudentInsightsResponse {
  success: boolean
  insights?: StudentLearningInsightsData
  error?: string
}

