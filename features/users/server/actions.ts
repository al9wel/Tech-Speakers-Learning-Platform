'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole } from '@/lib/auth/require-role'
import { isAppRole, type AppRole } from '@/lib/auth/roles'

const DEFAULT_PASSWORD = '123456789'

export async function createUser(formData: FormData) {
    await requireRole('admin')

    const email = formData.get('email')?.toString().trim() ?? ''
    const fullName = formData.get('full_name')?.toString().trim() ?? ''
    const roleInput = formData.get('role')?.toString().trim() ?? ''

    if (!email || !isAppRole(roleInput)) {
        redirect('/admin/users?error=Invalid email or role')
    }

    const role: AppRole = roleInput
    const admin = createAdminClient()

    // 1. Create auth user with default temporary password
    const { data, error } = await admin.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: fullName || null },
    })

    if (error || !data.user) {
        redirect('/admin/users?error=Unable to create user')
    }

    // 2. Set profile with selected role and name
    const { error: profileError } = await admin
        .from('profiles')
        .upsert({
            id: data.user.id,
            full_name: fullName || null,
            role,
        })

    if (profileError) {
        await admin.auth.admin.deleteUser(data.user.id)
        redirect('/admin/users?error=Unable to create user profile')
    }

    revalidatePath('/admin/users')
    redirect('/admin/users?success=' + encodeURIComponent(`User created with default temporary password: ${DEFAULT_PASSWORD}`))
}

export async function updateUser(formData: FormData) {
    await requireRole('admin')

    const userId = formData.get('user_id')?.toString().trim() ?? ''
    const email = formData.get('email')?.toString().trim() ?? ''
    const fullName = formData.get('full_name')?.toString().trim() ?? ''
    const roleInput = formData.get('role')?.toString().trim() ?? ''

    if (!userId || !email || !isAppRole(roleInput)) {
        redirect('/admin/users?error=Invalid user data')
    }

    const role: AppRole = roleInput
    const admin = createAdminClient()

    // 1. Update Auth email & metadata (no password)
    const { error: authError } = await admin.auth.admin.updateUserById(userId, {
        email,
        user_metadata: { full_name: fullName || null },
    })

    if (authError) {
        redirect('/admin/users?error=Unable to update user')
    }

    // 2. Update profile
    const { error: profileError } = await admin
        .from('profiles')
        .update({
            full_name: fullName || null,
            role,
        })
        .eq('id', userId)

    if (profileError) {
        redirect('/admin/users?error=Unable to update user profile')
    }

    revalidatePath('/admin/users')
    redirect('/admin/users?success=User updated successfully')
}

export async function deleteUser(formData: FormData) {
    const { user: currentAdmin } = await requireRole('admin')

    const userId = formData.get('user_id')?.toString().trim() ?? ''

    // Safety rule 1: Admin cannot delete himself
    if (!userId || userId === currentAdmin.id) {
        redirect('/admin/users?error=Admin cannot delete himself')
    }

    const admin = createAdminClient()

    // Safety rule 2: Do not delete the final remaining admin
    const { data: targetProfile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

    if (targetProfile?.role === 'admin') {
        const { count } = await admin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'admin')

        if ((count ?? 0) <= 1) {
            redirect('/admin/users?error=Cannot delete the final remaining admin')
        }
    }

    const { error } = await admin.auth.admin.deleteUser(userId)

    if (error) {
        redirect('/admin/users?error=Unable to delete user')
    }

    revalidatePath('/admin/users')
    redirect('/admin/users?success=User deleted successfully')
}
