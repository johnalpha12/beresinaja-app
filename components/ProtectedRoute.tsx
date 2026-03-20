// components/ProtectedRoute.tsx
"use client"

import { useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation" // untuk Next.js App Router
import { PageLoader } from "@/components/ui/PageLoader"
import type { UserRole } from "@/types/user"

interface Props {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[] // opsional untuk role-based access
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : requiredRole
      ? [requiredRole]
      : null

  useEffect(() => {
    if (!loading) {
      // Jika tidak ada user, redirect ke login
      if (!user) {
        router.push("/login")
        return
      }

      // Jika ada requiredRole dan role tidak sesuai
      if (allowedRoles && (!userData?.role || !allowedRoles.includes(userData.role))) {
        router.push("/unauthorized") // atau ke halaman lain
        return
      }
    }
  }, [allowedRoles, user, loading, userData, router])

  // Tampilkan loading
  if (loading) {
    return <PageLoader message="Memverifikasi akses..." />
  }

  // Jika tidak ada user, jangan render apapun (redirect sudah di-handle di useEffect)
  if (!user) {
    return null
  }

  // Jika ada requiredRole tapi tidak sesuai
  if (allowedRoles && (!userData?.role || !allowedRoles.includes(userData.role))) {
    return null
  }

  // Render children jika semua kondisi terpenuhi
  return <>{children}</>
}
