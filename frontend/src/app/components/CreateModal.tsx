'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { createContent } from '../lib/api'
import type { Content } from '../page';

interface CreateModalProps {
    isOpen: boolean
    onClose: () => void
    contents: Content[];
    setContents: React.Dispatch<React.SetStateAction<Content[]>>;
}

export default function CreateModal({ isOpen, onClose, contents, setContents }: CreateModalProps) {
    // const { setUser, setToken } = useAuth()
    const { user } = useAuth()
    const [qoute, setUsername] = useState('')
    // const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    // const [contents, setContents] = useState(false)

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const token = user?.token + ""
            const author = user?.name + ""

            const resp = await createContent(token, qoute, author)

            // console.log('CreateModel.resp', resp)
            // console.log('CreateModel.contents', contents)       
            
            //const newContent = { id: 'new-id', title: 'New Post' };
            // เมื่อสร้างเสร็จแล้ว ให้ใช้ setContents เพื่ออัปเดตค่า contents
            // setContents(contents => [...contents, resp]);
            setContents(contents => [resp, ...contents]);

            // setUser(user)
            // setToken(token)
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
                <h2 className="text-xl font-semibold mb-4">Create</h2>
                <form onSubmit={handleCreate}>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">คำคม/คำกวนๆ</label>                        
                        <input
                            type="text"
                            value={qoute}
                            onChange={(e) => setUsername(e.target.value)}
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
                        {loading ? 'Logging in...' : 'Create'}
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
