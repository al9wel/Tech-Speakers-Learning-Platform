export type SuggestionCategory = 'عام' | 'تحسين دراسي' | 'مشكلة تقنية' | 'فعاليات وأنشطة'

export type SuggestionStatus = 'pending' | 'reviewed' | 'resolved'

export interface SuggestionAuthor {
  id: string
  full_name: string | null
  role: string
}

export interface SuggestionItem {
  id: string
  user_id: string
  title: string
  content: string
  category: string
  status: SuggestionStatus
  admin_reply?: string | null
  created_at: string
  updated_at: string
  author?: SuggestionAuthor | null
}

export interface CreateSuggestionInput {
  title: string
  content: string
  category?: string
}

export interface SuggestionActionResult {
  success: boolean
  message?: string
  suggestion?: SuggestionItem
}
