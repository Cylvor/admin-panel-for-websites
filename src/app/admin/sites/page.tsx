'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, ExternalLink, Pencil } from 'lucide-react'

import { Site } from '@/lib/types'

export default function AllSitesPage() {
    const { profile, loading: authLoading } = useUser()
    const [sites, setSites] = useState<Site[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && profile?.role !== 'super_admin') {
            router.push('/admin/dashboard')
            return
        }

        const fetchSites = async () => {
            const { data } = await supabase
                .from('sites')
                .select('*, profiles(email)')
                .order('created_at', { ascending: false })

            if (data) setSites(data)
            setLoading(false)
        }

        if (profile?.role === 'super_admin') {
            fetchSites()
        }
    }, [authLoading, profile, router])

    if (authLoading || loading) return <div>Loading...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Sites</h1>
                    <p className="text-muted-foreground">Manage all client websites.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Site
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sites</CardTitle>
                    <CardDescription>List of all registered sites on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Subdomain</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sites.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No sites found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sites.map((site) => (
                                    <TableRow key={site.id}>
                                        <TableCell className="font-medium">{site.name}</TableCell>
                                        <TableCell>{site.subdomain}.example.com</TableCell>
                                        <TableCell>{site.profiles?.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={site.is_published ? "default" : "secondary"}>
                                                {site.is_published ? "Published" : "Draft"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/admin/sites/${site.id}/editor`}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/sites/${site.id}`} target="_blank">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
