export interface SubjectItem {
  id: string
  name: string
  created_by: string
  image_path: string | null
  imageUrl?: string | null
  created_at: string
  updated_at: string
}

export interface SubjectActionResult {
  success: boolean
  message: string
  data?: SubjectItem | null
}

export interface CreateSubjectInput {
  id: string
  name: string
  image_path?: string | null
}

export interface UpdateSubjectInput {
  id: string
  name: string
  image_path?: string | null
  remove_image?: boolean
}
