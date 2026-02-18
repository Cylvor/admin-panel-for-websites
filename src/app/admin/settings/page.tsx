'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

export default function AdminSettings() {
    const [email, setEmail] = useState('')
    const [newEmail, setNewEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) {
                setEmail(user.email)
            }
        }
        fetchUser()
    }, [])

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({ email: newEmail })
            if (error) throw error
            setMessage('Email update confirmation sent to new address.')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Passwords don't match")
            return
        }

        setLoading(true)
        setMessage(null)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            setMessage('Password updated successfully.')
            setPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            {message && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your admin account email address.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateEmail} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Current Email</Label>
                            <Input value={email} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="newEmail">New Email</Label>
                            <Input
                                id="newEmail"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="new.admin@example.com"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading}>Update Email</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your admin account password.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={loading}>Change Password</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
