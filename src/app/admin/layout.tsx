'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const checkUser = async () => {
            // Don't check auth on login page
            if (pathname === '/admin/login') {
                setLoading(false)
                return
            }

            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/admin/login')
            } else {
                // Check for profile to get role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (!profile) {
                    // Handle edge case where auth exists but profile doesn't (shouldn't happen with triggers)
                } else if (profile.role !== 'super_admin') {
                    // Verify if the user is strict admin. If not, redirect to dashboard or 403
                    router.push('/dashboard')
                }
            }
            setLoading(false)
        }

        checkUser()
    }, [router, pathname])

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    // If on login page, don't show sidebar
    if (pathname === '/admin/login') {
        return <>{children}</>
    }

    return (
        <div className="flex h-screen bg-white">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
