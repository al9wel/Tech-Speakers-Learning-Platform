'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAppRole, rolePaths } from '@/lib/auth/roles'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !isAppRole(profile.role)) redirect('/error')

    const profilePath = `${rolePaths[profile.role]}/profile`
    const fullName = formData.get('full_name')?.toString().trim() ?? ''
    const email = formData.get('email')?.toString().trim() ?? ''

    if (!email) {
        redirect(profilePath + '?error=Email is required')
    }

    // Update email via Supabase Auth (current user's own session)
    if (email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email })
        if (error) {
            redirect(profilePath + '?error=Unable to update email')
        }
    }

    // Update full_name in profiles
    // Using admin client because there is no UPDATE RLS policy on profiles yet
    const admin = createAdminClient()
    const { error: profileError } = await admin
        .from('profiles')
        .update({ full_name: fullName || null })
        .eq('id', user.id)

    if (profileError) {
        redirect(profilePath + '?error=Unable to update profile')
    }

    revalidatePath(profilePath)
    redirect(profilePath + '?success=Profile updated successfully')
}

export async function changePassword(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !isAppRole(profile.role)) redirect('/error')

    const profilePath = `${rolePaths[profile.role]}/profile`
    const newPassword = formData.get('new_password')?.toString() ?? ''

    if (!newPassword || newPassword.length < 6) {
        redirect(profilePath + '?error=Password must be at least 6 characters')
    }

    // Change password using the current user's own session (NOT Admin API)
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
        redirect(profilePath + '?error=Unable to change password')
    }

    revalidatePath(profilePath)
    redirect(profilePath + '?success=Password changed successfully')
}
