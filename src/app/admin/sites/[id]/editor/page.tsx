'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner' // Assuming user has sonner or use basic alert

export default function SiteEditor({ params }: { params: { id: string } }) {
    const { profile, loading: authLoading } = useUser()
    const [site, setSite] = useState<any>(null)
    const [heroTitle, setHeroTitle] = useState('')
    const [heroSubtitle, setHeroSubtitle] = useState('')
    const [bodyText, setBodyText] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchSite = async () => {
            const { data } = await supabase
                .from('sites')
                .select('*')
                .eq('id', params.id)
                .single()

            if (data) {
                // Verify ownership if not super admin
                // In a real app we'd have RLS, but double check in UI
                if (!authLoading && profile?.role !== 'super_admin' && data.owner_id !== profile?.id) {
                    router.push('/admin/dashboard')
                    return
                }

                setSite(data)
                const content = data.content || {}
                setHeroTitle(content.heroTitle || '')
                setHeroSubtitle(content.heroSubtitle || '')
                setBodyText(content.bodyText || '')
            }
            setLoading(false)
        }

        if (!authLoading) {
            fetchSite()
        }
    }, [params.id, authLoading, profile, router])

    const handleSave = async () => {
        setSaving(true)
        const newContent = {
            ...site.content,
            heroTitle,
            heroSubtitle,
            bodyText
        }

        const { error } = await supabase
            .from('sites')
            .update({ content: newContent })
            .eq('id', site.id)

        if (error) {
            alert('Error saving site')
        } else {
            alert('Site saved successfully!')
        }
        setSaving(false)
    }

    if (loading) return <div>Loading editor...</div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Site: {site?.name}</h1>
                <div className="space-x-2">
                    <Button variant="outline" onClick={() => window.open(`/sites/${site.id}`, '_blank')}>
                        Preview
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Hero Section</CardTitle>
                    <CardDescription>Customize the main banner of your homepage.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Hero Title</Label>
                        <Input
                            value={heroTitle}
                            onChange={(e) => setHeroTitle(e.target.value)}
                            placeholder="Welcome to our site"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Hero Subtitle</Label>
                        <Input
                            value={heroSubtitle}
                            onChange={(e) => setHeroSubtitle(e.target.value)}
                            placeholder="We do amazing things"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Main Content</CardTitle>
                    <CardDescription>Add text to your homepage.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label>Body Text</Label>
                        <Textarea
                            value={bodyText}
                            onChange={(e) => setBodyText(e.target.value)}
                            className="min-h-[200px]"
                            placeholder="Write something about your business..."
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
