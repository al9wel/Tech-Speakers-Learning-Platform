'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { contributionFormSchema } from '../schemas/contribution.schema'
import type {
  CreateContributionInput,
  ContributionActionResult,
} from '../types'

const BUCKET_NAME = 'lesson-media'

export async function createContributionAction(
  input: CreateContributionInput
): Promise<ContributionActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const validated = contributionFormSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات المساهمة غير صالحة',
      }
    }

    const { subject_id, title, content, image_path, pdf_path, video_path } = validated.data

    const { data: newContribution, error } = await supabase
      .from('student_contributions')
      .insert({
        student_id: user.id,
        subject_id,
        title,
        content,
        image_path: image_path || null,
        pdf_path: pdf_path || null,
        video_path: video_path || null,
        status: 'pending',
      })
      .select(`
        *,
        student:profiles (
          id,
          full_name,
          role
        ),
        subject:subjects (
          id,
          name
        )
      `)
      .single()

    if (error) {
      console.error('Error creating contribution:', error)
      return { success: false, message: 'حدث خطأ أثناء حفظ المساهمة. يرجى المحاولة ثانية.' }
    }

    // Generate signed URLs if files were uploaded
    let imageUrl: string | null = null
    let pdfUrl: string | null = null
    let videoUrl: string | null = null

    if (newContribution.image_path) {
      const { data: imgData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(newContribution.image_path, 3600 * 24)
      imageUrl = imgData?.signedUrl ?? null
    }

    if (newContribution.pdf_path) {
      const { data: pdfData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(newContribution.pdf_path, 3600 * 24)
      pdfUrl = pdfData?.signedUrl ?? null
    }

    if (newContribution.video_path) {
      const { data: vidData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(newContribution.video_path, 3600 * 24)
      videoUrl = vidData?.signedUrl ?? null
    }

    revalidatePath('/student/contributions')
    revalidatePath('/supervisor/contributions')

    return {
      success: true,
      message: 'تم إرسال مساهمتك بنجاح! ستظهر للجميع بعد مراجعتها واعتمادها من قبل المشرف.',
      contribution: {
        ...newContribution,
        imageUrl,
        pdfUrl,
        videoUrl,
      },
    }
  } catch (err) {
    console.error('Unexpected error creating contribution:', err)
    return { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة ثانية.' }
  }
}

export async function approveContributionAction(
  id: string
): Promise<ContributionActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isSupervisorOrAdmin =
      profile?.role === 'supervisor' || profile?.role === 'admin'

    if (!isSupervisorOrAdmin) {
      return { success: false, message: 'غير مصرح لك باعتماد هذه المساهمة' }
    }

    const { data: updated, error } = await supabase
      .from('student_contributions')
      .update({ status: 'approved' })
      .eq('id', id)
      .select(`
        *,
        student:profiles (
          id,
          full_name,
          role
        ),
        subject:subjects (
          id,
          name
        )
      `)
      .single()

    if (error || !updated) {
      console.error('Error approving contribution:', error)
      return { success: false, message: 'تعذر اعتماد المساهمة. يرجى المحاولة ثانية.' }
    }

    revalidatePath('/student/contributions')
    revalidatePath('/supervisor/contributions')

    return {
      success: true,
      message: 'تم اعتماد ونشر المساهمة بنجاح!',
      contribution: updated as any,
    }
  } catch (err) {
    console.error('Unexpected error approving contribution:', err)
    return { success: false, message: 'حدث خطأ غير متوقع أثناء اعتماد المساهمة' }
  }
}

export async function deleteContributionAction(
  id: string
): Promise<ContributionActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const { data: existing } = await supabase
      .from('student_contributions')
      .select('id, student_id, image_path, pdf_path, video_path')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, message: 'المساهمة غير موجودة' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isSupervisorOrAdmin =
      profile?.role === 'supervisor' || profile?.role === 'admin'

    if (existing.student_id !== user.id && !isSupervisorOrAdmin) {
      return { success: false, message: 'غير مصرح لك بحذف هذه المساهمة' }
    }

    // Attempt to remove storage files if present
    const filesToRemove: string[] = []
    if (existing.image_path) filesToRemove.push(existing.image_path)
    if (existing.pdf_path) filesToRemove.push(existing.pdf_path)
    if (existing.video_path) filesToRemove.push(existing.video_path)

    if (filesToRemove.length > 0) {
      await supabase.storage.from(BUCKET_NAME).remove(filesToRemove)
    }

    const { error } = await supabase
      .from('student_contributions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting contribution:', error)
      return { success: false, message: 'تعذر حذف المساهمة. يرجى المحاولة ثانية.' }
    }

    revalidatePath('/student/contributions')

    return { success: true, message: 'تم حذف المساهمة بنجاح' }
  } catch (err) {
    console.error('Unexpected error deleting contribution:', err)
    return { success: false, message: 'حدث خطأ غير متوقع' }
  }
}
