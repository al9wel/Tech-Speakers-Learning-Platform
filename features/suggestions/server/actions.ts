'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { suggestionFormSchema } from '../schemas/suggestion.schema'
import type {
  CreateSuggestionInput,
  SuggestionActionResult,
  SuggestionStatus,
} from '../types'

export async function createSuggestionAction(
  input: CreateSuggestionInput
): Promise<SuggestionActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const validated = suggestionFormSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات المقترح غير صالحة',
      }
    }

    const { title, content, category } = validated.data

    const { data: newSuggestion, error } = await supabase
      .from('suggestions')
      .insert({
        user_id: user.id,
        title,
        content,
        category: category || 'عام',
        status: 'pending',
      })
      .select(`
        *,
        author:profiles (
          id,
          full_name,
          role
        )
      `)
      .single()

    if (error) {
      console.error('Error creating suggestion:', error)
      return { success: false, message: 'حدث خطأ أثناء إرسال المقترح. يرجى المحاولة ثانية.' }
    }

    revalidatePath('/student/suggestions')
    revalidatePath('/supervisor/suggestions')

    return {
      success: true,
      message: 'تم إرسال المقترح بنجاح ووصل إلى الإدارة',
      suggestion: newSuggestion,
    }
  } catch (err) {
    console.error('Unexpected error creating suggestion:', err)
    return { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة ثانية.' }
  }
}

export async function deleteSuggestionAction(
  id: string
): Promise<SuggestionActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    // Verify ownership or supervisor/admin role
    const { data: existing } = await supabase
      .from('suggestions')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (!existing) {
      return { success: false, message: 'المقترح غير موجود' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isSupervisorOrAdmin =
      profile?.role === 'supervisor' || profile?.role === 'admin'

    if (existing.user_id !== user.id && !isSupervisorOrAdmin) {
      return { success: false, message: 'غير مصرح لك بحذف هذا المقترح' }
    }

    const { error } = await supabase
      .from('suggestions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting suggestion:', error)
      return { success: false, message: 'تعذر حذف المقترح. يرجى المحاولة ثانية.' }
    }

    revalidatePath('/student/suggestions')
    revalidatePath('/supervisor/suggestions')

    return { success: true, message: 'تم حذف المقترح بنجاح' }
  } catch (err) {
    console.error('Unexpected error deleting suggestion:', err)
    return { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.' }
  }
}

export async function updateSuggestionStatusAction(
  id: string,
  status: SuggestionStatus,
  admin_reply?: string
): Promise<SuggestionActionResult> {
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

    if (
      !profile ||
      (profile.role !== 'supervisor' && profile.role !== 'admin')
    ) {
      return { success: false, message: 'هذه العملية مخصصة للمشرفين وإدارة النظام فقط' }
    }

    const updatePayload: { status: SuggestionStatus; admin_reply?: string | null; updated_at: string } = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (admin_reply !== undefined) {
      updatePayload.admin_reply = admin_reply.trim() || null
    }

    const { data: updated, error } = await supabase
      .from('suggestions')
      .update(updatePayload)
      .eq('id', id)
      .select(`
        *,
        author:profiles (
          id,
          full_name,
          role
        )
      `)
      .single()

    if (error) {
      console.error('Error updating suggestion status:', error)
      return { success: false, message: 'تعذر تحديث حالة المقترح' }
    }

    revalidatePath('/student/suggestions')
    revalidatePath('/supervisor/suggestions')

    return {
      success: true,
      message: 'تم تحديث حالة المقترح بنجاح',
      suggestion: updated,
    }
  } catch (err) {
    console.error('Unexpected error updating suggestion status:', err)
    return { success: false, message: 'حدث خطأ غير متوقع' }
  }
}
