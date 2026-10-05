'use server'

import { revalidatePath } from 'next/cache'
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  type ActionResult,
} from '@/features/users/server/actions'
import { studentFormSchema, type StudentFormValues } from '../schemas/student.schema'

export async function createStudentAction(data: StudentFormValues): Promise<ActionResult> {
  const validated = studentFormSchema.safeParse(data)
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message || 'بيانات الطالب غير صالحة',
    }
  }

  const res = await createUserAction({
    full_name: validated.data.full_name,
    email: validated.data.email,
    role: 'student',
  })

  if (res.success) {
    revalidatePath('/admin/students')
    revalidatePath('/admin/users')
  }

  return res
}

export async function updateStudentAction(data: StudentFormValues): Promise<ActionResult> {
  if (!data.user_id) {
    return {
      success: false,
      message: 'معرف الطالب مطلوب للتعديل',
    }
  }

  const validated = studentFormSchema.safeParse(data)
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message || 'بيانات الطالب غير صالحة',
    }
  }

  const res = await updateUserAction({
    user_id: data.user_id,
    full_name: validated.data.full_name,
    email: validated.data.email,
    role: 'student',
  })

  if (res.success) {
    revalidatePath('/admin/students')
    revalidatePath('/admin/users')
  }

  return res
}

export async function deleteStudentAction(userId: string): Promise<ActionResult> {
  const res = await deleteUserAction(userId)
  if (res.success) {
    revalidatePath('/admin/students')
    revalidatePath('/admin/users')
  }
  return res
}
