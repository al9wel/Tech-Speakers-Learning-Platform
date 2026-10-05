'use server'

import { revalidatePath } from 'next/cache'
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  type ActionResult,
} from '@/features/users/server/actions'
import { counselorFormSchema, type CounselorFormValues } from '../schemas/counselor.schema'

export async function createCounselorAction(data: CounselorFormValues): Promise<ActionResult> {
  const validated = counselorFormSchema.safeParse(data)
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message || 'بيانات المستشار غير صالحة',
    }
  }

  const res = await createUserAction({
    full_name: validated.data.full_name,
    email: validated.data.email,
    role: 'counselor',
  })

  if (res.success) {
    revalidatePath('/admin/counselors')
    revalidatePath('/admin/users')
  }

  return res
}

export async function updateCounselorAction(data: CounselorFormValues): Promise<ActionResult> {
  if (!data.user_id) {
    return {
      success: false,
      message: 'معرف المستشار مطلوب للتعديل',
    }
  }

  const validated = counselorFormSchema.safeParse(data)
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message || 'بيانات المستشار غير صالحة',
    }
  }

  const res = await updateUserAction({
    user_id: data.user_id,
    full_name: validated.data.full_name,
    email: validated.data.email,
    role: 'counselor',
  })

  if (res.success) {
    revalidatePath('/admin/counselors')
    revalidatePath('/admin/users')
  }

  return res
}

export async function deleteCounselorAction(userId: string): Promise<ActionResult> {
  const res = await deleteUserAction(userId)
  if (res.success) {
    revalidatePath('/admin/counselors')
    revalidatePath('/admin/users')
  }
  return res
}
