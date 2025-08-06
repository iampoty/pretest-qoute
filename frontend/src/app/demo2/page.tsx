'use client'

import { useContext, useEffect, useState } from 'react'
import LoginModal from '../components/LoginModal'
import { AuthContext } from '../contexts/AuthContext'
import { createContent, voteContent } from '../lib/api'

export default function HomePage() {
  const { user, showLoginModal, setShowLoginModal, token } = useContext(AuthContext)
  const [contents, setContents] = useState([])

  const handleCreate = async () => {
    if (!user) return setShowLoginModal(true)
    const res = await createContent(token, 'คนที่ทำให้เราหลง คือคนที่ส่งโลเคชั่นผิด')
    // console.log('Created:', res)
  }

  const handleVote = async (id: string) => {
    if (!user) return setShowLoginModal(true)
    const res = await voteContent(token, id)
    // console.log('Voted:', res)
  }

  return (
    <>
      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <div className="p-6">
        <button onClick={handleCreate} className="btn btn-primary">
          Create
        </button>
        <div className="mt-4 space-y-4">
          {contents.map((c: any) => (
            <div key={c._id} className="border p-4">
              <h3 className="text-xl font-semibold">{c.title}</h3>
              <p>{c.vote} votes</p>
              <button onClick={() => handleVote(c._id)} className="btn btn-secondary">
                Vote
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
