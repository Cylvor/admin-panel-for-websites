'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RefreshCw, Globe } from 'lucide-react'
import Link from 'next/link'
import { Site, WebsiteContent } from '@/lib/types'
import { fetchClientSites, fetchSiteContent } from '../../actions'
import { ContentEditorForm } from './content-editor-form'

export default function SiteEditorPage() {
    const searchParams = useSearchParams()
    const siteIdParam = searchParams.get('siteId')

    const [site, setSite] = useState<Site | null>(null)
    const [sections, setSections] = useState<WebsiteContent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            setLoading(true)

            // If no siteId in query, fetch the client's first site
            let targetSiteId = siteIdParam

            if (!targetSiteId) {
                const sitesResult = await fetchClientSites()
                if (sitesResult.sites.length > 0) {
                    targetSiteId = sitesResult.sites[0].id
                } else {
                    setError('No sites assigned to your account.')
                    setLoading(false)
                    return
                }
            }

            const result = await fetchSiteContent(targetSiteId)
            setSite(result.site)
            setSections(result.sections)
            setError(result.error)
            setLoading(false)
        }

        load()
    }, [siteIdParam])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading editor...
            </div>
        )
    }

    if (error || !site) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">
                            {error ?? 'Site not found'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Please contact your admin if you believe this is an error.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* ─── Header ──────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {site.name}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <code className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                                {site.subdomain}
                            </code>
                            <Badge variant={site.is_published ? 'default' : 'secondary'}>
                                {site.is_published ? 'Published' : 'Draft'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Content Editor ──────────────────────── */}
            {sections.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No Content Sections</CardTitle>
                        <CardDescription>
                            Your site doesn&apos;t have any editable content sections yet.
                            Your admin needs to set up content sections for your site.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <ContentEditorForm sections={sections} />
            )}
        </div>
    )
}
