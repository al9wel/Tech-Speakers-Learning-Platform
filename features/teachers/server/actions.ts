'use server'

import { revalidatePath } from 'next/cache'
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  type ActionResult,
} from '@/features/users/server/actions'
import { teacherFormSchema, type TeacherFormValues } from '../schemas/teacher.schema'

export async function createTeacherAction(data: TeacherFormValues): Promise<ActionResult> {
  const validated = teacherFormSchema.safeParse(data)
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message || 'بيانات المعلم غير صالحة',
    }
  }

  const res = await createUserAction({
    full_name: validated.data.full_name,
    email: validated.data.email,
    role: 'teacher',
  })

  if (res.success) {
    revalidatePath('/admin/teachers')
    revalidatePath('/admin/users')
  }

  return res
}

export async function updateTeacherAction(data: TeacherFormValues): Promise<ActionResult> {
  if (!data.user_id) {
    return {
      success: false,
      message: 'معرف المعلم مطلوب للتعديل',
    }
  }

  const validated = teacherFormSchema.safeParse(data)
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message || 'بيانات المعلم غير صالحة',
    }
  }

  const res = await updateUserAction({
    user_id: data.user_id,
    full_name: validated.data.full_name,
    email: validated.data.email,
    role: 'teacher',
  })

  if (res.success) {
    revalidatePath('/admin/teachers')
    revalidatePath('/admin/users')
  }

  return res
}

export async function deleteTeacherAction(userId: string): Promise<ActionResult> {
  const res = await deleteUserAction(userId)
  if (res.success) {
    revalidatePath('/admin/teachers')
    revalidatePath('/admin/users')
  }
  return res
}
