import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const apiKey = searchParams.get('key') // The Client's unique key

    if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 401 })

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // 1. Find Client
    const { data: client } = await supabase.from('clients').select('id').eq('api_key', apiKey).single()

    if (!client) return NextResponse.json({ error: 'Invalid Key' }, { status: 403 })

    // 2. Get their content
    const { data: content } = await supabase.from('site_content').select('section_name, content').eq('client_id', client.id)

    // 3. Reformatted for easier use
    // Result: { "hero": { "title": "..." }, "pricing": { ... } }
    const formatted = content?.reduce((acc, curr) => ({
        ...acc,
        [curr.section_name]: curr.content
    }), {})

    return NextResponse.json(formatted)
}