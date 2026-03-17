"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import {
  completeGoogleRedirectLogin,
  subscribeToAuthChanges,
  logoutUser,
  ensureUserProfile,
} from "@/lib/auth"
import type { UserData } from "@/types/user"

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
    let isMounted = true

    const syncUserProfile = async (nextUser: User | null) => {
      if (!isMounted) {
        return
      }

      setLoading(true)
      setUser(nextUser)

      if (!nextUser) {
        setUserData(null)
        setLoading(false)
        return
      }

      try {
        const profile = await ensureUserProfile(nextUser)

        if (!isMounted) {
          return
        }

        setUserData(profile)
      } catch (error) {
        console.error("Error fetching user data:", error)

        if (!isMounted) {
          return
        }

        setUserData(null)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    let unsubscribe = () => {}

    ;(async () => {
      try {
        await completeGoogleRedirectLogin()
      } catch (error) {
        console.error("Error completing Google redirect login:", error)
      }

      unsubscribe = subscribeToAuthChanges((nextUser) => {
        void syncUserProfile(nextUser)
      })
    })()

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const logout = async () => {
    await logoutUser()
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
