'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Clients
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            +0% from last month
                        </p>
                    </CardContent>
                </Card>
                {/* Add more placeholder stats as needed */}
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Welcome to the Admin Dashboard. Select an option from the sidebar to get started.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
