"use client"

import { useRouter } from "next/navigation"
import RegisterScreen from "@/app/auth/register/page"
import { screenToPath, type Screen } from "@/types/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return <RegisterScreen navigate={navigate} />
}
