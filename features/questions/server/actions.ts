'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { questionFormSchema, answerFormSchema } from '../schemas/question.schema'
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  CreateAnswerInput,
  QuestionActionResult,
} from '../types'

export async function createQuestionAction(
  input: CreateQuestionInput
): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    // Verify role is teacher or admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
      return { success: false, message: 'هذه العملية مخصصة للمعلمين أو مسؤولي النظام' }
    }

    const validated = questionFormSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'بيانات السؤال غير صالحة',
      }
    }

    const { lesson_id, title, content } = validated.data

    const { data: newQuestion, error } = await supabase
      .from('questions')
      .insert({
        lesson_id,
        title,
        content,
        created_by: user.id,
      })
      .select(`
        *,
        lesson:lessons (
          id,
          title,
          subject:subjects (
            id,
            name
          )
        ),
        author:profiles!questions_created_by_fkey (
          id,
          full_name,
          role
        )
      `)
      .single()

    if (error || !newQuestion) {
      return {
        success: false,
        message: error?.message || 'تعذر إضافة السؤال، يرجى المحاولة لاحقاً',
      }
    }

    revalidatePath('/teacher/questions')
    revalidatePath(`/teacher/lessons/${lesson_id}`)
    revalidatePath(`/student/lessons/${lesson_id}`)
    revalidatePath('/teacher/questions', 'page')
    revalidatePath(`/teacher/lessons/${lesson_id}`, 'page')
    revalidatePath(`/student/lessons/${lesson_id}`, 'page')

    return {
      success: true,
      message: 'تمت إضافة السؤال بنجاح',
      data: newQuestion,
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'حدث خطأ غير متوقع' }
  }
}

export async function updateQuestionAction(
  input: UpdateQuestionInput
): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    // Verify author or admin
    const { data: existing, error: fetchErr } = await supabase
      .from('questions')
      .select('created_by, lesson_id')
      .eq('id', input.id)
      .single()

    if (fetchErr || !existing) {
      return { success: false, message: 'السؤال غير موجود أو تم حذفه مسبقاً' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (existing.created_by !== user.id && profile?.role !== 'admin') {
      return { success: false, message: 'لا تملك صلاحية تعديل هذا السؤال' }
    }

    const { data: updated, error: updateErr } = await supabase
      .from('questions')
      .update({
        title: input.title,
        content: input.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .select(`
        *,
        lesson:lessons (
          id,
          title,
          subject:subjects (
            id,
            name
          )
        ),
        author:profiles!questions_created_by_fkey (
          id,
          full_name,
          role
        )
      `)
      .single()

    if (updateErr || !updated) {
      return { success: false, message: 'تعذر تعديل السؤال' }
    }

    revalidatePath('/teacher/questions')
    revalidatePath(`/teacher/lessons/${existing.lesson_id}`)
    revalidatePath(`/student/lessons/${existing.lesson_id}`)
    revalidatePath('/teacher/questions', 'page')
    revalidatePath(`/teacher/lessons/${existing.lesson_id}`, 'page')
    revalidatePath(`/student/lessons/${existing.lesson_id}`, 'page')

    return {
      success: true,
      message: 'تم تحديث السؤال بنجاح',
      data: updated,
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'حدث خطأ غير متوقع' }
  }
}

export async function deleteQuestionAction(id: string): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const { data: existing, error: fetchErr } = await supabase
      .from('questions')
      .select('created_by, lesson_id')
      .eq('id', id)
      .single()

    if (fetchErr || !existing) {
      return { success: false, message: 'السؤال غير موجود أو تم حذفه مسبقاً' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (existing.created_by !== user.id && profile?.role !== 'admin') {
      return { success: false, message: 'لا تملك صلاحية حذف هذا السؤال' }
    }

    const { error: delErr } = await supabase.from('questions').delete().eq('id', id)

    if (delErr) {
      return { success: false, message: 'تعذر حذف السؤال' }
    }

    revalidatePath('/teacher/questions')
    revalidatePath(`/teacher/lessons/${existing.lesson_id}`)
    revalidatePath(`/student/lessons/${existing.lesson_id}`)
    revalidatePath('/teacher/questions', 'page')
    revalidatePath(`/teacher/lessons/${existing.lesson_id}`, 'page')
    revalidatePath(`/student/lessons/${existing.lesson_id}`, 'page')

    return { success: true, message: 'تم حذف السؤال بنجاح' }
  } catch (err: any) {
    return { success: false, message: err?.message || 'حدث خطأ غير متوقع' }
  }
}

export async function createAnswerAction(
  input: CreateAnswerInput
): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول لإرسال الإجابة أو التعليق' }
    }

    const validated = answerFormSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message || 'محتوى الإجابة غير صالح',
      }
    }

    const { question_id, content } = validated.data

    const { data: question, error: qErr } = await supabase
      .from('questions')
      .select('lesson_id')
      .eq('id', question_id)
      .single()

    if (qErr || !question) {
      return { success: false, message: 'السؤال غير موجود' }
    }

    const { data: newAnswer, error } = await supabase
      .from('question_answers')
      .insert({
        question_id,
        user_id: user.id,
        content,
      })
      .select(`
        *,
        author:profiles!question_answers_user_id_fkey(
          id,
          full_name,
          role
        )
      `)
      .single()

    if (error || !newAnswer) {
      return { success: false, message: error?.message || 'تعذر إرسال الإجابة' }
    }

    revalidatePath('/teacher/questions')
    revalidatePath(`/teacher/lessons/${question.lesson_id}`)
    revalidatePath(`/student/lessons/${question.lesson_id}`)
    revalidatePath('/teacher/questions', 'page')
    revalidatePath(`/teacher/lessons/${question.lesson_id}`, 'page')
    revalidatePath(`/student/lessons/${question.lesson_id}`, 'page')

    return {
      success: true,
      message: 'تمت إضافة إجابتك بنجاح',
      data: newAnswer,
    }
  } catch (err: any) {
    return { success: false, message: err?.message || 'حدث خطأ غير متوقع' }
  }
}

