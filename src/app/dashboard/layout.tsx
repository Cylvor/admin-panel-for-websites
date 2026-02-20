'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ClientSidebar } from '@/components/client-sidebar'
import { useUser } from '@/lib/auth'

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { profile, loading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            if (!profile) {
                router.push('/admin/login')
            } else if (profile.role !== 'client') {
                // If super admin tries to access dashboard, maybe allow it for testing, or redirect to /admin
                // For now, let's redirect to /admin to keep it strict
                router.push('/admin/dashboard')
            }
        }
    }, [loading, profile, router])

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    if (!profile || profile.role !== 'client') return null

    return (
        <div className="flex h-screen bg-white">
            <ClientSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
