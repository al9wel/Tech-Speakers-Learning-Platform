'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  counselingMessageSchema,
  counselingReplySchema,
} from '../schemas/counseling.schema'
import type {
  CounselingMessageItem,
  CounselingProfile,
  CounselingActionResult,
  CreateCounselingMessageInput,
  ReplyCounselingMessageInput,
} from '../types'

/**
 * Fetch all available counselors for students to choose from
 */
export async function getCounselorsAction(): Promise<{
  success: boolean
  counselors: CounselingProfile[]
  message?: string
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('role', 'counselor')
      .order('full_name', { ascending: true })

    if (error) {
      console.error('Error fetching counselors:', error)
      return { success: false, counselors: [], message: 'تعذر جلب قائمة المستشارين' }
    }

    return {
      success: true,
      counselors: (data as CounselingProfile[]) || [],
    }
  } catch (err) {
    console.error('Unexpected error in getCounselorsAction:', err)
    return { success: false, counselors: [], message: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Search/Fetch students for counselors to initiate messages
 */
export async function getStudentsAction(search?: string): Promise<{
  success: boolean
  students: CounselingProfile[]
  message?: string
}> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('role', 'student')

    if (search && search.trim()) {
      query = query.ilike('full_name', `%${search.trim()}%`)
    }

    const { data, error } = await query.order('full_name', { ascending: true }).limit(50)

    if (error) {
      console.error('Error fetching students:', error)
      return { success: false, students: [], message: 'تعذر جلب قائمة الطلاب' }
    }

    return {
      success: true,
      students: (data as CounselingProfile[]) || [],
    }
  } catch (err) {
    console.error('Unexpected error in getStudentsAction:', err)
    return { success: false, students: [], message: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Fetch counseling messages for the current student
 */
export async function getStudentCounselingMessagesAction(): Promise<{
  success: boolean
  messages: CounselingMessageItem[]
  message?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, messages: [], message: 'يرجى تسجيل الدخول' }
    }

    const { data, error } = await supabase
      .from('counseling_messages')
      .select(`
        *,
        student:profiles!counseling_messages_student_id_fkey(id, full_name, role),
        counselor:profiles!counseling_messages_counselor_id_fkey(id, full_name, role),
        sender:profiles!counseling_messages_sender_id_fkey(id, full_name, role),
        replies:counseling_replies(
          id,
          message_id,
          sender_id,
          content,
          created_at,
          author:profiles!counseling_replies_sender_id_fkey(id, full_name, role)
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching student counseling messages:', error)
      return { success: false, messages: [], message: 'تعذر جلب الرسائل والاستشارات' }
    }

    return {
      success: true,
      messages: (data as unknown as CounselingMessageItem[]) || [],
    }
  } catch (err) {
    console.error('Unexpected error in getStudentCounselingMessagesAction:', err)
    return { success: false, messages: [], message: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Fetch counseling messages for the current counselor
 */
export async function getCounselorMessagesAction(): Promise<{
  success: boolean
  messages: CounselingMessageItem[]
  message?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, messages: [], message: 'يرجى تسجيل الدخول' }
    }

    const { data, error } = await supabase
      .from('counseling_messages')
      .select(`
        *,
        student:profiles!counseling_messages_student_id_fkey(id, full_name, role),
        counselor:profiles!counseling_messages_counselor_id_fkey(id, full_name, role),
        sender:profiles!counseling_messages_sender_id_fkey(id, full_name, role),
        replies:counseling_replies(
          id,
          message_id,
          sender_id,
          content,
          created_at,
          author:profiles!counseling_replies_sender_id_fkey(id, full_name, role)
        )
      `)
      .eq('counselor_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching counselor messages:', error)
      return { success: false, messages: [], message: 'تعذر جلب رسائل واستشارات الطلاب' }
    }

    return {
      success: true,
      messages: (data as unknown as CounselingMessageItem[]) || [],
    }
  } catch (err) {
    console.error('Unexpected error in getCounselorMessagesAction:', err)
    return { success: false, messages: [], message: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Create a new counseling message / consultation
 * (Student -> Counselor OR Counselor -> Student)
 */
export async function createCounselingMessageAction(
  input: CreateCounselingMessageInput
): Promise<CounselingActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const validated = counselingMessageSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات الاستشارة غير صالحة',
      }
    }

    // Check user's profile role
    const { data: userProfile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (profileErr || !userProfile) {
      return { success: false, message: 'تعذر التحقق من بيانات المستخدم' }
    }

    let studentId: string
    let counselorId: string

    if (userProfile.role === 'counselor') {
      if (!input.student_id) {
        return { success: false, message: 'يرجى تحديد الطالب المستهدف' }
      }
      studentId = input.student_id
      counselorId = user.id
    } else {
      // Student is sending
      if (!input.counselor_id) {
        return { success: false, message: 'يرجى اختيار المستشار النفسي' }
      }
      studentId = user.id
      counselorId = input.counselor_id
    }

    const { data: newMessage, error } = await supabase
      .from('counseling_messages')
      .insert({
        student_id: studentId,
        counselor_id: counselorId,
        sender_id: user.id,
        title: validated.data.title.trim(),
        content: validated.data.content.trim(),
        status: 'pending',
      })
      .select(`
        *,
        student:profiles!counseling_messages_student_id_fkey(id, full_name, role),
        counselor:profiles!counseling_messages_counselor_id_fkey(id, full_name, role),
        sender:profiles!counseling_messages_sender_id_fkey(id, full_name, role)
      `)
      .single()

    if (error) {
      console.error('Error inserting counseling message:', error)
      return { success: false, message: 'تعذر إرسال الرسالة، يرجى المحاولة ثانية' }
    }

    revalidatePath('/student/counseling')
    revalidatePath('/counselor/students')

    return {
      success: true,
      message: 'تم إرسال الرسالة بنجاح',
      item: newMessage as unknown as CounselingMessageItem,
    }
  } catch (err) {
    console.error('Unexpected error in createCounselingMessageAction:', err)
    return { success: false, message: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Reply to a counseling message / consultation
 */
export async function replyCounselingMessageAction(
  input: ReplyCounselingMessageInput
): Promise<CounselingActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const validated = counselingReplySchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات الرد غير صالحة',
      }
    }

    // Fetch the target message
    const { data: targetMessage, error: fetchErr } = await supabase
      .from('counseling_messages')
      .select('id, student_id, counselor_id')
      .eq('id', validated.data.message_id)
      .single()

    if (fetchErr || !targetMessage) {
      return { success: false, message: 'الاستشارة غير موجودة أو تم حذفها' }
    }

    // Verify participant
    if (
      targetMessage.student_id !== user.id &&
      targetMessage.counselor_id !== user.id
    ) {
      return { success: false, message: 'ليس لديك صلاحية الرد على هذه الاستشارة' }
    }

    const isCounselor = targetMessage.counselor_id === user.id

    // Insert reply record
    const { data: newReply, error: replyErr } = await supabase
      .from('counseling_replies')
      .insert({
        message_id: targetMessage.id,
        sender_id: user.id,
        content: validated.data.content.trim(),
      })
      .select(`
        *,
        author:profiles!counseling_replies_sender_id_fkey(id, full_name, role)
      `)
      .single()

    if (replyErr) {
      console.error('Error inserting reply:', replyErr)
      return { success: false, message: 'تعذر حفظ الرد، يرجى المحاولة مجدداً' }
    }

    // Update message status
    const updatePayload: {
      status?: 'answered'
      response?: string
      response_at?: string
      responder_id?: string
      updated_at: string
    } = {
      updated_at: new Date().toISOString(),
    }

    if (isCounselor) {
      updatePayload.status = 'answered'
      updatePayload.response = validated.data.content.trim()
      updatePayload.response_at = new Date().toISOString()
      updatePayload.responder_id = user.id
    }

    await supabase
      .from('counseling_messages')
      .update(updatePayload)
      .eq('id', targetMessage.id)

    revalidatePath('/student/counseling')
    revalidatePath('/counselor/students')

    return {
      success: true,
      message: 'تم إرسال الرد بنجاح',
      reply: newReply as unknown as CounselingMessageItem['replies'] extends (infer R)[]
        ? R
        : never,
    }
  } catch (err) {
    console.error('Unexpected error in replyCounselingMessageAction:', err)
    return { success: false, message: 'حدث خطأ غير متوقع' }
  }
}

/**
 * Delete a counseling message
 */
export async function deleteCounselingMessageAction(
  messageId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول' }
    }

    const { error } = await supabase
      .from('counseling_messages')
      .delete()
      .eq('id', messageId)

    if (error) {
      console.error('Error deleting counseling message:', error)
      return { success: false, message: 'تعذر حذف الرسالة' }
    }

    revalidatePath('/student/counseling')
    revalidatePath('/counselor/students')

    return { success: true, message: 'تم حذف الرسالة بنجاح' }
  } catch (err) {
    console.error('Unexpected error in deleteCounselingMessageAction:', err)
    return { success: false, message: 'حدث خطأ غير متوقع' }
  }
}
