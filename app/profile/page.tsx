"use client"

import { useRouter } from "next/navigation"
import ProfileScreen from "@/app/main/profile/page"
import { screenToPath, type Screen } from "@/types/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return <ProfileScreen navigate={navigate} />
}
