export type ArticleCategory = 'خبر' | 'مقال' | 'إعلان' | 'توجيه تربوي'

export interface ArticleAuthor {
  id: string
  full_name: string | null
  role: string
}

export interface ArticleItem {
  id: string
  author_id: string
  title: string
  content: string
  category: string
  image_path: string | null
  pdf_path: string | null
  video_path: string | null
  created_at: string
  updated_at: string
  imageUrl?: string | null
  pdfUrl?: string | null
  videoUrl?: string | null
  author?: ArticleAuthor | null
}

export interface CreateArticleInput {
  title: string
  content: string
  category: string
  image_path?: string | null
  pdf_path?: string | null
  video_path?: string | null
}

export interface UpdateArticleInput {
  id: string
  title: string
  content: string
  category: string
  image_path?: string | null
  pdf_path?: string | null
  video_path?: string | null
}

export interface ArticleActionResult {
  success: boolean
  message?: string
  article?: ArticleItem
}
