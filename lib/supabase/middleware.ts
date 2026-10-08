import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rolePaths, isAppRole } from '@/lib/auth/roles'
import { createSessionToken } from '@/lib/auth/session-token'

export async function updateSession(request: NextRequest) {
    // Strip incoming header to prevent spoofing from external clients
    request.headers.delete('x-auth-session')

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )

                    supabaseResponse = NextResponse.next({
                        request,
                    })

                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    const isPublicRoute =
        pathname === '/' ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/verify-email') ||
        pathname.startsWith('/error')

    if (!user) {
        if (!isPublicRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth'

            return NextResponse.redirect(url)
        }

        return supabaseResponse
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, is_approved')
        .eq('id', user.id)
        .single()

    if (!profile || !isAppRole(profile.role)) {
        const url = request.nextUrl.clone()
        url.pathname = '/error'

        return NextResponse.redirect(url)
    }

    if (profile.is_approved === false) {
        if (!pathname.startsWith('/auth/pending-approval')) {
            const url = request.nextUrl.clone()
            url.pathname = '/auth/pending-approval'
            return NextResponse.redirect(url)
        }
        return supabaseResponse
    }

    const role = profile.role
    const dashboardPath = rolePaths[role]

    const isAuthRoute =
        pathname === '/auth' || pathname.startsWith('/auth/')

    if (isAuthRoute) {
        const url = request.nextUrl.clone()
        url.pathname = dashboardPath

        return NextResponse.redirect(url)
    }

    const roleRoutes = [
        { path: '/student', role: 'student' },
        { path: '/teacher', role: 'teacher' },
        { path: '/admin', role: 'admin' },
        { path: '/supervisor', role: 'supervisor' },
        { path: '/counselor', role: 'counselor' },
    ] as const

    const matchedRoute = roleRoutes.find(
        (route) =>
            pathname === route.path ||
            pathname.startsWith(`${route.path}/`)
    )

    if (matchedRoute && matchedRoute.role !== role) {
        const url = request.nextUrl.clone()
        url.pathname = dashboardPath

        return NextResponse.redirect(url)
    }

    // Attach signed session token to request headers so Server Components (requireRole) can reuse auth result
    const sessionToken = await createSessionToken({
        userId: user.id,
        email: user.email || '',
        role,
        fullName: profile.full_name || '',
    })

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-auth-session', sessionToken)

    const finalResponse = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    // Forward any cookies updated during Supabase session refresh
    supabaseResponse.cookies.getAll().forEach((c) => {
        finalResponse.cookies.set(c)
    })

    return finalResponse
}