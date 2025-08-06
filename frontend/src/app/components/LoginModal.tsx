'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { login } from '../lib/auth'

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
}



export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const { setUser, setToken } = useAuth()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const { id, username: _username, name, token } = await login({ username, password })

            // console.log('LoginModal.id', id)
            // console.log('LoginModal.username', _username)
            // console.log('LoginModal.name', name)
            // console.log('LoginModal.token', token)
            // setUser(user)
            // const user = {id:id, username:_username,name:name}
            const user = { id: id,
                username: _username,
                name: name,
                token: token,
            }
            setUser(user)
            setToken(token)
            onClose() // ปิด modal
        } catch (err: any) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed text-gray-900 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h2 className="text-xl font-semibold mb-4">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <button
                    onClick={onClose}
                    className="mt-4 w-full text-sm text-gray-600 hover:underline"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
