// // contexts/AuthContext.tsx
// 'use client'

// import { createContext, useContext, useState, useEffect } from 'react'

// interface User {
//   id: string
//   username: string
//   name: string
//   token: string
// }

// interface AuthContextType {
//   user: User | null
//   setUser: (user: User | null) => void
//   token: string | null
//   setToken: (token: string | null) => void
//   logout: () => void
//   loading: boolean | true
// }


// export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   // const [user, setUser] = useState<User | null>(null)
//   // const [token, setToken] = useState<string | null>(null)
//   // const [loading, setLoading] = useState(true);

//   const [user, setUser] = useState<User | null>(() => {
//         if (typeof window !== 'undefined') {
//             const storedUser = localStorage.getItem("user");
//             return storedUser ? JSON.parse(storedUser) : null;
//         }
//         return null;
//     });
    
//     const [token, setToken] = useState<string | null>(() => {
//         if (typeof window !== 'undefined') {
//             return localStorage.getItem("token");
//         }
//         return null;
//     });

//     const [loading, setLoading] = useState(false); // ตั้งค่า loading เป็น false ทันที

//   useEffect(() => {
//     // จำลองการโหลดข้อมูลผู้ใช้
//     setTimeout(() => {
//       const fetchedUser = null; // หรือข้อมูลผู้ใช้ที่ล็อกอินแล้ว
//       setUser(fetchedUser);
//       setLoading(false); // เมื่อโหลดเสร็จ ให้ตั้งค่า loading เป็น false
//     }, 1000);
//   }, []);


//   useEffect(() => {
//     const storedUser = localStorage.getItem("user")
//     const storedToken = localStorage.getItem("token")
//     if (storedUser && storedToken) {
//       setUser(JSON.parse(storedUser))
//       setToken(storedToken)
//     }
//   }, [])

//   useEffect(() => {
//     if (user && token) {
//       localStorage.setItem("user", JSON.stringify(user))
//       localStorage.setItem("token", token)
//     } else {
//       console.log("AuthContext.!user && !token")
//       localStorage.removeItem("user")
//       localStorage.removeItem("token")
//     }
//   }, [user, token])

//   const logout = () => {
//     console.log("AuthContext.logout")
//     setUser(null)
//     setToken(null)
//     localStorage.removeItem('token')
//     localStorage.removeItem('user')
//   }

//   return (
//     <AuthContext.Provider value={{ loading, user, setUser, token, setToken, logout }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext)
//   if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
//   if (!context) throw new Error('useAuth must be used within AuthProvider')
//   return context
// }
