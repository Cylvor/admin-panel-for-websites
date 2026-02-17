'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useParams } from 'next/navigation'

export default function ClientEditor() {
    const { id } = useParams()
    const [sections, setSections] = useState<any[]>([])

    // Load data when page opens
    useEffect(() => {
        if (id) fetchSections()
    }, [id])

    async function fetchSections() {
        const { data } = await supabase.from('site_content').select('*').eq('client_id', id)
        setSections(data || [])
    }

    // Save changes to Supabase
    async function saveSection(sectionId: string, newContent: string) {
        try {
            const jsonContent = JSON.parse(newContent) // Validate JSON
            await supabase
                .from('site_content')
                .update({ content: jsonContent })
                .eq('id', sectionId)
            alert("Saved!")
        } catch (e) {
            alert("Invalid JSON format! Be careful.")
        }
    }

    async function addNewSection() {
        const name = prompt("Section Name (e.g., hero, gallery)")
        if (!name) return

        // Default empty JSON structure
        await supabase.from('site_content').insert([
            { client_id: id, section_name: name, content: { title: "New Title", text: "New Text" } }
        ])
        fetchSections()
    }

    return (
        <div className="p-10 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Editing Client Data</h1>

            {sections.map((section) => (
                <div key={section.id} className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
                    <h3 className="font-bold text-lg mb-2 capitalize">{section.section_name}</h3>

                    <p className="text-xs text-gray-400 mb-2">Edit the JSON below directly:</p>
                    <Textarea
                        defaultValue={JSON.stringify(section.content, null, 2)}
                        className="font-mono text-sm h-48 bg-slate-50"
                        onChange={(e) => {
                            // In a real app, use state. Here we are saving directly on button click using the ref/value approach 
                            // but for simplicity, imagine this updates a local state buffer.
                        }}
                        onBlur={(e) => saveSection(section.id, e.target.value)}
                    />
                    <div className="mt-2 text-right">
                        <span className="text-xs text-gray-400">Click outside box to save</span>
                    </div>
                </div>
            ))}

            <Button onClick={addNewSection} className="w-full mt-4" variant="outline">+ Add New Section</Button>
        </div>
    )
}