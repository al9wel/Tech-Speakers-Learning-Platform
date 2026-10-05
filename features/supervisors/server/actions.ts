'use server'

import { revalidatePath } from 'next/cache'
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  type ActionResult,
} from '@/features/users/server/actions'
import { supervisorFormSchema, type SupervisorFormValues } from '../schemas/supervisor.schema'

export async function createSupervisorAction(data: SupervisorFormValues): Promise<ActionResult> {
  const validated = supervisorFormSchema.safeParse(data)
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message || 'بيانات المشرف غير صالحة',
    }
  }

  const res = await createUserAction({
    full_name: validated.data.full_name,
    email: validated.data.email,
    role: 'supervisor',
  })

  if (res.success) {
    revalidatePath('/admin/supervisors')
    revalidatePath('/admin/users')
  }

  return res
}

export async function updateSupervisorAction(data: SupervisorFormValues): Promise<ActionResult> {
  if (!data.user_id) {
    return {
      success: false,
      message: 'معرف المشرف مطلوب للتعديل',
    }
  }

  const validated = supervisorFormSchema.safeParse(data)
  if (!validated.success) {
    return {
      success: false,
      message: validated.error.issues[0]?.message || 'بيانات المشرف غير صالحة',
    }
  }

  const res = await updateUserAction({
    user_id: data.user_id,
    full_name: validated.data.full_name,
    email: validated.data.email,
    role: 'supervisor',
  })

  if (res.success) {
    revalidatePath('/admin/supervisors')
    revalidatePath('/admin/users')
  }

  return res
}

export async function deleteSupervisorAction(userId: string): Promise<ActionResult> {
  const res = await deleteUserAction(userId)
  if (res.success) {
    revalidatePath('/admin/supervisors')
    revalidatePath('/admin/users')
  }
  return res
}
