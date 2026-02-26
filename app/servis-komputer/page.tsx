"use client"

import { useRouter } from "next/navigation"
import ServisKomputerScreen from "@/app/main/servis/komputer/page"
import { screenToPath, type Screen } from "@/types/navigation"

export default function ServisKomputerPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return <ServisKomputerScreen navigate={navigate} />
}
