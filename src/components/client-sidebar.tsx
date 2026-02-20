'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Settings, LogOut, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/auth'
import { useEffect, useState } from 'react'

export function ClientSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const { profile, loading } = useUser()
    const [mounted, setMounted] = useState(false)
    const [clientSiteId, setClientSiteId] = useState<string | null>(null)

    useEffect(() => {
        setMounted(true)

        async function fetchClientSite() {
            if (profile?.role === 'client') {
                const { data } = await supabase
                    .from('sites')
                    .select('id')
                    .eq('owner_id', profile.id)
                    .single()
                if (data) setClientSiteId(data.id)
            }
        }
        if (profile) fetchClientSite()

    }, [profile])


    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (!mounted || loading) return null

    const sidebarItems = [
        {
            title: 'Overview',
            href: '/dashboard',
            icon: LayoutDashboard,
        },
        {
            title: 'My Site',
            href: clientSiteId ? `/dashboard/site/editor` : '#', // We will route this correctly
            icon: Globe,
        },
        {
            title: 'Settings',
            href: '/dashboard/settings',
            icon: Settings,
        },
    ]

    return (
        <div className="flex flex-col h-full border-r bg-slate-50/40 w-64">
            <div className="p-6">
                <h2 className="text-xl font-bold">
                    Client Panel
                </h2>
            </div>
            <div className="flex-1 px-4 py-2 space-y-2">
                {sidebarItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <span
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-slate-100",
                                pathname === item.href ? "bg-slate-100 text-slate-900" : "text-slate-500"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </span>
                    </Link>
                ))}
            </div>
            <div className="p-4 border-t">
                <div className="mb-4 px-2">
                    <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                    <p className="text-sm font-medium truncate" title={profile?.email ?? undefined}>{profile?.email}</p>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    )
}
