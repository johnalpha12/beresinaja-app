"use client"

import { useRouter } from "next/navigation"
import ServisPerangkatScreen from "@/app/(protected)/main/servis/perangkat/page"
import { screenToPath, type Screen } from "@/types/navigation"

export default function ServisPerangkatPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return <ServisPerangkatScreen navigate={navigate} />
}
