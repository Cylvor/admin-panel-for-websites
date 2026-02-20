'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ExternalLink, Pencil, Globe, RefreshCw } from 'lucide-react'
import { Site } from '@/lib/types'
import { fetchAllSites } from './actions'
import { CreateSiteDialog } from './create-site-dialog'

export default function AllSitesPage() {
    const [sites, setSites] = useState<Site[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadSites = useCallback(async () => {
        setLoading(true)
        const result = await fetchAllSites()
        setSites(result.sites)
        setError(result.error)
        setLoading(false)
    }, [])

    useEffect(() => {
        loadSites()
    }, [loadSites])

    return (
        <div className="space-y-6">
            {/* ─── Header ──────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Sites</h1>
                    <p className="text-muted-foreground">
                        Manage all client websites on the platform.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={loadSites}
                        disabled={loading}
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <CreateSiteDialog onSiteCreated={loadSites} />
                </div>
            </div>

            {/* ─── Stats ───────────────────────────────── */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Sites
                        </CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sites.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Published
                        </CardTitle>
                        <Badge variant="default" className="text-xs">Live</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sites.filter(s => s.is_published).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Drafts
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">Draft</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {sites.filter(s => !s.is_published).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ─── Error ───────────────────────────────── */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            {/* ─── Table ───────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle>Client Websites</CardTitle>
                    <CardDescription>
                        All registered sites and their assigned clients.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Loading sites...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Site Name</TableHead>
                                        <TableHead>Subdomain</TableHead>
                                        <TableHead>Client Email</TableHead>
                                        <TableHead>Webhook</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sites.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center py-12 text-muted-foreground"
                                            >
                                                <div className="flex flex-col items-center gap-2">
                                                    <Globe className="h-8 w-8 opacity-50" />
                                                    <p>No sites found. Create one to get started.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sites.map((site) => (
                                            <TableRow key={site.id}>
                                                <TableCell className="font-medium">
                                                    {site.name}
                                                </TableCell>
                                                <TableCell>
                                                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                        {site.subdomain}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    {site.profiles?.email ?? (
                                                        <span className="text-muted-foreground italic">
                                                            No owner
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {site.deploy_webhook_url ? (
                                                        <Badge variant="outline" className="text-xs">
                                                            Configured
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            Not set
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            site.is_published
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                    >
                                                        {site.is_published
                                                            ? 'Published'
                                                            : 'Draft'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                            title="Edit site"
                                                        >
                                                            <Link
                                                                href={`/admin/sites/${site.id}/editor`}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                            title="View live site"
                                                        >
                                                            <Link
                                                                href={`/sites/${site.id}`}
                                                                target="_blank"
                                                            >
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
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
