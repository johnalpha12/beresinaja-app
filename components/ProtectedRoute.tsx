// components/ProtectedRoute.tsx
"use client"

import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useUserData } from "@/hooks/useUserData"
import { useRouter } from "next/navigation" // untuk Next.js App Router

interface Props {
  children: React.ReactNode
  requiredRole?: "pengguna" | "teknisi" // opsional untuk role-based access
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, loading: authLoading } = useAuth()
  const { userData, loading: userDataLoading } = useUserData()
  const loading = authLoading || userDataLoading
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Jika tidak ada user, redirect ke login
      if (!user) {
        router.push("/login")
        return
      }

      // Jika ada requiredRole dan role tidak sesuai
      if (requiredRole && userData?.role !== requiredRole) {
        router.push("/unauthorized") // atau ke halaman lain
        return
      }
    }
  }, [user, loading, userData, requiredRole, router])

  // Tampilkan loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  // Jika tidak ada user, jangan render apapun (redirect sudah di-handle di useEffect)
  if (!user) {
    return null
  }

  // Jika ada requiredRole tapi tidak sesuai
  if (requiredRole && userData?.role !== requiredRole) {
    return null
  }

  // Render children jika semua kondisi terpenuhi
  return <>{children}</>
}
