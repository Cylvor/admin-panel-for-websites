'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2, CheckCircle2, Copy } from 'lucide-react'
import { createClientSite } from './actions'

interface CreateSiteDialogProps {
    onSiteCreated: () => void
}

export function CreateSiteDialog({ onSiteCreated }: CreateSiteDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [tempPassword, setTempPassword] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    // Form state
    const [clientEmail, setClientEmail] = useState('')
    const [siteName, setSiteName] = useState('')
    const [subdomain, setSubdomain] = useState('')
    const [deployWebhookUrl, setDeployWebhookUrl] = useState('')

    // Auto-generate subdomain from site name
    const handleSiteNameChange = (value: string) => {
        setSiteName(value)
        const slug = value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
        setSubdomain(slug)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const result = await createClientSite({
            clientEmail,
            siteName,
            subdomain,
            deployWebhookUrl,
        })

        setLoading(false)

        if (result.success) {
            setSuccess(true)
            setTempPassword(result.tempPassword)
            onSiteCreated()
        } else {
            setError(result.error)
        }
    }

    const handleCopyPassword = async () => {
        if (tempPassword) {
            await navigator.clipboard.writeText(tempPassword)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleClose = () => {
        setOpen(false)
        // Reset state after animation
        setTimeout(() => {
            setError(null)
            setSuccess(false)
            setTempPassword(null)
            setCopied(false)
            setClientEmail('')
            setSiteName('')
            setSubdomain('')
            setDeployWebhookUrl('')
        }, 200)
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) handleClose()
            else setOpen(true)
        }}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Client Site
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                {success ? (
                    // ─── Success State ────────────────────────
                    <div className="space-y-4">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="h-5 w-5" />
                                Site Created Successfully
                            </DialogTitle>
                            <DialogDescription>
                                The client site has been created and the user account is ready.
                            </DialogDescription>
                        </DialogHeader>

                        {tempPassword && (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                                <p className="text-sm font-semibold text-amber-800">
                                    ⚠️ Temporary Password
                                </p>
                                <p className="text-xs text-amber-700">
                                    Share this password with the client. They should change it on first login.
                                </p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 rounded bg-white px-3 py-2 text-sm font-mono border">
                                        {tempPassword}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyPassword}
                                    >
                                        {copied ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {!tempPassword && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <p className="text-sm text-blue-800">
                                    An existing user was assigned as the site owner. No new credentials were created.
                                </p>
                            </div>
                        )}

                        <DialogFooter>
                            <Button onClick={handleClose}>Done</Button>
                        </DialogFooter>
                    </div>
                ) : (
                    // ─── Form State ──────────────────────────
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Create New Client Site</DialogTitle>
                            <DialogDescription>
                                Set up a new website for a client. A user account will be created automatically if one doesn&apos;t exist.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            {error && (
                                <Alert variant="destructive">
                                    <p className="text-sm">{error}</p>
                                </Alert>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="client-email">Client Email</Label>
                                <Input
                                    id="client-email"
                                    type="email"
                                    placeholder="client@example.com"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="site-name">Site Name</Label>
                                <Input
                                    id="site-name"
                                    placeholder="My Awesome Website"
                                    value={siteName}
                                    onChange={(e) => handleSiteNameChange(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="subdomain">Subdomain</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="subdomain"
                                        placeholder="my-awesome-website"
                                        value={subdomain}
                                        onChange={(e) => setSubdomain(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="flex-1"
                                    />
                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                        .example.com
                                    </span>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="webhook-url">
                                    Vercel Deploy Webhook URL
                                </Label>
                                <Input
                                    id="webhook-url"
                                    type="url"
                                    placeholder="https://api.vercel.com/v1/integrations/deploy/..."
                                    value={deployWebhookUrl}
                                    onChange={(e) => setDeployWebhookUrl(e.target.value)}
                                    disabled={loading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional. Used to trigger deployments when the client updates their site.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create Site
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