export async function deleteAnswerAction(
  answerId: string
): Promise<QuestionActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'يرجى تسجيل الدخول أولاً' }
    }

    const { data: answer, error: fetchErr } = await supabase
      .from('question_answers')
      .select(`
        id,
        user_id,
        question_id,
        question:questions (
          created_by,
          lesson_id
        )
      `)
      .eq('id', answerId)
      .single()

    if (fetchErr || !answer) {
      return { success: false, message: 'الإجابة غير موجودة' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAuthor = answer.user_id === user.id
    const isQuestionAuthor = (answer.question as any)?.created_by === user.id
    const isAdmin = profile?.role === 'admin'

    if (!isAuthor && !isQuestionAuthor && !isAdmin) {
      return { success: false, message: 'لا تملك صلاحية حذف هذه الإجابة' }
    }

    const { error: delErr } = await supabase
      .from('question_answers')
      .delete()
      .eq('id', answerId)

    if (delErr) {
      return { success: false, message: 'تعذر حذف الإجابة' }
    }

    const lessonId = (answer.question as any)?.lesson_id
    revalidatePath('/teacher/questions')
    revalidatePath('/teacher/questions', 'page')
    if (lessonId) {
      revalidatePath(`/teacher/lessons/${lessonId}`)
      revalidatePath(`/student/lessons/${lessonId}`)
      revalidatePath(`/teacher/lessons/${lessonId}`, 'page')
      revalidatePath(`/student/lessons/${lessonId}`, 'page')
    }

    return { success: true, message: 'تم حذف الإجابة بنجاح' }
  } catch (err: any) {
    return { success: false, message: err?.message || 'حدث خطأ غير متوقع' }
  }
}
