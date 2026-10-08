import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth/require-role'
import { createClient } from '@/lib/supabase/server'
import { LessonForm } from '@/features/lessons/components/LessonForm'
import type { LessonItem, LessonSectionItem } from '@/features/lessons/types'
import { cache } from 'react'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

const getLesson = cache(async (id: string) => {
  const supabase = await createClient()
  return await supabase.from('lessons').select('*').eq('id', id).single()
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const { data: lesson } = await getLesson(id)
  return {
    title: lesson?.title ? `تعديل: ${lesson.title}` : 'تعديل الدرس',
  }
}

export default async function EditLessonPage({ params }: PageProps) {
  const { id: lessonId } = await params
  const [{ user, supabase }, { data: lesson, error: lessonError }] = await Promise.all([
    requireRole('teacher'),
    getLesson(lessonId),
  ])

  if (lessonError || !lesson || lesson.created_by !== user.id) {
    notFound()
  }

  // 2. Fetch sections and subjects in parallel
  const [
    { data: rawSections },
    { data: subjects },
  ] = await Promise.all([
    supabase
      .from('lesson_sections')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('sort_order', { ascending: true }),
    supabase
      .from('subjects')
      .select('id, name')
      .order('name', { ascending: true }),
  ])

  // 3. Generate signed URLs in parallel for lesson media and section media
  const [
    [signedLessonImg, signedLessonPdf, signedLessonVideo],
    sections,
  ] = await Promise.all([
    Promise.all([
      lesson.image_path
        ? supabase.storage.from('lesson-media').createSignedUrl(lesson.image_path, 3600 * 24)
        : Promise.resolve({ data: null }),
      lesson.pdf_path
        ? supabase.storage.from('lesson-media').createSignedUrl(lesson.pdf_path, 3600 * 24)
        : Promise.resolve({ data: null }),
      lesson.video_path
        ? supabase.storage.from('lesson-media').createSignedUrl(lesson.video_path, 3600 * 24)
        : Promise.resolve({ data: null }),
    ]),
    Promise.all(
      (rawSections ?? []).map(async (sec) => {
        const [signedImg, signedPdf, signedVideo] = await Promise.all([
          sec.image_path
            ? supabase.storage.from('lesson-media').createSignedUrl(sec.image_path, 3600 * 24)
            : Promise.resolve({ data: null }),
          sec.pdf_path
            ? supabase.storage.from('lesson-media').createSignedUrl(sec.pdf_path, 3600 * 24)
            : Promise.resolve({ data: null }),
          sec.video_path
            ? supabase.storage.from('lesson-media').createSignedUrl(sec.video_path, 3600 * 24)
            : Promise.resolve({ data: null }),
        ])

        return {
          ...sec,
          imageUrl: signedImg.data?.signedUrl ?? null,
          pdfUrl: signedPdf.data?.signedUrl ?? null,
          videoUrl: signedVideo.data?.signedUrl ?? null,
        }
      })
    ),
  ])

  const initialLesson: LessonItem & { sections: LessonSectionItem[] } = {
    ...lesson,
    imageUrl: signedLessonImg.data?.signedUrl ?? null,
    pdfUrl: signedLessonPdf.data?.signedUrl ?? null,
    videoUrl: signedLessonVideo.data?.signedUrl ?? null,
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
