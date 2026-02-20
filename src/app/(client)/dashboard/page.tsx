'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Globe, Pencil, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Site } from '@/lib/types'
import { fetchClientSites } from './actions'

export default function ClientDashboardPage() {
    const [sites, setSites] = useState<Site[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadSites = useCallback(async () => {
        setLoading(true)
        const result = await fetchClientSites()
        setSites(result.sites)
        setError(result.error)
        setLoading(false)
    }, [])

    useEffect(() => {
        loadSites()
    }, [loadSites])

    const activeSite = sites[0] // Most clients will have one site

    return (
        <div className="space-y-6">
            {/* ─── Header ──────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your website content.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={loadSites}
                    disabled={loading}
                    title="Refresh"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* ─── Error ───────────────────────────────── */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                </div>
            )}

            {/* ─── Loading ─────────────────────────────── */}
            {loading && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Loading your sites...
                </div>
            )}

            {/* ─── No sites ───────────────────────────── */}
            {!loading && sites.length === 0 && !error && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">No Sites Assigned</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your admin hasn&apos;t assigned any sites to your account yet. Please contact your admin.
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* ─── Site Cards ──────────────────────────── */}
            {!loading && sites.length > 0 && (
                <>
                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Site Status
                                </CardTitle>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {activeSite?.is_published ? 'Published' : 'Draft'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {activeSite?.is_published
                                        ? 'Your site is live'
                                        : 'Your site is not published yet'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Subdomain
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <code className="text-lg font-bold bg-slate-100 px-2 py-1 rounded">
                                    {activeSite?.subdomain}
                                </code>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Deploy Webhook
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant={activeSite?.deploy_webhook_url ? 'default' : 'secondary'}>
                                    {activeSite?.deploy_webhook_url ? 'Configured' : 'Not set'}
                                </Badge>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sites List */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {sites.map((site) => (
                            <Card key={site.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{site.name}</CardTitle>
                                        <Badge variant={site.is_published ? 'default' : 'secondary'}>
                                            {site.is_published ? 'Live' : 'Draft'}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        <code className="text-xs">{site.subdomain}</code>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-end">
                                    <div className="flex gap-2">
                                        <Button asChild className="flex-1">
                                            <Link href={`/dashboard/site/editor?siteId=${site.id}`}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit Content
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="icon" asChild>
                                            <Link
                                                href={`/sites/${site.id}`}
                                                target="_blank"
                                                title="View live site"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
