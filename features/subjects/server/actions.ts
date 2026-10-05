'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createSubjectActionSchema, updateSubjectActionSchema } from '../schemas/subject.schema'
import type { CreateSubjectInput, SubjectActionResult, UpdateSubjectInput } from '../types'

const BUCKET_NAME = 'lesson-media'

export async function createSubjectAction(input: CreateSubjectInput): Promise<SubjectActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    // Verify user role is supervisor or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'supervisor' && profile.role !== 'admin')) {
      return { success: false, message: 'هذه العملية تتطلب صلاحية مشرف تربوي أو مسؤول النظام' }
    }

    const validated = createSubjectActionSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات المادة غير صالحة',
      }
    }

    const { id, name, image_path } = validated.data

    // If an image_path is provided, verify it starts with user.id to enforce tenant security
    if (image_path && !image_path.startsWith(`${user.id}/`)) {
      return {
        success: false,
        message: 'مسار الصورة غير مصرح به',
      }
    }

    // Insert subject with specified ID and supervisor's ID
    const { data: subject, error: insertError } = await supabase
      .from('subjects')
      .insert({
        id,
        name,
        created_by: user.id,
        image_path: image_path || null,
      })
      .select('*')
      .single()

    if (insertError) {
      // If DB insert fails, cleanup the uploaded storage file
      if (image_path) {
        await supabase.storage.from(BUCKET_NAME).remove([image_path])
      }
      return {
        success: false,
        message: 'تعذر حفظ المادة في قاعدة البيانات. يرجى المحاولة مرة أخرى.',
      }
    }

    revalidatePath('/supervisor/subjects')
    revalidatePath('/student/subjects')
    revalidatePath('/teacher/lessons')
    return {
      success: true,
      message: 'تمت إضافة المادة الدراسية بنجاح',
      data: subject,
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'حدث خطأ غير متوقع أثناء إضافة المادة الدراسية',
    }
  }
}

export async function updateSubjectAction(input: UpdateSubjectInput): Promise<SubjectActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    // Verify user role is supervisor or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'supervisor' && profile.role !== 'admin')) {
      return { success: false, message: 'هذه العملية تتطلب صلاحية مشرف تربوي أو مسؤول النظام' }
    }

    const validated = updateSubjectActionSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات المادة غير صالحة',
      }
    }

    const { id, name, image_path, remove_image } = validated.data

    // Fetch existing subject
    const { data: existing, error: fetchError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return {
        success: false,
        message: 'المادة غير موجودة أو ليس لديك صلاحية تعديلها',
      }
    }

    let finalImagePath = existing.image_path

    if (image_path !== undefined) {
      // A new image was uploaded to Supabase Storage
      if (image_path && !image_path.startsWith(`${user.id}/`)) {
        return {
          success: false,
          message: 'مسار الصورة غير مصرح به',
        }
      }
      finalImagePath = image_path

      // If an old image existed and is different, remove it from storage
      if (existing.image_path && existing.image_path !== image_path) {
        await supabase.storage.from(BUCKET_NAME).remove([existing.image_path])
      }
    } else if (remove_image) {
      // The user chose to delete the existing image
      if (existing.image_path) {
        await supabase.storage.from(BUCKET_NAME).remove([existing.image_path])
      }
      finalImagePath = null
    }

    const { data: updatedSubject, error: updateError } = await supabase
      .from('subjects')
      .update({
        name,
        image_path: finalImagePath,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      return {
        success: false,
        message: 'تعذر حفظ التعديلات على المادة',
      }
    }

    revalidatePath('/supervisor/subjects')
    revalidatePath('/student/subjects')
    revalidatePath('/teacher/lessons')
    return {
      success: true,
      message: 'تم تحديث المادة الدراسية بنجاح',
      data: updatedSubject,
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'حدث خطأ غير متوقع أثناء تعديل المادة',
    }
  }
}

export async function deleteSubjectAction(subjectId: string): Promise<SubjectActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    // Verify user role is supervisor or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'supervisor' && profile.role !== 'admin')) {
      return { success: false, message: 'هذه العملية تتطلب صلاحية مشرف تربوي أو مسؤول النظام' }
    }

    if (!subjectId) {
      return { success: false, message: 'معرف المادة غير صالح' }
    }

    const { data: existing, error: fetchError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single()

    if (fetchError || !existing) {
      return {
        success: false,
        message: 'المادة غير موجودة أو تم حذفها مسبقاً',
      }
    }

    // Delete subject row
    const { error: deleteError } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId)

    if (deleteError) {
      return {
        success: false,
        message: 'تعذر حذف المادة الدراسية',
      }
    }

    // Clean up associated image from storage
    if (existing.image_path) {
      await supabase.storage.from(BUCKET_NAME).remove([existing.image_path])
    }

    revalidatePath('/supervisor/subjects')
    revalidatePath('/student/subjects')
    revalidatePath('/teacher/lessons')
    return {
      success: true,
      message: 'تم حذف المادة الدراسية بنجاح',
    }
  } catch (err: any) {
    return {
      success: false,
      message: 'حدث خطأ أثناء محاولة حذف المادة',
    }
  }
}
