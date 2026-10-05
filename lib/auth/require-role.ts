import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { rolePaths, isAppRole, type AppRole } from './roles'

export async function requireRole(requiredRole: AppRole) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !isAppRole(profile.role)) {
        redirect('/error')
    }

    if (profile.role !== requiredRole) {
        redirect(rolePaths[profile.role])
    }

    return {
        user,
        profile,
        supabase,
    }
}