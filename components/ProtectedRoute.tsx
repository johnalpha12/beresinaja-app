// components/ProtectedRoute.tsx
"use client"

import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation" // untuk Next.js App Router
import { PageLoader } from "@/components/ui/PageLoader"

interface Props {
  children: React.ReactNode
  requiredRole?: "pengguna" | "teknisi" // opsional untuk role-based access
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, userData, loading } = useAuth()
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
    return <PageLoader message="Memverifikasi akses..." />
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
