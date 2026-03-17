// contexts/AuthContext.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User } from "firebase/auth"
import { subscribeToAuthChanges, logoutUser, ensureUserProfile } from "@/lib/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface UserData {
  uid: string
  fullName: string
  email: string
  phone: string
  role: "pengguna" | "teknisi"
  createdAt: number
  city?: string
  stats?: {
    services: number
    transactions: number
    sellItems: number
  }
  premium?: {
    isActive: boolean
    expiresAt: number | null
    benefits: string[]
  }
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setUser(user)
      
      if (user) {
        // Ambil data tambahan dari Firestore
        try {
          await ensureUserProfile(user)
          const snapshot = await getDoc(doc(db, "users", user.uid))
          if (snapshot.exists()) {
            setUserData(snapshot.data() as UserData)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        }
      } else {
        setUserData(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    await logoutUser()
    // State akan otomatis ter-update via subscribeToAuthChanges
  }

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
