'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { WebsiteContent } from '@/lib/types'
import { batchUpdateSections } from '../../actions'

// ─── Human-readable labels for section keys ──────────────────
const SECTION_LABELS: Record<string, string> = {
    hero: 'Hero Section',
    about: 'About Us',
    services: 'Services',
    contact: 'Contact Information',
    footer: 'Footer',
    navigation: 'Navigation',
    testimonials: 'Testimonials',
    pricing: 'Pricing',
    faq: 'FAQ',
    cta: 'Call to Action',
}

// ─── Human-readable labels for content field keys ────────────
const FIELD_LABELS: Record<string, string> = {
    title: 'Title',
    subtitle: 'Subtitle',
    heading: 'Heading',
    subheading: 'Subheading',
    description: 'Description',
    text: 'Text',
    body: 'Body Text',
    button_text: 'Button Text',
    button_url: 'Button URL',
    image_url: 'Image URL',
    email: 'Email Address',
    phone: 'Phone Number',
    address: 'Address',
    copyright: 'Copyright Text',
    company_name: 'Company Name',
    tagline: 'Tagline',
    hero_title: 'Hero Title',
    hero_subtitle: 'Hero Subtitle',
    about_text: 'About Us Text',
    cta_text: 'Call to Action Text',
    cta_url: 'Call to Action URL',
}

function formatFieldLabel(key: string): string {
    return (
        FIELD_LABELS[key] ??
        key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
    )
}

function formatSectionLabel(key: string): string {
    return (
        SECTION_LABELS[key] ??
        key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
    )
}

// ─── Determine if a field should use a textarea ──────────────
function isTextareaField(key: string, value: unknown): boolean {
    if (typeof value === 'string' && value.length > 100) return true
    const textareaKeys = ['description', 'text', 'body', 'about_text', 'address', 'bio']
    return textareaKeys.some((k) => key.includes(k))
}

// ─── Props ───────────────────────────────────────────────────
interface ContentEditorFormProps {
    sections: WebsiteContent[]
}

export function ContentEditorForm({ sections }: ContentEditorFormProps) {
    // Build editable state: map sectionId -> Record<string, string>
    const [editedContent, setEditedContent] = useState<
        Record<string, Record<string, string>>
    >(() => {
        const initial: Record<string, Record<string, string>> = {}
        for (const section of sections) {
            const fields: Record<string, string> = {}
            for (const [key, value] of Object.entries(section.content)) {
                fields[key] = typeof value === 'string' ? value : JSON.stringify(value)
            }
            initial[section.id] = fields
        }
        return initial
    })

    const [saving, setSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Track original values for reset
    const [originalContent] = useState(() => {
        const orig: Record<string, Record<string, string>> = {}
        for (const section of sections) {
            const fields: Record<string, string> = {}
            for (const [key, value] of Object.entries(section.content)) {
                fields[key] = typeof value === 'string' ? value : JSON.stringify(value)
            }
            orig[section.id] = fields
        }
        return orig
    })

    const handleFieldChange = (
        sectionId: string,
        fieldKey: string,
        value: string
    ) => {
        setEditedContent((prev) => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                [fieldKey]: value,
            },
        }))
        setHasChanges(true)
    }

    const handleReset = () => {
        setEditedContent(JSON.parse(JSON.stringify(originalContent)))
        setHasChanges(false)
        toast.info('Changes reverted to original values.')
    }

    const handleSave = async () => {
        setSaving(true)

        const updates = sections.map((section) => ({
            id: section.id,
            content: editedContent[section.id] as Record<string, unknown>,
        }))

        const result = await batchUpdateSections(updates)

        setSaving(false)

        if (result.success) {
            toast.success('All changes saved successfully!')
            setHasChanges(false)
        } else {
            toast.error(result.error ?? 'Failed to save changes. Please try again.')
        }
    }

    return (
        <div className="space-y-6">
            {/* ─── Section Cards ───────────────────────── */}
            {sections.map((section) => {
                const fields = editedContent[section.id] ?? {}
                const fieldEntries = Object.entries(fields)

                return (
                    <Card key={section.id}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {formatSectionLabel(section.section_key)}
                            </CardTitle>
                            <CardDescription>
                                Edit the content for the{' '}
                                <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                                    {section.section_key}
                                </code>{' '}
                                section of your website.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {fieldEntries.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">
                                    No editable fields in this section.
                                </p>
                            ) : (
                                <div className="grid gap-4">
                                    {fieldEntries.map(([fieldKey, fieldValue]) => (
                                        <div key={fieldKey} className="grid gap-2">
                                            <Label htmlFor={`${section.id}-${fieldKey}`}>
                                                {formatFieldLabel(fieldKey)}
                                            </Label>
                                            {isTextareaField(fieldKey, fieldValue) ? (
                                                <Textarea
                                                    id={`${section.id}-${fieldKey}`}
                                                    value={fieldValue}
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            section.id,
                                                            fieldKey,
                                                            e.target.value
                                                        )
                                                    }
                                                    rows={4}
                                                    className="resize-y"
                                                />
                                            ) : (
                                                <Input
                                                    id={`${section.id}-${fieldKey}`}
                                                    value={fieldValue}
                                                    onChange={(e) =>
                                                        handleFieldChange(
                                                            section.id,
                                                            fieldKey,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            })}

            {/* ─── Save Bar ────────────────────────────── */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t py-4 -mx-8 px-8 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {hasChanges ? (
                        <span className="text-amber-600 font-medium">
                            ● You have unsaved changes
                        </span>
                    ) : (
                        <span className="text-green-600">
                            ✓ All changes saved
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={!hasChanges || saving}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                    >
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
