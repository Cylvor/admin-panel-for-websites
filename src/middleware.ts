import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/auth/callback']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip middleware for public routes
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        const { supabaseResponse } = await updateSession(request)
        return supabaseResponse
    }

    // Get the authenticated user
    const { supabase, user, supabaseResponse } = await updateSession(request)

    // ─── Unauthenticated: redirect to /login ───
    if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
    }

    // ─── Fetch the user's role from the profiles table ───
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const role = profile?.role as string | undefined

    // ─── Role-Based Access Control ───

    // /admin/* routes — only super_admin
    if (pathname.startsWith('/admin')) {
        if (role !== 'super_admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    // /dashboard/* routes — only clients
    if (pathname.startsWith('/dashboard')) {
        if (role === 'super_admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/admin/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
