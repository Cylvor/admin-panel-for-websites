// ─── Profile ─────────────────────────────────────────────────
// Maps to the `profiles` table (1:1 with auth.users)
export interface Profile {
    id: string
    email: string | null
    role: 'super_admin' | 'client'
    subscription_status: 'active' | 'inactive' | 'trial'
    created_at: string
    updated_at: string
}

// ─── Site ────────────────────────────────────────────────────
// Maps to the `sites` table
export interface Site {
    id: string
    owner_id: string
    name: string
    subdomain: string
    content: SiteContent
    deploy_webhook_url: string | null
    is_published: boolean
    created_at: string
    updated_at: string
    // Joined data — populated when using `.select('*, profiles(email)')`
    profiles?: {
        email: string
    }
}

// Typed structure for the `sites.content` jsonb column
// Stores site-level configuration and metadata
export interface SiteContent {
    theme?: string
    logo_url?: string
    primary_color?: string
    meta_title?: string
    meta_description?: string
    [key: string]: unknown
}

// ─── Website Content ─────────────────────────────────────────
// Maps to the `website_content` table
// Stores per-section editable content for each site
export interface WebsiteContent {
    id: string
    site_id: string
    section_key: string
    content: Record<string, unknown>
    created_at: string
    updated_at: string
    // Joined data — populated when using `.select('*, sites(name)')`
    sites?: {
        name: string
    }
}

// ─── Helper types ────────────────────────────────────────────
// Insert types (omit auto-generated fields)
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>
export type SiteInsert = Omit<Site, 'id' | 'created_at' | 'updated_at' | 'profiles'>
export type WebsiteContentInsert = Omit<WebsiteContent, 'id' | 'created_at' | 'updated_at' | 'sites'>

// Update types (all fields optional except id)
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
export type SiteUpdate = Partial<Omit<Site, 'id' | 'created_at' | 'updated_at' | 'profiles'>>
export type WebsiteContentUpdate = Partial<Omit<WebsiteContent, 'id' | 'created_at' | 'updated_at' | 'sites'>>
