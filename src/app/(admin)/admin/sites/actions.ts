'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Site } from '@/lib/types'
import crypto from 'crypto'

// ─── Fetch all sites with owner profiles ─────────────────────
export async function fetchAllSites(): Promise<{
    sites: Site[]
    error: string | null
}> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('sites')
        .select('*, profiles(email)')
        .order('created_at', { ascending: false })

    if (error) {
        return { sites: [], error: error.message }
    }

    return { sites: (data as Site[]) ?? [], error: null }
}

// ─── Create a new client site + auth user ────────────────────
interface CreateClientSiteInput {
    clientEmail: string
    siteName: string
    subdomain: string
    deployWebhookUrl: string
}

interface CreateClientSiteResult {
    success: boolean
    error: string | null
    tempPassword: string | null
}

export async function createClientSite(
    input: CreateClientSiteInput
): Promise<CreateClientSiteResult> {
    const { clientEmail, siteName, subdomain, deployWebhookUrl } = input

    // Validate inputs
    if (!clientEmail || !siteName || !subdomain) {
        return {
            success: false,
            error: 'Email, site name, and subdomain are required.',
            tempPassword: null,
        }
    }

    const adminSupabase = createAdminClient()
    const supabase = await createClient()

    // Step 1: Check if a user with this email already exists
    const { data: existingUsers } = await adminSupabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
        (u) => u.email === clientEmail
    )

    let userId: string

    if (existingUser) {
        // User already exists in auth — use their ID
        userId = existingUser.id
    } else {
        // Step 2: Create a new auth user with a temporary password
        const tempPassword = generateTempPassword()

        const { data: newUser, error: createError } =
            await adminSupabase.auth.admin.createUser({
                email: clientEmail,
                password: tempPassword,
                email_confirm: true, // Skip email verification
                user_metadata: { role: 'client' },
            })

        if (createError || !newUser.user) {
            return {
                success: false,
                error: createError?.message ?? 'Failed to create user.',
                tempPassword: null,
            }
        }

        userId = newUser.user.id

        // The DB trigger `handle_new_user` will auto-create the profile row.
        // Return the temp password so the admin can share it.
        // Step 3: Create the site
        const { error: siteError } = await supabase.from('sites').insert({
            owner_id: userId,
            name: siteName,
            subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ''),
            deploy_webhook_url: deployWebhookUrl || null,
            content: {},
        })

        if (siteError) {
            return {
                success: false,
                error: siteError.message,
                tempPassword: null,
            }
        }

        return {
            success: true,
            error: null,
            tempPassword: tempPassword,
        }
    }

    // If user already existed, just create the site
    const { error: siteError } = await supabase.from('sites').insert({
        owner_id: userId,
        name: siteName,
        subdomain: subdomain.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        deploy_webhook_url: deployWebhookUrl || null,
        content: {},
    })

    if (siteError) {
        return {
            success: false,
            error: siteError.message,
            tempPassword: null,
        }
    }

    return {
        success: true,
        error: null,
        tempPassword: null, // No temp password for existing users
    }
}

// ─── Helper ──────────────────────────────────────────────────
function generateTempPassword(): string {
    // Generate a secure 16-char temporary password
    return crypto.randomBytes(12).toString('base64url').slice(0, 16)
}
