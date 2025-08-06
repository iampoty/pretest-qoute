'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { editContent } from '../lib/api'
import type { Content } from '../page';

interface EditModalProps {
    isOpen: boolean
    onClose: () => void
    id: string
    contents: Content[];
    setContents: React.Dispatch<React.SetStateAction<Content[]>>;
}



export default function EditModal({ id, isOpen, onClose, contents, setContents }: EditModalProps) {
    // const { setUser, setToken } = useAuth()
    const { user } = useAuth()
    const [qoute, setQoute] = useState('')
    // const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    // const [contents, setContents] = useState(false)

    // สมมติว่านี่คือโค้ดที่คุณต้องการทำใน onClick หรือ function อื่นๆ
    const updateAndMoveContent = (targetId: string, newTitle: string) => {
        // 1. หา content ที่มี id ตรงกัน
        const contentToUpdate = contents.find(c => c.id === targetId);

        // ถ้าหาเจอ ให้ทำขั้นตอนต่อไป
        if (contentToUpdate) {
            // 2. แก้ไข title ของ content นั้น
            const updatedContent = {
                ...contentToUpdate,
                title: newTitle
            };

            // 3. กรอง array เดิม เพื่อนำ content ที่แก้ไขแล้วออก
            const otherContents = contents.filter(c => c.id !== targetId);

            // 4. สร้าง array ใหม่ โดยเอา updatedContent มาไว้เป็นตัวแรก
            const newContents = [updatedContent, ...otherContents];

            // 5. อัปเดต State ด้วย array ใหม่
            setContents(newContents);
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const token = user?.token + ""
            // const author = user?.name + ""

            // console.log('EditModal.id', id)
            // console.log('EditModal.qoute', qoute)
            // console.log('EditModal.contents', contents)

            // ตัวอย่างการเรียกใช้:
            // สมมติว่าคุณกดปุ่มเพื่อแก้ไข title
            updateAndMoveContent(id, qoute);

            // const resp = 
            await editContent(token, id, qoute)
            // console.log('CreateModel.resp', resp)

            //const newContent = { id: 'new-id', title: 'New Post' };
            // เมื่อสร้างเสร็จแล้ว ให้ใช้ setContents เพื่ออัปเดตค่า contents
            // setContents(contents => [...contents, resp]);

            // setContents(contents);

            // setUser(user)
            // setToken(token)
            onClose() // ปิด modal
        } catch (err: any) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    // ใช้ useEffect เพื่อตั้งค่า qoute เมื่อ Modal เปิดหรือ id เปลี่ยน
    useEffect(() => {
        // หา content ที่มี id ตรงกัน
        const editContent = contents.find(content => content.id === id);
        if (editContent) {
            setQoute(editContent.title);
        }
    }, [id, contents]);

    // const editContent = contents.find(content => content.id === id);
    // console.log('editContent ', editContent)
    // setQoute(editContent?.title + '')
    if (!isOpen) return null

    return (
        <div className="fixed text-gray-900 inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <h2 className="text-xl font-semibold mb-4">Edit</h2>
                <form onSubmit={handleEdit}>
                    <div className="mb-3">
                        <label className="block text-sm font-medium mb-1">คำคม/คำกวนๆ</label>
                        <input
                            type="text"
                            value={qoute}
                            onChange={(e) => setQoute(e.target.value)}
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
                        {loading ? 'Logging in...' : 'Update'}
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
