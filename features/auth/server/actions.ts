'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { rolePaths, isAppRole } from '@/lib/auth/roles'

// Signup server action
export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email')?.toString() ?? ''
    const password = formData.get('password')?.toString() ?? ''

    if (!email || !password) {
        redirect('/error')
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/verify-email')
}

// Login server action
export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email')?.toString() ?? ''
    const password = formData.get('password')?.toString() ?? ''

    if (!email || !password) {
        redirect('/error')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error || !data.user) {
        redirect('/error')
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

    if (
        profileError ||
        !profile ||
        !isAppRole(profile.role)
    ) {
        await supabase.auth.signOut()
        redirect('/error')
    }

    revalidatePath('/', 'layout')

    redirect(rolePaths[profile.role])
}

export async function signout() {
    const supabase = await createClient()

    await supabase.auth.signOut()

    redirect('/login')
}

