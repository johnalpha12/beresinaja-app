"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { screenToPath } from "@/types/navigation"

export default function ProtectedRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(screenToPath("home"))
  }, [router])

  return null
}
