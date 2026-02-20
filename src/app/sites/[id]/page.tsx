import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface SitePageProps {
    params: {
        domain: string
    }
}

// This is a simplified version. In a real app, you'd use middleware to rewrite subdomains to this path.
// For now, we'll access it via /sites/[id] for testing.
export default async function SitePage({ params }: { params: { id: string } }) {
    const { data: site } = await supabase
        .from('sites')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!site) {
        return notFound()
    }

    const content = site.content || {}

    return (
        <div className="min-h-screen bg-white">
            {/* Dynamic Header */}
            <header className="border-b py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{site.name}</h1>
                    <nav className="space-x-4">
                        <a href="#" className="text-sm font-medium hover:text-blue-600">Home</a>
                        <a href="#about" className="text-sm font-medium hover:text-blue-600">About</a>
                        <a href="#contact" className="text-sm font-medium hover:text-blue-600">Contact</a>
                    </nav>
                </div>
            </header>

            {/* Dynamic Hero */}
            <section className="py-20 bg-slate-50 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-extrabold mb-4">{content.heroTitle || "Welcome to our website"}</h2>
                    <p className="text-xl text-muted-foreground mb-8">{content.heroSubtitle || "We build amazing things."}</p>
                </div>
            </section>

            {/* Dynamic Content */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="prose max-w-none">
                        <p>{content.bodyText || "Add your content here..."}</p>
                    </div>
                </div>
            </section>
        </div>
    )
}
