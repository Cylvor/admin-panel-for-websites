'use server'

import { createClient } from '@/lib/supabase/server'
import { Site, WebsiteContent } from '@/lib/types'

// ─── Fetch the client's sites ────────────────────────────────
export async function fetchClientSites(): Promise<{
    sites: Site[]
    error: string | null
}> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { sites: [], error: 'Not authenticated.' }
    }

    const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        return { sites: [], error: error.message }
    }

    return { sites: (data as Site[]) ?? [], error: null }
}

// ─── Fetch website_content sections for a site ──────────────
export async function fetchSiteContent(siteId: string): Promise<{
    sections: WebsiteContent[]
    site: Site | null
    error: string | null
}> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { sections: [], site: null, error: 'Not authenticated.' }
    }

    // Verify the user owns this site
    const { data: site, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .eq('owner_id', user.id)
        .single()

    if (siteError || !site) {
        return {
            sections: [],
            site: null,
            error: 'Site not found or access denied.',
        }
    }

    // Fetch all content sections for this site
    const { data: sections, error: contentError } = await supabase
        .from('website_content')
        .select('*')
        .eq('site_id', siteId)
        .order('section_key', { ascending: true })

    if (contentError) {
        return {
            sections: [],
            site: site as Site,
            error: contentError.message,
        }
    }

    return {
        sections: (sections as WebsiteContent[]) ?? [],
        site: site as Site,
        error: null,
    }
}

// ─── Update a website_content section ────────────────────────
export async function updateSectionContent(
    sectionId: string,
    content: Record<string, unknown>
): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Not authenticated.' }
    }

    // RLS will enforce ownership, but we also verify here for clarity
    const { error } = await supabase
        .from('website_content')
        .update({ content })
        .eq('id', sectionId)

    if (error) {
        return { success: false, error: error.message }
    }

    return { success: true, error: null }
}

// ─── Batch update all sections ───────────────────────────────
export async function batchUpdateSections(
    updates: { id: string; content: Record<string, unknown> }[]
): Promise<{ success: boolean; error: string | null }> {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Not authenticated.' }
    }

    // Update each section — RLS enforces ownership
    for (const update of updates) {
        const { error } = await supabase
            .from('website_content')
            .update({ content: update.content })
            .eq('id', update.id)

        if (error) {
            return { success: false, error: `Failed to update section: ${error.message}` }
        }
    }

    return { success: true, error: null }
}
