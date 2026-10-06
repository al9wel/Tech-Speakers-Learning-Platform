import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { createClient } from '@/lib/supabase/server'
import { LessonForm } from '@/features/lessons/components/LessonForm'
import type { LessonItem, LessonSectionItem } from '@/features/lessons/types'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: lesson } = await supabase.from('lessons').select('title').eq('id', id).single()
  return {
    title: lesson?.title ? `تعديل: ${lesson.title}` : 'تعديل الدرس',
  }
}

export default async function EditLessonPage({ params }: PageProps) {
  const { id: lessonId } = await params
  const { user, supabase } = await requireRole('teacher')

  // 1. Fetch lesson and verify teacher ownership
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (lessonError || !lesson) {
    notFound()
  }

  if (lesson.created_by !== user.id) {
    notFound()
  }

  // 2. Fetch sections
  const { data: rawSections } = await supabase
    .from('lesson_sections')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('sort_order', { ascending: true })

  // 3. Generate signed URLs for preview
  const sections: LessonSectionItem[] = await Promise.all(
    (rawSections ?? []).map(async (sec) => {
      let imageUrl: string | null = null
      let pdfUrl: string | null = null
      let videoUrl: string | null = null

      if (sec.image_path) {
        const { data: signedImg } = await supabase.storage
          .from('lesson-media')
          .createSignedUrl(sec.image_path, 3600 * 24)
        imageUrl = signedImg?.signedUrl ?? null
      }

      if (sec.pdf_path) {
        const { data: signedPdf } = await supabase.storage
          .from('lesson-media')
          .createSignedUrl(sec.pdf_path, 3600 * 24)
        pdfUrl = signedPdf?.signedUrl ?? null
      }

      if (sec.video_path) {
        const { data: signedVideo } = await supabase.storage
          .from('lesson-media')
          .createSignedUrl(sec.video_path, 3600 * 24)
        videoUrl = signedVideo?.signedUrl ?? null
      }

      return {
        ...sec,
        imageUrl,
        pdfUrl,
        videoUrl,
      }
    })
  )

  // 4. Fetch ALL subjects
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name', { ascending: true })

  const initialLesson: LessonItem & { sections: LessonSectionItem[] } = {
    ...lesson,
    sections,
  }

  return (
    <div className="container-page py-8 animate-page max-w-4xl mx-auto">
      <LessonForm
        subjects={subjects ?? []}
        initialLesson={initialLesson}
        currentUserId={user.id}
      />
    </div>
  )
}
