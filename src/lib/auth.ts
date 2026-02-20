'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Profile } from '@/lib/types'

export function useUser() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function getUser() {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setUser(null)
                setProfile(null)
                setLoading(false)
                return
            }

            setUser(session.user)

            // Fetch profile
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (data) {
                setProfile(data as Profile)
            }

            setLoading(false)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                setUser(session.user)
                // Refetch profile on auth change
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                if (data) setProfile(data as Profile)
            } else {
                setUser(null)
                setProfile(null)
            }
            setLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return { user, profile, loading }
}
