import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin client using the SERVICE_ROLE key.
 * ⚠️  ONLY use this in server-side code (Server Actions, Route Handlers).
 * Never import this in client components — the service role key bypasses RLS.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}
