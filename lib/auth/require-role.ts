import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { rolePaths, isAppRole, type AppRole } from './roles'
import { verifySessionToken } from './session-token'

export async function requireRole(requiredRole: AppRole) {
    // 1. Check pre-validated session token from middleware to avoid duplicate network roundtrips
    try {
        const headersList = await headers()
        const sessionToken = headersList.get('x-auth-session')
        if (sessionToken) {
            const verified = await verifySessionToken(sessionToken)
            if (verified && isAppRole(verified.role)) {
                if (verified.role !== requiredRole) {
                    redirect(rolePaths[verified.role])
                }

                const supabase = await createClient()
                return {
                    user: {
                        id: verified.userId,
                        email: verified.email,
                    } as any,
                    profile: {
                        role: verified.role,
                        full_name: verified.fullName ?? '',
                    },
                    supabase,
                }
            }
        }
    } catch {
        // If headers cannot be accessed or verification fails, fallback to direct Supabase query
    }

    // 2. Direct Supabase verification fallback
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
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
        profile: {
            role: profile.role,
            full_name: profile.full_name ?? '',
        },
        supabase,
    }
}