export interface Profile {
    id: string
    email: string
    role: 'super_admin' | 'client'
    subscription_status: 'active' | 'inactive' | 'trial'
    created_at: string
}

export interface Site {
    id: string
    owner_id: string
    name: string
    subdomain: string
    content: any // We will define this strictly later
    is_published: boolean
    created_at: string
    updated_at: string
    profiles?: { // Joined data
        email: string
    }
}
