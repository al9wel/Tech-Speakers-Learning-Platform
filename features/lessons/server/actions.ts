'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createLessonActionSchema, updateLessonActionSchema } from '../schemas/lesson.schema'
import type { CreateLessonInput, LessonActionResult, UpdateLessonInput } from '../types'

const BUCKET_NAME = 'lesson-media'

export async function createLessonAction(input: CreateLessonInput): Promise<LessonActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً للمتابعة' }
    }

    // Verify user role is teacher or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
      return { success: false, message: 'هذه العملية مخصصة للمعلمين أو مسؤولي النظام' }
    }

    const validated = createLessonActionSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات الدرس غير صالحة',
      }
    }

    const { id, subject_id, title, explanation, sort_order, sections } = validated.data

    // 1. Insert lesson row with verified server-side created_by
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        id,
        subject_id,
        title,
        explanation,
        sort_order,
        created_by: user.id, // Strictly server-assigned
      })
      .select()
      .single()

    if (lessonError) {
      // Cleanup any storage files that were uploaded for sections
      const filesToClean = sections
        .flatMap((s) => [s.image_path, s.pdf_path, s.video_path])
        .filter(Boolean) as string[]
      if (filesToClean.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(filesToClean)
      }

      return {
        success: false,
        message: 'تعذر إنشاء الدرس في قاعدة البيانات. يرجى المحاولة مرة أخرى.',
      }
    }

    // 2. Insert sections if provided
    if (sections && sections.length > 0) {
      const sectionsToInsert = sections.map((sec, idx) => ({
        id: sec.id || crypto.randomUUID(),
        lesson_id: lesson.id,
        title: sec.title,
        content: sec.content,
        image_path: sec.image_path || null,
        pdf_path: sec.pdf_path || null,
        video_path: sec.video_path || null,
        sort_order: sec.sort_order ?? idx,
      }))

      const { error: sectionsError } = await supabase
        .from('lesson_sections')
        .insert(sectionsToInsert)

      if (sectionsError) {
        // Rollback created lesson
        await supabase.from('lessons').delete().eq('id', lesson.id)

        // Cleanup storage files
        const filesToClean = sections
          .flatMap((s) => [s.image_path, s.pdf_path, s.video_path])
          .filter(Boolean) as string[]
        if (filesToClean.length > 0) {
          await supabase.storage.from(BUCKET_NAME).remove(filesToClean)
        }

        return {
          success: false,
          message: 'تعذر حفظ أقسام الدرس. يرجى المحاولة مرة أخرى.',
        }
      }
    }

    revalidatePath('/teacher/lessons')
    revalidatePath('/student/subjects')
    revalidatePath(`/student/subjects/${subject_id}`)

    return {
      success: true,
      message: 'تمت إضافة الدرس بنجاح مع كامل أقسامه',
      data: lesson,
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'حدث خطأ غير متوقع أثناء حفظ الدرس',
    }
  }
}

