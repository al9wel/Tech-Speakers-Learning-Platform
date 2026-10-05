import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rolePaths, isAppRole } from '@/lib/auth/roles'

export async function updateSession(request: NextRequest) {
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
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/verify-email') ||
        pathname.startsWith('/error') ||
        pathname.startsWith('/auth')

    if (!user) {
        if (!isPublicRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'

            return NextResponse.redirect(url)
        }

        return supabaseResponse
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !isAppRole(profile.role)) {
        const url = request.nextUrl.clone()
        url.pathname = '/error'

        return NextResponse.redirect(url)
    }

    const role = profile.role
    const dashboardPath = rolePaths[role]

    const isLoginPage =
        pathname === '/login' || pathname.startsWith('/login/')

    const isSignupPage =
        pathname === '/signup' || pathname.startsWith('/signup/')

    if (isLoginPage || isSignupPage) {
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

    return supabaseResponse
}