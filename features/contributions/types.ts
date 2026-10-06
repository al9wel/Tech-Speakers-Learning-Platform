export interface ContributionStudent {
  id: string
  full_name: string | null
  role: string
}

export interface ContributionSubject {
  id: string
  name: string
}

export interface ContributionItem {
  id: string
  student_id: string
  subject_id: string
  title: string
  content: string
  image_path: string | null
  pdf_path: string | null
  status: string
  created_at: string
  updated_at: string
  imageUrl?: string | null
  pdfUrl?: string | null
  student?: ContributionStudent | null
  subject?: ContributionSubject | null
}

export interface CreateContributionInput {
  subject_id: string
  title: string
  content: string
  image_path?: string | null
  pdf_path?: string | null
}

export interface ContributionActionResult {
  success: boolean
  message?: string
  contribution?: ContributionItem
}
