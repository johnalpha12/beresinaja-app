"use client"

import { useRouter } from "next/navigation"
import HomeScreen from "@/app/main/home/page"
import { screenToPath, type Screen } from "@/types/navigation"

export default function HomePage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return <HomeScreen navigate={navigate} />
}
