'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Dashboard() {
  const [clients, setClients] = useState<any[]>([])

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    const { data, error } = await supabase.from('clients').select('*')
    if (data) setClients(data)
  }

  async function createClient() {
    const name = prompt("Enter Client Name (e.g., Villa 95)")
    if (!name) return

    const { error } = await supabase.from('clients').insert([{ name }])
    if (!error) fetchClients() // Refresh list
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cylvor Command Center</h1>
        <Button onClick={createClient}>+ Add New Client</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clients.map((client) => (
          <Link href={`/client/${client.id}`} key={client.id}>
            <Card className="hover:bg-slate-50 cursor-pointer transition">
              <CardHeader>
                <CardTitle>{client.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">API Key: {client.api_key}</p>
                <span className={`text-xs px-2 py-1 rounded ${client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100'}`}>
                  {client.is_active ? 'Active' : 'Inactive'}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}