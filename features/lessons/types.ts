export interface LessonSectionItem {
  id: string
  lesson_id: string
  title: string
  content: string
  image_path: string | null
  pdf_path: string | null
  video_path: string | null
  sort_order: number
  imageUrl?: string | null
  pdfUrl?: string | null
  videoUrl?: string | null
  created_at?: string
  updated_at?: string
}

export interface LessonItem {
  id: string
  subject_id: string
  title: string
  explanation: string
  image_path?: string | null
  pdf_path?: string | null
  video_path?: string | null
  imageUrl?: string | null
  pdfUrl?: string | null
  videoUrl?: string | null
  sort_order: number
  created_by: string
  created_at: string
  updated_at: string
  subject?: {
    id: string
    name: string
  } | null
  sections?: LessonSectionItem[]
  sectionsCount?: number
}

export interface LessonSectionInput {
  id?: string
  title: string
  content: string
  image_path?: string | null
  pdf_path?: string | null
  video_path?: string | null
  sort_order: number
}

export interface CreateLessonInput {
  id: string
  subject_id: string
  title: string
  explanation: string
  image_path?: string | null
  pdf_path?: string | null
  video_path?: string | null
  sort_order: number
  sections: LessonSectionInput[]
}

export interface UpdateLessonInput {
  id: string
  subject_id: string
  title: string
  explanation: string
  image_path?: string | null
  pdf_path?: string | null
  video_path?: string | null
  sort_order: number
  sections: LessonSectionInput[]
}

export interface LessonActionResult {
  success: boolean
  message: string
  data?: LessonItem | null
}
