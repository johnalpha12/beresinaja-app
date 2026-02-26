"use client"

import { useRouter } from "next/navigation"
import TrackingScreen from "@/app/(protected)/main/tracking/page"
import { screenToPath, type Screen } from "@/types/navigation"

export default function TrackingPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return <TrackingScreen navigate={navigate} />
}
