// contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  name: string
  token: string
}

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  token: string | null
  setToken: (token: string | null) => void
  logout: () => void
}


export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
  }, [])

  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user))
      localStorage.setItem("token", token)
    } else {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
    }
  }, [user, token])

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')  
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
