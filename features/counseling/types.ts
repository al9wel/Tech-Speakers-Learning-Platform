export type CounselingStatus = 'pending' | 'answered' | 'closed'

export interface CounselingProfile {
  id: string
  full_name: string | null
  role: string
}

export interface CounselingReplyItem {
  id: string
  message_id: string
  sender_id: string
  content: string
  created_at: string
  author?: CounselingProfile | null
}

export interface CounselingMessageItem {
  id: string
  student_id: string
  counselor_id: string
  sender_id: string
  title: string
  content: string
  response?: string | null
  response_at?: string | null
  responder_id?: string | null
  status: CounselingStatus
  created_at: string
  updated_at: string
  student?: CounselingProfile | null
  counselor?: CounselingProfile | null
  sender?: CounselingProfile | null
  responder?: CounselingProfile | null
  replies?: CounselingReplyItem[]
}

export interface CreateCounselingMessageInput {
  title: string
  content: string
  counselor_id?: string
  student_id?: string
}

export interface ReplyCounselingMessageInput {
  message_id: string
  content: string
}

export interface CounselingActionResult {
  success: boolean
  message?: string
  item?: CounselingMessageItem
  reply?: CounselingReplyItem
}
