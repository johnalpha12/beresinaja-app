"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageLoader } from "@/components/ui/PageLoader"
import { useAuth } from "@/context/AuthContext"
import { homePathByRole, screenToPath } from "@/types/navigation"

export default function ProtectedRedirectPage() {
  const router = useRouter()
  const { user, userData, loading } = useAuth()

  useEffect(() => {
    if (loading) {
      return
    }

    if (!user) {
      router.replace(screenToPath("login"))
      return
    }

    router.replace(homePathByRole(userData?.role))
  }, [loading, router, user, userData?.role])

  return <PageLoader message="Mengarahkan ke beranda..." />
}
