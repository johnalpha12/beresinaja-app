"use client"

import { useRouter } from "next/navigation"
import LoginScreen from "@/app/auth/login/page"
import { screenToPath, type Screen } from "@/types/navigation"

export default function LoginPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return <LoginScreen navigate={navigate} />
}