export async function updateLessonAction(input: UpdateLessonInput): Promise<LessonActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً للمتابعة' }
    }

    // Verify user role is teacher or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
      return { success: false, message: 'هذه العملية مخصصة للمعلمين أو مسؤولي النظام' }
    }

    const validated = updateLessonActionSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات الدرس غير صالحة',
      }
    }

    const { id, subject_id, title, explanation, sort_order, sections } = validated.data

    // Fetch existing lesson to verify ownership
    const { data: existingLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingLesson) {
      return { success: false, message: 'الدرس غير موجود أو تم حذفه مسبقاً' }
    }

    if (existingLesson.created_by !== user.id && profile.role !== 'admin') {
      return { success: false, message: 'لا تملك صلاحية تعديل هذا الدرس' }
    }

    // 1. Update lesson fields
    const { error: updateLessonError } = await supabase
      .from('lessons')
      .update({
        subject_id,
        title,
        explanation,
        sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateLessonError) {
      return { success: false, message: 'تعذر تحديث بيانات الدرس' }
    }

    // 2. Synchronize sections
    const { data: currentDbSections } = await supabase
      .from('lesson_sections')
      .select('*')
      .eq('lesson_id', id)

    const existingDbSections = currentDbSections ?? []

    // Detect removed sections
    const incomingIds = new Set(sections.map((s) => s.id).filter(Boolean))
    const removedSections = existingDbSections.filter((s) => !incomingIds.has(s.id))

    // Remove deleted sections from DB
    if (removedSections.length > 0) {
      const removedIds = removedSections.map((s) => s.id)
      await supabase.from('lesson_sections').delete().in('id', removedIds)

      // Clean up files of removed sections from storage
      const removedFiles = removedSections
        .flatMap((s) => [s.image_path, s.pdf_path, s.video_path])
        .filter(Boolean) as string[]
      if (removedFiles.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(removedFiles)
      }
    }

    // Upsert remaining / new sections
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i]
      const order = sec.sort_order ?? i

      if (sec.id && existingDbSections.some((d) => d.id === sec.id)) {
        const oldSec = existingDbSections.find((d) => d.id === sec.id)!
        // If file was changed or removed, clean up old file
        if (oldSec.image_path && oldSec.image_path !== sec.image_path) {
          await supabase.storage.from(BUCKET_NAME).remove([oldSec.image_path])
        }
        if (oldSec.pdf_path && oldSec.pdf_path !== sec.pdf_path) {
          await supabase.storage.from(BUCKET_NAME).remove([oldSec.pdf_path])
        }
        if (oldSec.video_path && oldSec.video_path !== sec.video_path) {
          await supabase.storage.from(BUCKET_NAME).remove([oldSec.video_path])
        }

        await supabase
          .from('lesson_sections')
          .update({
            title: sec.title,
            content: sec.content,
            image_path: sec.image_path || null,
            pdf_path: sec.pdf_path || null,
            video_path: sec.video_path || null,
            sort_order: order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sec.id)
      } else {
        await supabase.from('lesson_sections').insert({
          id: sec.id || crypto.randomUUID(),
          lesson_id: id,
          title: sec.title,
          content: sec.content,
          image_path: sec.image_path || null,
          pdf_path: sec.pdf_path || null,
          video_path: sec.video_path || null,
          sort_order: order,
        })
      }
    }

    revalidatePath('/teacher/lessons')
    revalidatePath('/student/subjects')
    revalidatePath(`/student/subjects/${subject_id}`)
    revalidatePath(`/student/lessons/${id}`)

    return {
      success: true,
      message: 'تم تحديث الدرس وأقسامه بنجاح',
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'حدث خطأ غير متوقع أثناء تعديل الدرس',
    }
  }
}

export async function deleteLessonAction(lessonId: string): Promise<LessonActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً للمتابعة' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const { data: existingLesson, error: fetchError } = await supabase
      .from('lessons')
      .select('id, created_by, subject_id')
      .eq('id', lessonId)
      .single()

    if (fetchError || !existingLesson) {
      return { success: false, message: 'الدرس غير موجود أو تم حذفه مسبقاً' }
    }

    if (
      existingLesson.created_by !== user.id &&
      profile?.role !== 'admin' &&
      profile?.role !== 'supervisor'
    ) {
      return { success: false, message: 'لا تملك صلاحية حذف هذا الدرس' }
    }

    // 1. Collect all media files from sections
    const { data: sections } = await supabase
      .from('lesson_sections')
      .select('image_path, pdf_path, video_path')
      .eq('lesson_id', lessonId)

    const filesToRemove = (sections ?? [])
      .flatMap((s) => [s.image_path, s.pdf_path, s.video_path])
      .filter(Boolean) as string[]

    // 2. Delete sections and lesson
    await supabase.from('lesson_sections').delete().eq('lesson_id', lessonId)
    const { error: deleteLessonError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (deleteLessonError) {
      return { success: false, message: 'تعذر حذف الدرس من قاعدة البيانات' }
    }

    // 3. Remove files from storage
    if (filesToRemove.length > 0) {
      await supabase.storage.from(BUCKET_NAME).remove(filesToRemove)
    }

    revalidatePath('/teacher/lessons')
    revalidatePath('/supervisor/lessons')
    revalidatePath('/student/subjects')
    revalidatePath(`/student/subjects/${existingLesson.subject_id}`)

    return {
      success: true,
      message: 'تم حذف الدرس وكافة أقسامه وملفاته بنجاح',
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'حدث خطأ أثناء محاولة حذف الدرس',
    }
  }
}
