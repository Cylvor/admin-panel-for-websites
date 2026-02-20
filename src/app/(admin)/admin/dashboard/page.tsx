'use client'

import { useUser } from "@/lib/auth"
import { SuperAdminDashboard } from "./super-admin-view"

export default function DashboardPage() {
    const { loading } = useUser()

    if (loading) {
        return <div>Loading...</div>
    }

    return <SuperAdminDashboard />
}
